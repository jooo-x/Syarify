import { Trophy, TrendingUp, Medal, BarChart3, Loader2, Users } from 'lucide-react';
import { useModuls, useSoal, useProgress, useLeaderboard } from '@/hooks/useMateri';

export function PeringkatPage() {
  const { data: moduls } = useModuls();
  const { data: soal } = useSoal();
  const { completed } = useProgress();
  const { data: leaderboard, loading: lbLoading } = useLeaderboard();

  const totalMateri = moduls.reduce((s, m) => s + m.materi.length, 0);
  const materiProgress = totalMateri > 0 ? Math.round((completed.length / totalMateri) * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-ink mb-1">Peringkat &amp; statistik</h1>
        <p className="text-sm text-gray-500">Lihat perkembangan belajarmu di sini.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Trophy} label="Materi selesai" value={`${completed.length}`} sub={`dari ${totalMateri}`} color="primary" />
        <StatCard icon={BarChart3} label="Progres" value={`${materiProgress}%`} sub="belajar" color="accent" />
        <StatCard icon={Medal} label="Modul" value={`${moduls.length}`} sub="tersedia" color="success" />
        <StatCard icon={TrendingUp} label="Soal kuis" value={`${soal.length}`} sub="siap main" color="warning" />
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-accent-500" aria-hidden="true" />
          <h2 className="font-bold text-sm text-ink">Papan peringkat</h2>
        </div>
        {lbLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" aria-hidden="true" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-accent-500" aria-hidden="true" />
            </div>
            <p className="text-xs text-gray-500">Belum ada skor. Selesaikan kuis untuk muncul di papan peringkat!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((row, i) => (
              <div key={`${row.nama_panggilan}-${i}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-50/60">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-accent-300 text-primary-800' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-600/30 text-amber-800' : 'bg-primary-100 text-primary-600'}`}>
                  {i + 1}
                </span>
                <span className="font-medium text-sm text-ink flex-1 truncate">{row.nama_panggilan}</span>
                <span className="text-sm font-bold text-primary-600">{row.total_poin} poin</span>
                <span className="text-xs text-gray-400">{row.permainan}x</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progres per modul */}
      <div className="bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft">
        <h2 className="font-bold text-sm text-ink mb-4">Progres per modul</h2>
        <div className="space-y-3">
          {moduls.map((m) => {
            const done = m.materi.filter((_, i) => completed.includes(`${m.slug}-${i}`)).length;
            const pct = m.materi.length > 0 ? Math.round((done / m.materi.length) * 100) : 0;
            return (
              <div key={m.slug}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-ink truncate">{m.judul}</span>
                  <span className="text-gray-400 shrink-0 ml-2">{done}/{m.materi.length}</span>
                </div>
                <div className="h-2 bg-primary-50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const statColors = {
  primary: 'bg-primary-50 text-primary-600',
  accent: 'bg-accent-50 text-accent-500',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Trophy; label: string; value: string; sub: string; color: keyof typeof statColors;
}) {
  return (
    <div className="bg-white rounded-xl2 p-4 border border-primary-100 shadow-soft">
      <div className={`w-9 h-9 rounded-lg ${statColors[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <p className="text-2xl font-bold text-ink leading-none mb-1">{value}</p>
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
  );
}
