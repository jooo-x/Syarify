import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Modul, MateriRow, IstilahRow, SoalRow, SkenarioRow,
  ModulRow, SkorRow, LeaderboardRow, MateriData, SumberRow,
} from '@/types';
import fallbackData from '@/data/materi.json';

const fb = fallbackData as MateriData;

// --------------- sumber lookup ---------------

export function getSumberMap(): Map<string, SumberRow> {
  const map = new Map<string, SumberRow>();
  for (const s of fb.meta?.sumber ?? []) {
    map.set(s.id, { ...s, tahun: s.tahun ?? null });
  }
  return map;
}

export function getSumberLabel(sumberId: string | null): string {
  if (!sumberId) return '';
  const map = getSumberMap();
  const s = map.get(sumberId);
  if (!s) return '';
  const tahun = s.tahun ? `, ${s.tahun}` : '';
  const judulSingkat = s.judul.length > 40 ? s.judul.slice(0, 40) + '…' : s.judul;
  return `${judulSingkat}${tahun}`;
}

// --------------- generic fetch helper ---------------

interface FetchState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function useFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  fallback: T,
): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: fallback,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetcher();
        if (!cancelled) setState({ data: result, loading: false, error: null });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat data';
        if (!cancelled) setState({ data: fallback, loading: false, error: msg });
      }
    })();
    return () => { cancelled = true; };
  }, [key]);

  return state;
}

// --------------- shuffle helper (Fisher-Yates) ---------------

export interface ShuffledSoal extends SoalRow {
  shuffledOpsi: string[];
  correctIndex: number;
}

export interface ShuffledSkenario extends SkenarioRow {
  shuffledOpsi: string[];
  correctIndex: number;
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function shuffleSoal(soalList: SoalRow[]): ShuffledSoal[] {
  return soalList.map((s) => {
    const origOpsi = Array.isArray(s.opsi) ? s.opsi : [];
    const correctText = s.jawaban_teks || origOpsi[s.jawaban] || '';
    const shuffledOpsi = fisherYatesShuffle(origOpsi);
    let correctIndex = -1;
    for (let i = 0; i < shuffledOpsi.length; i++) {
      if (shuffledOpsi[i] === correctText) { correctIndex = i; break; }
    }
    return { ...s, shuffledOpsi, correctIndex };
  });
}

export function shuffleSkenario(skenarioList: SkenarioRow[]): ShuffledSkenario[] {
  return skenarioList.map((s) => {
    const origOpsi = Array.isArray(s.opsi) ? s.opsi : [];
    const correctText = s.akad_benar || origOpsi[s.jawaban] || '';
    const shuffledOpsi = fisherYatesShuffle(origOpsi);
    let correctIndex = -1;
    for (let i = 0; i < shuffledOpsi.length; i++) {
      if (shuffledOpsi[i] === correctText) { correctIndex = i; break; }
    }
    return { ...s, shuffledOpsi, correctIndex };
  });
}

function fisherYatesShuffleItems<T>(arr: T[]): T[] {
  return fisherYatesShuffle(arr);
}

// --------------- hooks ---------------

export function useSumber(): FetchState<SumberRow[]> {
  const fallbackSumber: SumberRow[] = (fb.meta?.sumber ?? []).map(s => ({
    ...s,
    tahun: s.tahun ?? null,
  }));

  return useFetch('sumber', async () => {
    const { data, error } = await supabase.from('sumber').select('*').order('id');
    if (error) throw error;
    return (data ?? []) as SumberRow[];
  }, fallbackSumber);
}

export function useModuls(): FetchState<Modul[]> {
  const fallbackModuls: Modul[] = fb.modul
    .map((m, mi) => ({
      id: mi + 1,
      slug: m.slug,
      judul: m.judul,
      ringkasan: m.ringkasan,
      urutan: m.urutan,
      sumber_bab: m.sumber_bab,
      materi: m.materi.map((mat, i) => ({
        id: i + 1,
        modul_id: mi + 1,
        judul: mat.judul,
        isi: mat.isi,
        halaman_buku: mat.halaman_buku,
        perlu_verifikasi: mat.perlu_verifikasi ?? false,
        sumber_id: mat.sumber_id ?? null,
      })),
    }))
    .sort((a, b) => a.urutan - b.urutan);

  return useFetch('moduls', async () => {
    const { data: moduls, error: mErr } = await supabase
      .from('modul')
      .select('*')
      .order('urutan');
    if (mErr) throw mErr;
    if (!moduls || moduls.length === 0) throw new Error('Tidak ada modul');

    const { data: materis, error: matErr } = await supabase
      .from('materi')
      .select('*');
    if (matErr) throw matErr;

    const materiByModul = new Map<number, MateriRow[]>();
    for (const mat of (materis ?? [])) {
      const arr = materiByModul.get(mat.modul_id) ?? [];
      arr.push(mat);
      materiByModul.set(mat.modul_id, arr);
    }

    return (moduls as ModulRow[]).map((m) => ({
      ...m,
      materi: (materiByModul.get(m.id) ?? []).sort((a, b) => a.id - b.id),
    }));
  }, fallbackModuls);
}

export function useModul(slug: string | undefined): { modul: Modul | undefined; loading: boolean; error: string | null } {
  const { data: moduls, loading, error } = useModuls();
  return { modul: moduls.find((m) => m.slug === slug), loading, error };
}

export function useIstilah(): FetchState<IstilahRow[]> {
  const fallbackIstilah: IstilahRow[] = fb.istilah.map((i, idx) => ({
    id: idx + 1,
    istilah: i.istilah,
    arab: i.arab ?? null,
    arti: i.arti,
    contoh: i.contoh ?? null,
    modul_slug: i.modul_slug ?? null,
    sumber_id: i.sumber_id ?? null,
  }));

  return useFetch('istilah', async () => {
    const { data, error } = await supabase.from('istilah').select('*');
    if (error) throw error;
    return (data ?? []) as IstilahRow[];
  }, fallbackIstilah);
}

export function useSoal(modulSlug?: string): FetchState<SoalRow[]> {
  const fallbackSoal: SoalRow[] = fb.soal
    .filter((s) => !modulSlug || s.modul_slug === modulSlug)
    .map((s, idx) => ({
      id: idx + 1,
      modul_slug: s.modul_slug ?? null,
      pertanyaan: s.pertanyaan,
      opsi: s.opsi,
      jawaban: s.jawaban,
      jawaban_teks: s.jawaban_teks,
      penjelasan: s.penjelasan,
      sumber_id: s.sumber_id ?? null,
    }));

  return useFetch(`soal-${modulSlug ?? 'all'}`, async () => {
    let q = supabase.from('soal').select('*');
    if (modulSlug) q = q.eq('modul_slug', modulSlug);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as SoalRow[];
  }, fallbackSoal);
}

export function useSkenario(): FetchState<SkenarioRow[]> {
  const fallbackSkenario: SkenarioRow[] = fb.skenario_akad.map((s, idx) => ({
    id: idx + 1,
    cerita: s.cerita,
    akad_benar: s.akad_benar,
    opsi: s.opsi,
    jawaban: s.jawaban,
    penjelasan: s.penjelasan,
    sumber_id: s.sumber_id ?? null,
  }));

  return useFetch('skenario', async () => {
    const { data, error } = await supabase.from('skenario_akad').select('*');
    if (error) throw error;
    return (data ?? []) as SkenarioRow[];
  }, fallbackSkenario);
}

export function useLeaderboard(): FetchState<LeaderboardRow[]> {
  return useFetch('leaderboard', async () => {
    const { data, error } = await supabase.from('leaderboard').select('*');
    if (error) throw error;
    return (data ?? []) as LeaderboardRow[];
  }, []);
}

export async function submitSkor(skor: Omit<SkorRow, 'id' | 'dibuat'>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('skor').insert(skor);
  return { error: error ? 'Gagal menyimpan skor' : null };
}

// --------------- quiz session: pick N random soal ---------------

export function pickRandomSoal(allSoal: SoalRow[], count: number): SoalRow[] {
  return fisherYatesShuffleItems(allSoal).slice(0, Math.min(count, allSoal.length));
}

// --------------- progress (localStorage) ---------------

export function useProgress() {
  const key = 'paham-syariah-progress';
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(completed));
    } catch { /* ignore */ }
  }, [completed]);

  const toggleComplete = useCallback((id: string) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return { completed, toggleComplete };
}

