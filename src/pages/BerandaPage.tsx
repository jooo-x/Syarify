import { BookOpen, ArrowRight, Flame, Target, BookMarked, GamepadIcon, TrendingUp, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';
import { useSettings } from '@/context/SettingsContext';
import { useModuls, useProgress, useNamaPanggilan, useStreak } from '@/hooks/useMateri';
import { useState } from 'react';

export function BerandaPage() {
  const { navigate } = useRouter();
  const { settings, toggleModePengantar } = useSettings();
  const { data: moduls, loading, error } = useModuls();
  const { completed } = useProgress();
  const { nama, setNama, isValid } = useNamaPanggilan();
  const { streakCount, isActiveToday } = useStreak();
  const [namaInput, setNamaInput] = useState(nama);

  const totalMateri = moduls.reduce((sum, m) => sum + m.materi.length, 0);
  const progressPercent = totalMateri > 0 ? Math.round((completed.length / totalMateri) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6 md:p-8 shadow-card">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-300/20 rounded-full blur-3xl -mr-10 -mt-10" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-300/10 rounded-full blur-2xl -ml-8 -mb-8" aria-hidden="true" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent-300" aria-hidden="true" />
            <span className="text-xs font-medium text-accent-200 tracking-wide uppercase">Selamat datang</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
            {isValid ? `Halo, ${nama}!` : 'Halo!'} Yuk, Pahami Ekonomi Syariah.
          </h1>
          <p className="text-primary-100 text-sm md:text-base leading-relaxed mb-5 max-w-lg">
            Belajar istilah yang terdengar rumit jadi gampang. Cocok untuk semua kalangan.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate({ name: 'belajar' })}
              className="inline-flex items-center gap-2 bg-accent-300 text-primary-800 font-semibold px-5 py-3 rounded-xl hover:bg-accent-200 transition-all shadow-soft min-h-[44px] active:scale-95"
              aria-label="Mulai belajar"
            >
              Mulai belajar
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate({ name: 'kamus' })}
              className="inline-flex items-center gap-2 bg-white/10 text-white font-medium px-5 py-3 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm min-h-[44px] active:scale-95"
              aria-label="Buka kamus istilah"
            >
              <BookMarked className="w-4 h-4" aria-hidden="true" />
              Kamus istilah
            </button>
          </div>
        </div>
      </section>

      {/* Nickname input */}
      {!isValid && (
        <section className="bg-white rounded-xl2 p-5 border border-accent-200/50 shadow-soft">
          <h2 className="font-bold text-sm text-ink mb-2">Siapa nama panggilanmu?</h2>
          <p className="text-xs text-gray-500 mb-3">Cukup nama panggilan saja (2–20 huruf). Tidak perlu email atau data pribadi lainnya.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (namaInput.trim().length >= 2) setNama(namaInput);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={namaInput}
              onChange={(e) => setNamaInput(e.target.value)}
              placeholder="Nama panggilan"
              maxLength={20}
              className="flex-1 px-3 py-2.5 rounded-xl border border-primary-100 text-sm text-ink placeholder:text-gray-400 focus:border-primary-400 transition-colors min-h-[44px]"
              aria-label="Nama panggilan"
            />
            <button
              type="submit"
              disabled={namaInput.trim().length < 2}
              className="px-4 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm disabled:opacity-40 min-h-[44px] hover:bg-primary-700 transition-colors active:scale-95"
              aria-label="Simpan nama panggilan"
            >
              Simpan
            </button>
          </form>
        </section>
      )}

      {/* Mode Pengantar toggle */}
      <button
        onClick={toggleModePengantar}
        className="w-full flex items-center justify-between gap-3 bg-white rounded-xl2 p-4 border border-primary-100 shadow-soft hover:shadow-card transition-all text-left"
        aria-label={`Mode Pengantar sedang ${settings.modePengantar ? 'aktif' : 'mati'}, ketuk untuk mengubah`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${settings.modePengantar ? 'bg-accent-100 text-accent-500' : 'bg-gray-100 text-gray-400'}`}>
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-sm">Mode Pengantar</p>
            <p className="text-xs text-gray-500">
              {settings.modePengantar ? 'Bahasa Indonesia dulu, Arab sebagai tooltip' : 'Istilah Arab tampil lengkap dengan arti'}
            </p>
          </div>
        </div>
        <div className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${settings.modePengantar ? 'bg-primary-600' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.modePengantar ? 'left-6' : 'left-0.5'}`} />
        </div>
      </button>

      {/* Streak & tantangan hari ini */}
      <section className="bg-gradient-to-br from-accent-50 to-accent-100/60 rounded-xl2 p-5 border border-accent-200/50 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActiveToday ? 'bg-accent-300/40' : 'bg-accent-300/20'}`}>
              <Flame className={`w-5 h-5 ${isActiveToday ? 'text-accent-500' : 'text-gray-400'}`} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-ink">Tantangan hari ini</h2>
              <p className="text-xs text-gray-500">Mainkan kuis atau simulasi untuk menjaga rentetan</p>
            </div>
          </div>
          {streakCount > 0 && (
            <div className="text-center shrink-0">
              <p className="text-lg font-bold text-accent-500 leading-none">{streakCount}</p>
              <p className="text-[10px] text-gray-400">hari</p>
            </div>
          )}
        </div>
        <div className="bg-white/70 rounded-xl p-4 border border-accent-200/40">
          <p className="text-sm text-ink mb-3">
            {isActiveToday
              ? 'Kamu sudah aktif hari ini — mantap! Lanjutkan belajar atau coba kuis lagi.'
              : 'Pelajari satu materi baru dan selesaikan kuis singkat untuk memperkuat pemahamanmu.'}
          </p>
          <button
            onClick={() => navigate({ name: 'main' })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-500 hover:text-accent-600 transition-colors"
            aria-label="Ambil tantangan"
          >
            <Target className="w-4 h-4" aria-hidden="true" />
            {isActiveToday ? 'Latihan lagi' : 'Ambil tantangan'}
          </button>
        </div>
      </section>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-warning-50 border border-warning-200/50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-warning-600 shrink-0" aria-hidden="true" />
          <p className="text-xs text-warning-700">Data diambil dari cadangan lokal karena koneksi bermasalah.</p>
        </div>
      )}

      {/* Progres */}
      <section className="bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" aria-hidden="true" />
            <h2 className="font-bold text-sm text-ink">Progres belajar</h2>
          </div>
          <span className="text-sm font-bold text-primary-600">{loading ? '...' : `${progressPercent}%`}</span>
        </div>
        <div className="h-3 bg-primary-50 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{completed.length} dari {totalMateri} materi selesai</span>
          <span>{moduls.length} modul tersedia</span>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="font-bold text-sm text-ink mb-3 px-1">Jelajahi</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard icon={BookOpen} title="Modul belajar" desc={`${moduls.length} modul siap dipelajari`} onClick={() => navigate({ name: 'belajar' })} color="primary" />
          <QuickCard icon={BookMarked} title="Kamus istilah" desc="Cari arti istilah Arab" onClick={() => navigate({ name: 'kamus' })} color="accent" />
          <QuickCard icon={GamepadIcon} title="Kuis & Simulasi" desc="Uji pemahamanmu" onClick={() => navigate({ name: 'main' })} color="success" />
          <QuickCard icon={TrendingUp} title="Peringkat" desc="Lihat statistik" onClick={() => navigate({ name: 'peringkat' })} color="warning" />
        </div>
      </section>
    </div>
  );
}

const colorMap = {
  primary: { bg: 'bg-primary-50', icon: 'bg-primary-600 text-white', border: 'border-primary-100' },
  accent: { bg: 'bg-accent-50', icon: 'bg-accent-300 text-primary-800', border: 'border-accent-200/50' },
  success: { bg: 'bg-success-50', icon: 'bg-success-500 text-white', border: 'border-success-200/50' },
  warning: { bg: 'bg-warning-50', icon: 'bg-warning-400 text-white', border: 'border-warning-200/50' },
};

function QuickCard({ icon: Icon, title, desc, onClick, color }: {
  icon: typeof BookOpen; title: string; desc: string; onClick: () => void; color: keyof typeof colorMap;
}) {
  const c = colorMap[color];
  return (
    <button onClick={onClick} className={`${c.bg} rounded-xl2 p-4 border ${c.border} text-left hover:shadow-card transition-all active:scale-95 min-h-[100px] flex flex-col gap-2`} aria-label={title}>
      <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold text-sm text-ink">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
