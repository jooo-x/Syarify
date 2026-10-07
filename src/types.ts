// DB row types (match the Supabase schema)

export interface SumberRow {
  id: string;
  jenis: string;
  judul: string;
  penulis: string;
  tahun: number | null;
  catatan: string;
}

export interface ModulRow {
  id: number;
  slug: string;
  judul: string;
  ringkasan: string | null;
  urutan: number;
  sumber_bab: string | null;
}

export interface MateriRow {
  id: number;
  modul_id: number;
  judul: string;
  isi: string;
  halaman_buku: string | null;
  perlu_verifikasi: boolean;
  sumber_id: string | null;
}

export interface IstilahRow {
  id: number;
  istilah: string;
  arab: string | null;
  arti: string;
  contoh: string | null;
  modul_slug: string | null;
  sumber_id: string | null;
}

export interface SoalRow {
  id: number;
  modul_slug: string | null;
  pertanyaan: string;
  opsi: string[];
  jawaban: number;
  jawaban_teks: string;
  penjelasan: string;
  sumber_id: string | null;
}

export interface SkenarioRow {
  id: number;
  cerita: string;
  akad_benar: string;
  opsi: string[];
  jawaban: number;
  penjelasan: string;
  sumber_id: string | null;
}

export interface SkorRow {
  id?: number;
  nama_panggilan: string;
  poin: number;
  sumber: 'kuis' | 'simulasi' | 'tantangan_harian';
  dibuat?: string;
}

export interface LeaderboardRow {
  nama_panggilan: string;
  total_poin: number;
  permainan: number;
}

// Composite types used by the UI (modul with nested materi)
export interface Modul extends ModulRow {
  materi: MateriRow[];
}

// Re-export for backward compatibility
export type Materi = MateriRow;
export type Istilah = IstilahRow;
export type Soal = SoalRow;
export type SkenarioAkad = SkenarioRow;

// The full data shape (used by JSON fallback)
export interface MateriData {
  meta?: {
    sumber?: SumberRow[];
    catatan?: string;
    versi?: string;
    dikecualikan?: Array<{ judul: string; alasan: string }>;
  };
  modul: Array<{
    slug: string;
    judul: string;
    ringkasan: string;
    urutan: number;
    sumber_bab: string;
    materi: Array<{
      judul: string;
      isi: string;
      halaman_buku: string;
      perlu_verifikasi: boolean;
      sumber_id: string;
    }>;
  }>;
  istilah: Array<{
    istilah: string;
    arab: string;
    arti: string;
    contoh: string;
    modul_slug: string;
    sumber_id: string;
  }>;
  soal: Array<{
    modul_slug: string;
    pertanyaan: string;
    opsi: string[];
    jawaban: number;
    jawaban_teks: string;
    penjelasan: string;
    sumber_id: string;
  }>;
  skenario_akad: Array<{
    cerita: string;
    akad_benar: string;
    opsi: string[];
    jawaban: number;
    penjelasan: string;
    sumber_id: string;
  }>;
}
