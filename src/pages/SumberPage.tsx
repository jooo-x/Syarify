import { BookOpen, FileText, GraduationCap, Scroll } from 'lucide-react';
import { useSumber } from '@/hooks/useMateri';

const jenisIcon: Record<string, typeof BookOpen> = {
  'buku': BookOpen,
  'jurnal': FileText,
  'catatan kuliah': GraduationCap,
};

const jenisLabel: Record<string, string> = {
  'buku': 'Buku',
  'jurnal': 'Jurnal',
  'catatan kuliah': 'Catatan Kuliah',
};

export function SumberPage() {
  const { data: sumber, loading } = useSumber();

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-ink mb-1">Sumber dan Referensi</h1>
          <p className="text-sm text-gray-500">Daftar sumber materi aplikasi.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Scroll className="w-8 h-8 text-primary-400 animate-spin" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-ink mb-1">Sumber dan Referensi</h1>
        <p className="text-sm text-gray-500">Daftar sumber materi aplikasi.</p>
      </div>

      <div className="bg-primary-50 rounded-xl2 p-4 border border-primary-100">
        <p className="text-xs text-primary-700 leading-relaxed">
          Isi aplikasi ditulis ulang dari sumber di atas untuk tujuan edukasi, bukan fatwa.
          Sebelum dipakai untuk makalah, cek ulang tahun, volume, dan halaman di dokumen aslinya.
        </p>
      </div>

      <div className="space-y-3">
        {sumber.map((s, i) => {
          const Icon = jenisIcon[s.jenis] ?? BookOpen;
          return (
            <div key={s.id} className="bg-white rounded-xl2 p-4 border border-primary-100 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary-600">{s.id}</span>
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {jenisLabel[s.jenis] ?? s.jenis}
                    </span>
                    {s.tahun && (
                      <span className="text-[10px] text-gray-400">{s.tahun}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-ink leading-snug mb-1">{s.judul}</h3>
                  <p className="text-xs text-gray-500 mb-2">{s.penulis}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.catatan}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-accent-50 rounded-xl2 p-4 border border-accent-200/50">
        <div className="flex items-start gap-2">
          <Scroll className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold text-accent-600 mb-1">Catatan hak cipta</p>
            <p className="text-xs text-ink leading-relaxed">
              Dua buku Bank Indonesia melarang kutipan atau perbanyakan tanpa izin tertulis.
              Semua isi database ditulis ulang dengan kalimat sendiri.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pt-2">{sumber.length} sumber</p>
    </div>
  );
}
