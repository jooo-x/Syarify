import { useState, useMemo } from 'react';
import { Search, BookMarked, X, Loader2, AlertCircle, Filter, BookOpen } from 'lucide-react';
import { useIstilah, useModuls, getSumberLabel } from '@/hooks/useMateri';
import { SpeechButton } from '@/components/SpeechButton';

export function KamusPage() {
  const { data: istilah, loading, error } = useIstilah();
  const { data: moduls } = useModuls();
  const [query, setQuery] = useState('');
  const [filterModul, setFilterModul] = useState<string>('');

  const filtered = useMemo(() => {
    let result = istilah;
    if (filterModul) {
      result = result.filter((i) => i.modul_slug === filterModul);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (i) =>
          i.istilah.toLowerCase().includes(q) ||
          i.arti.toLowerCase().includes(q) ||
          (i.contoh ?? '').toLowerCase().includes(q) ||
          (i.arab ?? '').includes(q)
      );
    }
    return result;
  }, [istilah, query, filterModul]);

  const activeModul = moduls.find((m) => m.slug === filterModul);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" aria-hidden="true" />
        <p className="text-sm text-gray-500 mt-3">Memuat kamus istilah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-ink mb-1">Kamus istilah</h1>
        <p className="text-sm text-gray-500">Cari arti istilah Arab dalam ekonomi syariah. Ketuk tombol bacakan untuk mendengarkan.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-warning-50 border border-warning-200/50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-warning-600 shrink-0" aria-hidden="true" />
          <p className="text-xs text-warning-700">Data dari cadangan lokal.</p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari istilah, arti, atau contoh..."
          className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white border border-primary-100 text-sm text-ink placeholder:text-gray-400 focus:border-primary-400 transition-colors min-h-[44px]"
          aria-label="Cari istilah"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors" aria-label="Hapus pencarian">
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Module filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1 shrink-0 text-xs text-gray-400">
          <Filter className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Filter:</span>
        </div>
        <button
          onClick={() => setFilterModul('')}
          className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${!filterModul ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}
        >
          Semua
        </button>
        {moduls.map((m) => (
          <button
            key={m.slug}
            onClick={() => setFilterModul(m.slug)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${filterModul === m.slug ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}
          >
            {m.judul}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 px-1">
        {filtered.length} istilah{query ? ` untuk "${query}"` : ''}{activeModul ? ` di ${activeModul.judul}` : ''}
      </p>

      <div className="space-y-3">
        {filtered.map((item) => {
          const sumberLabel = getSumberLabel(item.sumber_id ?? null);
          return (
            <div key={item.id ?? item.istilah} className="bg-white rounded-xl2 p-4 border border-primary-100 shadow-soft hover:shadow-card transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-ink text-base">{item.istilah}</h3>
                    {item.arab && (
                      <span className="text-lg text-primary-600 leading-none" dir="rtl" lang="ar">{item.arab}</span>
                    )}
                  </div>
                  <p className="text-sm text-ink leading-relaxed mb-2">{item.arti}</p>
                  {item.contoh && (
                    <p className="text-xs text-gray-500 bg-primary-50/60 rounded-lg px-3 py-2 leading-relaxed">
                      <span className="font-semibold text-primary-600">Contoh: </span>
                      {item.contoh}
                    </p>
                  )}
                  {sumberLabel && (
                    <div className="mt-2 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-gray-400" aria-hidden="true" />
                      <span className="text-[10px] text-gray-400 font-medium">{sumberLabel}</span>
                    </div>
                  )}
                </div>
                <SpeechButton
                  text={`${item.istilah}. ${item.arti}. ${item.contoh ? `Contoh. ${item.contoh}` : ''}`}
                  label={`Bacakan istilah ${item.istilah}`}
                />
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-3">
              <BookMarked className="w-8 h-8 text-primary-300" aria-hidden="true" />
            </div>
            <p className="text-sm text-gray-500">Istilah tidak ditemukan. Coba kata kunci lain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