// --------------- nickname (localStorage) ---------------

const NICK_KEY = 'paham-syariah-nama';

export function useNamaPanggilan() {
  const [nama, setNamaState] = useState<string>(() => {
    try {
      return localStorage.getItem(NICK_KEY) ?? '';
    } catch {
      return '';
    }
  });

  const setNama = useCallback((n: string) => {
    const trimmed = n.trim().slice(0, 20);
    setNamaState(trimmed);
    try {
      localStorage.setItem(NICK_KEY, trimmed);
    } catch { /* ignore */ }
  }, []);

  const isValid = nama.length >= 2 && nama.length <= 20;

  return { nama, setNama, isValid };
}

// --------------- daily streak (localStorage) ---------------

const STREAK_KEY = 'paham-syariah-streak';

interface StreakData {
  count: number;
  lastDate: string;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as StreakData;
  } catch { /* ignore */ }
  return { count: 0, lastDate: '' };
}

function saveStreak(data: StreakData) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(loadStreak);

  const today = todayStr();
  const isActiveToday = streak.lastDate === today;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const isStale = streak.lastDate !== today && streak.lastDate !== yesterdayStr;
  const currentCount = isStale ? 0 : streak.count;

  const recordActivity = useCallback(() => {
    const now = todayStr();
    setStreak((prev) => {
      if (prev.lastDate === now) return prev;
      const yd = new Date();
      yd.setDate(yd.getDate() - 1);
      const wasYesterday = prev.lastDate === yd.toISOString().slice(0, 10);
      const next: StreakData = {
        count: wasYesterday ? prev.count + 1 : 1,
        lastDate: now,
      };
      saveStreak(next);
      return next;
    });
  }, []);

  return { streakCount: currentCount, isActiveToday, recordActivity };
}
