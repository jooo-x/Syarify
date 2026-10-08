import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';
import { useSettings } from '@/context/SettingsContext';
import { useModuls, useModul, useProgress, useIstilah, getSumberLabel } from '@/hooks/useMateri';
import { useMemo } from 'react';
import { SpeechButton } from '@/components/SpeechButton';

export function BelajarPage() {
  const { navigate } = useRouter();
  const { data: moduls, loading, error } = useModuls();
  const { completed } = useProgress();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" aria-hidden="true" />
        <p className="text-sm text-gray-500 mt-3">Memuat modul belajar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-ink mb-1">Modul belajar</h1>
        <p className="text-sm text-gray-500">Pilih modul untuk mulai belajar langkah demi langkah.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-warning-50 border border-warning-200/50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-warning-600 shrink-0" aria-hidden="true" />
          <p className="text-xs text-warning-700">Data dari cadangan lokal. Koneksi mungkin bermasalah.</p>
        </div>
      )}

      {moduls.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-500">Belum ada modul tersedia.</p>
        </div>
      )}

      {moduls.map((modul, idx) => {
        const materiDone = modul.materi.filter((_, i) => completed.includes(`${modul.slug}-${i}`)).length;
        const allDone = modul.materi.length > 0 && materiDone === modul.materi.length;

        return (
          <button
            key={modul.slug}
            onClick={() => navigate({ name: 'modul', slug: modul.slug })}
            className="w-full bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft hover:shadow-card hover:border-primary-300 transition-all text-left active:scale-[0.98] animate-slide-up"
            style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}
            aria-label={`Buka modul ${modul.judul}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${allDone ? 'bg-success-100 text-success-600' : 'bg-primary-50 text-primary-600'}`}>
                {allDone ? <CheckCircle2 className="w-6 h-6" aria-hidden="true" /> : <BookOpen className="w-6 h-6" aria-hidden="true" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                    Modul {modul.urutan}
                  </span>
                  {allDone && (
                    <span className="text-xs font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">Selesai</span>
                  )}
                </div>
                <h2 className="font-bold text-ink mb-1 leading-snug">{modul.judul}</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{modul.ringkasan}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{modul.materi.length} materi</span>
                  <span>{materiDone}/{modul.materi.length} selesai</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 shrink-0 mt-1" aria-hidden="true" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ModulPage({ slug }: { slug: string }) {
  const { navigate, goBack } = useRouter();
  const { modul, loading } = useModul(slug);
  const { completed } = useProgress();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" aria-hidden="true" />
        <p className="text-sm text-gray-500 mt-3">Memuat modul...</p>
      </div>
    );
  }

  if (!modul) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Modul tidak ditemukan.</p>
        <button onClick={goBack} className="mt-4 text-primary-600 font-medium min-h-[44px]">Kembali</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors min-h-[44px]" aria-label="Kembali ke daftar modul">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Kembali
      </button>

      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl2 p-5 md:p-6 shadow-card">
        <span className="text-xs font-semibold text-accent-200 uppercase tracking-wide">Modul {modul.urutan}</span>
        <h1 className="text-xl md:text-2xl font-bold mt-1 mb-2">{modul.judul}</h1>
        <p className="text-sm text-primary-100 leading-relaxed">{modul.ringkasan}</p>
        {modul.sumber_bab && <p className="text-xs text-primary-200 mt-3">Sumber: {modul.sumber_bab}</p>}
      </div>

      <div className="space-y-3">
        {modul.materi.map((materi, idx) => {
          const done = completed.includes(`${modul.slug}-${idx}`);
          return (
            <button
              key={materi.id ?? idx}
              onClick={() => navigate({ name: 'materi', slug: modul.slug, materiIndex: idx })}
              className="w-full bg-white rounded-xl2 p-4 border border-primary-100 shadow-soft hover:shadow-card transition-all text-left active:scale-[0.98] flex items-center gap-3 min-h-[64px]"
              aria-label={`Buka materi ${materi.judul}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${done ? 'bg-success-100 text-success-600' : 'bg-primary-50 text-primary-600'}`}>
                {done ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : <Circle className="w-5 h-5" aria-hidden="true" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-sm text-ink leading-snug">{materi.judul}</h3>
                {materi.halaman_buku && <p className="text-xs text-gray-400 mt-0.5">{materi.halaman_buku}</p>}
              </div>
              {materi.perlu_verifikasi && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warning-600 bg-warning-50 px-2 py-1 rounded-full shrink-0">
                  <HelpCircle className="w-3 h-3" aria-hidden="true" />
                  Sedang diverifikasi
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MateriPage({ slug, materiIndex }: { slug: string; materiIndex: number }) {
  const { navigate, goBack } = useRouter();
  const { settings } = useSettings();
  const { modul, loading } = useModul(slug);
  const termMap = useTermMap();
  const { completed, toggleComplete } = useProgress();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" aria-hidden="true" />
        <p className="text-sm text-gray-500 mt-3">Memuat materi...</p>
      </div>
    );
  }

  if (!modul || materiIndex < 0 || materiIndex >= modul.materi.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Materi tidak ditemukan.</p>
        <button onClick={goBack} className="mt-4 text-primary-600 font-medium min-h-[44px]">Kembali</button>
      </div>
    );
  }

  const materi = modul.materi[materiIndex];
  const progressId = `${modul.slug}-${materiIndex}`;
  const isDone = completed.includes(progressId);
  const hasPrev = materiIndex > 0;
  const hasNext = materiIndex < modul.materi.length - 1;
  const sumberLabel = getSumberLabel(materi.sumber_id ?? null);

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors min-h-[44px]" aria-label="Kembali ke daftar materi">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Kembali
      </button>

      <div className="flex items-center gap-1.5">
        {modul.materi.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i === materiIndex ? 'bg-primary-600' : i < materiIndex ? 'bg-primary-300' : 'bg-primary-100'}`} />
        ))}
      </div>

      <article className="bg-white rounded-xl2 p-5 md:p-6 border border-primary-100 shadow-soft">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              {modul.judul} &middot; Bagian {materiIndex + 1}
            </span>
            <h1 className="text-lg md:text-xl font-bold text-ink mt-2 leading-snug">{materi.judul}</h1>
          </div>
          <SpeechButton text={materi.isi} label="Bacakan materi ini" />
        </div>

        {materi.perlu_verifikasi && (
          <div className="flex items-center gap-2 mb-4 bg-warning-50 border border-warning-200/50 rounded-xl px-3 py-2" title="Isi ini ringkas atau berasal dari sumber dengan otoritas terbatas. Cek ke sumber asli.">
            <HelpCircle className="w-4 h-4 text-warning-600 shrink-0" aria-hidden="true" />
            <span className="text-xs text-warning-700 font-medium">Sedang diverifikasi — materi ini masih dalam proses pengecekan.</span>
          </div>
        )}

        <div className="prose prose-sm max-w-none space-y-4">
          {renderMateriContent(materi.isi, settings.modePengantar, termMap)}
        </div>

        <div className="mt-5 pt-4 border-t border-primary-50 flex flex-wrap items-center gap-2">
          {sumberLabel && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              Sumber: {sumberLabel}
            </span>
          )}
          {materi.halaman_buku && (
            <span className="text-xs text-gray-400">{materi.halaman_buku}</span>
          )}
        </div>
      </article>

      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleComplete(progressId)}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all min-h-[44px] active:scale-95 ${
            isDone ? 'bg-success-50 text-success-600 border border-success-200/50' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft'
          }`}
          aria-label={isDone ? 'Tandai sebagai belum selesai' : 'Tandai sebagai selesai'}
        >
          {isDone ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> : <Circle className="w-4 h-4" aria-hidden="true" />}
          {isDone ? 'Selesai dipelajari' : 'Tandai selesai'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        {hasPrev ? (
          <button onClick={() => navigate({ name: 'materi', slug, materiIndex: materiIndex - 1 })} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors min-h-[44px]" aria-label="Materi sebelumnya">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Sebelumnya
          </button>
        ) : <span />}
        {hasNext ? (
          <button onClick={() => navigate({ name: 'materi', slug, materiIndex: materiIndex + 1 })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors min-h-[44px]" aria-label="Materi berikutnya">
            Berikutnya
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <button onClick={() => navigate({ name: 'main' })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-500 hover:text-accent-600 transition-colors min-h-[44px]" aria-label="Coba kuis">
            Coba kuis
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

type TermMap = Record<string, { arab: string; arti: string }>;

function useTermMap(): TermMap {
  const { data: istilah } = useIstilah();
  return useMemo(() => {
    const map: TermMap = {};
    for (const i of istilah) {
      map[i.istilah] = { arab: i.arab ?? '', arti: i.arti };
    }
    return map;
  }, [istilah]);
}

function renderMateriContent(raw: string, modePengantar: boolean, termMap: TermMap) {
  const blocks = raw.split('\n\n').filter(Boolean);
  const elements: React.ReactNode[] = [];

  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi].trim();
    const lines = block.split('\n');
    const bulletLines = lines.filter((l) => /^\s*[-•]\s/.test(l));

    if (bulletLines.length > 0 && bulletLines.length === lines.length) {
      elements.push(
        <ul key={bi} className="space-y-2 pl-1">
          {lines.map((line, li) => (
            <li key={li} className="flex items-start gap-2 text-sm md:text-base text-ink leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-2" aria-hidden="true" />
              <span>{renderWithTooltips(line.replace(/^\s*[-•]\s*/, ''), modePengantar, termMap)}</span>
            </li>
          ))}
        </ul>
      );
    } else if (bulletLines.length > 0) {
      const intro = lines.filter((l) => !/^\s*[-•]\s/.test(l)).join(' ');
      if (intro) {
        elements.push(
          <p key={`${bi}-intro`} className="text-ink leading-relaxed text-sm md:text-base">
            {renderWithTooltips(intro, modePengantar, termMap)}
          </p>
        );
      }
      elements.push(
        <ul key={`${bi}-list`} className="space-y-2 pl-1">
          {bulletLines.map((line, li) => (
            <li key={li} className="flex items-start gap-2 text-sm md:text-base text-ink leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-2" aria-hidden="true" />
              <span>{renderWithTooltips(line.replace(/^\s*[-•]\s*/, ''), modePengantar, termMap)}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <p key={bi} className="text-ink leading-relaxed text-sm md:text-base">
          {renderWithTooltips(block, modePengantar, termMap)}
        </p>
      );
    }
  }

  return elements;
}

function renderWithTooltips(text: string, modePengantar: boolean, termMap: TermMap) {
  const terms = Object.keys(termMap).sort((a, b) => b.length - a.length);
  const parts: (string | { term: string; arab: string; arti: string })[] = [text];

  for (const term of terms) {
    for (let i = 0; i < parts.length; i++) {
      if (typeof parts[i] !== 'string') continue;
      const str = parts[i] as string;
      const idx = str.toLowerCase().indexOf(term.toLowerCase());
      if (idx === -1) continue;
      const before = str.slice(0, idx);
      const matched = str.slice(idx, idx + term.length);
      const after = str.slice(idx + term.length);
      parts.splice(i, 1, before, { term: matched, arab: termMap[term].arab, arti: termMap[term].arti }, after);
      i += 2;
    }
  }

  return parts.map((part, i) => {
    if (typeof part === 'string') return <span key={i}>{part}</span>;
    return <TermTooltip key={i} term={part.term} arab={part.arab} arti={part.arti} modePengantar={modePengantar} />;
  });
}

function TermTooltip({ term, arab, arti, modePengantar }: { term: string; arab: string; arti: string; modePengantar: boolean }) {
  if (modePengantar) {
    return (
      <span className="relative group inline">
        <span className="underline decoration-accent-300 decoration-dotted underline-offset-2 cursor-help font-medium text-primary-700" tabIndex={0} role="button" aria-label={`${term}: ${arti}`}>
          {term}
        </span>
        <span className="sr-only"> ({arti})</span>
        <span className="hidden group-hover:block group-focus:block absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-primary-800 text-white text-xs rounded-lg p-3 shadow-lg leading-relaxed">
          {arab && <span className="block font-semibold text-accent-200 mb-1">{arab}</span>}
          {arti}
        </span>
      </span>
    );
  }

  return (
    <span className="relative group inline">
      <span className="font-semibold text-primary-700 cursor-help" tabIndex={0} role="button" aria-label={`${term} (${arab}): ${arti}`}>
        {term}
      </span>
      {arab && <span className="text-sm text-primary-400 font-normal"> ({arab})</span>}
      <span className="hidden group-hover:block group-focus:block absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-primary-800 text-white text-xs rounded-lg p-3 shadow-lg leading-relaxed">
        {arti}
      </span>
    </span>
  );
}
