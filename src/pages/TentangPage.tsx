import { Scale, Target, BookOpen, AlertCircle, Heart } from 'lucide-react';

export function TentangPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-ink mb-1">Tentang aplikasi</h1>
        <p className="text-sm text-gray-500">Kenali tujuan dan sumber Paham Syariah.</p>
      </div>

      {/* Tujuan */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl2 p-5 md:p-6 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-accent-300" aria-hidden="true" />
          <h2 className="font-bold text-lg">Tujuan aplikasi</h2>
        </div>
        <p className="text-sm text-primary-100 leading-relaxed">
          Paham Syariah membantu siapa saja dari berbagai usia dan agama untuk memahami ekonomi syariah
          dengan bahasa yang sederhana. Istilah yang terdengar rumit dijelaskan dengan contoh sehari-hari.
          Aplikasi ini cocok untuk pelajar, mahasiswa, dan masyarakat umum yang ingin
          tahu dasar-dasar ekonomi syariah di Indonesia.
        </p>
      </div>

      {/* Sumber utama */}
      <div className="bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="font-bold text-sm text-ink">Sumber materi</h2>
        </div>
        <ul className="space-y-3 text-sm text-ink leading-relaxed">
          <li className="flex items-start gap-2">
            <Scale className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-medium">Materi Dakwah Ekonomi Syariah: Panduan bagi Dai dan Daiyah</p>
              <p className="text-xs text-gray-500 mt-0.5">Bank Indonesia dan Majelis Ulama Indonesia — sumber utama bab 1-6</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-medium">Pengantar Ekonomi Islam</p>
              <p className="text-xs text-gray-500 mt-0.5">Ibrahim, A., dkk. (2021) — Departemen EKS Bank Indonesia bersama KNEKS</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-medium">9 jurnal dan 1 catatan kuliah lainnya</p>
              <p className="text-xs text-gray-500 mt-0.5">Lihat halaman Sumber dan Referensi untuk daftar lengkap</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Catatan penting */}
      <div className="bg-warning-50 rounded-xl2 p-5 border border-warning-200/50">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-sm text-warning-700 mb-1">Catatan penting</h2>
            <p className="text-xs text-warning-700 leading-relaxed">
              Materi edukasi, bukan fatwa. Untuk keputusan pribadi, tanyakan ke ulama atau lembaga resmi.
              Materi berlabel "Sedang diverifikasi" berasal dari ringkasan atau sumber dengan otoritas terbatas
              cek ke dokumen asli.
            </p>
          </div>
        </div>
      </div>

      {/* Penafian */}
      <div className="bg-accent-50 rounded-xl2 p-4 border border-accent-200/50">
        <div className="flex items-start gap-2">
          <Heart className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-ink leading-relaxed">
            Semua orang, dari berbagai jenjang usia dan agama dapat mencoba aplikasi ini dengan nyaman.
            Mari belajar tanpa takut salah.
          </p>
        </div>
      </div>
    </div>
  );
}
