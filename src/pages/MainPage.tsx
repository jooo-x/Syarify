import { useState, useMemo } from 'react';
import {
  Brain, Wallet, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw,
  Trophy, Sparkles, Loader2, AlertCircle, Calculator, Scale, HelpCircle, Flame,
} from 'lucide-react';
import { useSoal, useSkenario, useNamaPanggilan, submitSkor, useStreak, shuffleSoal, shuffleSkenario, pickRandomSoal } from '@/hooks/useMateri';
import type { ShuffledSoal, ShuffledSkenario } from '@/hooks/useMateri';

const QUIZ_COUNT = 10;

type Tab = 'menu' | 'kuis' | 'pilih-akad' | 'bagi-hasil' | 'cicilan';

export function MainPage() {
  const [tab, setTab] = useState<Tab>('menu');
  const { streakCount, isActiveToday, recordActivity } = useStreak();

  const onBack = () => setTab('menu');

  if (tab === 'kuis') return <KuisPage onBack={onBack} onActivity={recordActivity} />;
  if (tab === 'pilih-akad') return <PilihAkadPage onBack={onBack} onActivity={recordActivity} />;
  if (tab === 'bagi-hasil') return <BagiHasilPage onBack={onBack} onActivity={recordActivity} />;
  if (tab === 'cicilan') return <CicilanMurabahahPage onBack={onBack} />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-ink mb-1">Main &amp; berlatih</h1>
        <p className="text-sm text-gray-500">Uji pemahamanmu sambil bersenang-senang.</p>
      </div>

      {/* Streak card */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-accent-50 to-accent-100/60 rounded-xl p-4 border border-accent-200/50">
        <div className="w-10 h-10 rounded-lg bg-accent-300/30 flex items-center justify-center shrink-0">
          <Flame className={`w-5 h-5 ${isActiveToday ? 'text-accent-500' : 'text-gray-400'}`} aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-ink">{streakCount} hari berturut-turut</p>
          <p className="text-xs text-gray-500">{isActiveToday ? 'Hari ini sudah aktif — mantap!' : 'Mainkan kuis atau simulasi untuk melanjutkan!'}</p>
        </div>
      </div>

      {/* Game cards */}
      <GameCard
        title="Kuis"
        desc={`${QUIZ_COUNT} soal acak, jawab sebanyak mungkin`}
        icon={Brain}
        gradient="from-primary-600 to-primary-700"
        textColor="text-white"
        subColor="text-primary-100"
        iconBg="bg-white/15"
        onClick={() => setTab('kuis')}
      />
      <GameCard
        title="Pilih akad yang tepat"
        desc="Baca cerita, tebak akad syariahnya"
        icon={Wallet}
        gradient="from-accent-300 to-accent-400"
        textColor="text-primary-800"
        subColor="text-primary-800/70"
        iconBg="bg-primary-800/15"
        onClick={() => setTab('pilih-akad')}
      />
      <GameCard
        title="Bagi hasil atau bunga?"
        desc="Bedakan skema syariah vs konvensional"
        icon={Scale}
        gradient="from-success-500 to-success-600"
        textColor="text-white"
        subColor="text-success-100"
        iconBg="bg-white/15"
        onClick={() => setTab('bagi-hasil')}
      />
      <GameCard
        title="Hitung cicilan murabahah"
        desc="Simulasi hitung margin dan angsuran"
        icon={Calculator}
        gradient="from-primary-500 to-accent-400"
        textColor="text-white"
        subColor="text-primary-100"
        iconBg="bg-white/15"
        onClick={() => setTab('cicilan')}
      />
    </div>
  );
}

function GameCard({ title, desc, icon: Icon, gradient, textColor, subColor, iconBg, onClick }: {
  title: string; desc: string; icon: typeof Brain; gradient: string; textColor: string; subColor: string; iconBg: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`w-full bg-gradient-to-br ${gradient} ${textColor} rounded-xl2 p-5 text-left hover:shadow-card transition-all active:scale-[0.98] min-h-[100px] flex items-center gap-4`} aria-label={title}>
      <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <h2 className="font-bold text-lg mb-0.5">{title}</h2>
        <p className={`text-sm ${subColor}`}>{desc}</p>
      </div>
      <ArrowRight className="w-5 h-5 ml-auto shrink-0 opacity-70" aria-hidden="true" />
    </button>
  );
}

function BackButton({ onClick, label = 'Kembali' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors min-h-[44px]" aria-label={label}>
      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  );
}

// ==================== KUIS (10 soal acak, shuffle per soal) ====================

function KuisPage({ onBack, onActivity }: { onBack: () => void; onActivity: () => void }) {
  const { data: allSoal, loading, error } = useSoal();
  const { nama, isValid: hasNick } = useNamaPanggilan();

  const [sessionKey, setSessionKey] = useState(0);
  const sessionSoal = useMemo(() => pickRandomSoal(allSoal, QUIZ_COUNT), [allSoal, sessionKey]);
  const shuffled = useMemo(() => shuffleSoal(sessionSoal), [sessionSoal, sessionKey]);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (loading) return <LoadingSpinner text="Memuat soal kuis..." />;

  const soal: ShuffledSoal | undefined = shuffled[current];

  if (!soal || finished) {
    const poin = Math.round((score / Math.max(shuffled.length, 1)) * 100);
    return (
      <div className="space-y-4 animate-fade-in">
        <BackButton onClick={onBack} />
        <div className="bg-white rounded-xl2 p-8 border border-primary-100 shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-accent-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Kuis selesai!</h2>
          <p className="text-sm text-gray-500 mb-1">Skor kamu</p>
          <p className="text-3xl font-bold text-primary-600 mb-1">{score} / {shuffled.length}</p>
          <p className="text-sm text-gray-400 mb-4">({poin} poin)</p>
          {hasNick && !submitError && (
            <p className="text-xs text-success-600 mb-4">Skor disimpan untuk {nama}.</p>
          )}
          {submitError && (
            <p className="text-xs text-error-500 mb-4">Gagal menyimpan skor. Coba lagi nanti.</p>
          )}
          <button
            onClick={() => { setSessionKey((k) => k + 1); setCurrent(0); setSelected(null); setShowResult(false); setScore(0); setFinished(false); setSubmitError(null); }}
            className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary-700 transition-all active:scale-95 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Ulangi
          </button>
        </div>
      </div>
    );
  }

  function answer(idx: number) {
    setSelected(idx);
    setShowResult(true);
    if (idx === soal!.correctIndex) setScore((s) => s + 1);
    onActivity();
  }

  function next() {
    if (current + 1 >= shuffled.length) {
      setFinished(true);
      if (hasNick) {
        const finalScore = score + (selected === soal!.correctIndex ? 1 : 0);
        const poin = Math.round((finalScore / shuffled.length) * 100);
        submitSkor({ nama_panggilan: nama, poin: Math.min(poin, 1000), sumber: 'kuis' }).then(({ error: e }) => {
          if (e) setSubmitError(e);
        });
      }
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowResult(false);
    }
  }

  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-4 animate-fade-in">
      <BackButton onClick={onBack} />
      {error && <FallbackBanner />}

      <div className="flex items-center gap-1.5">
        {shuffled.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i === current ? 'bg-primary-600' : i < current ? 'bg-primary-300' : 'bg-primary-100'}`} />
        ))}
      </div>

      <div className="bg-white rounded-xl2 p-5 md:p-6 border border-primary-100 shadow-soft">
        <p className="text-xs text-primary-600 font-semibold mb-2">Pertanyaan {current + 1} dari {shuffled.length}</p>
        <h2 className="text-base md:text-lg font-bold text-ink mb-4 leading-snug">{soal.pertanyaan}</h2>

        <div className="space-y-2">
          {soal.shuffledOpsi.map((pilihan, idx) => {
            const isCorrect = idx === soal.correctIndex;
            const isSelected = idx === selected;
            let style = 'bg-primary-50/60 text-ink border-primary-100 hover:bg-primary-50';
            if (showResult && isCorrect) style = 'bg-success-50 text-success-700 border-success-200/50';
            else if (showResult && isSelected && !isCorrect) style = 'bg-error-50 text-error-600 border-error-200/50';
            else if (showResult) style = 'bg-primary-50/40 text-gray-400 border-primary-50';

            return (
              <button
                key={idx}
                onClick={() => !showResult && answer(idx)}
                disabled={showResult}
                className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all min-h-[48px] flex items-center gap-3 ${style}`}
              >
                <span className="w-7 h-7 rounded-full bg-primary-100/60 flex items-center justify-center text-xs font-bold shrink-0">{labels[idx] ?? idx}</span>
                <span className="flex-1">{pilihan}</span>
                {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0" aria-hidden="true" />}
                {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-error-500 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="mt-4 bg-primary-50/80 rounded-xl p-4 animate-slide-up">
            <p className="text-sm text-ink leading-relaxed">
              <span className="font-semibold text-primary-700">Penjelasan: </span>
              {soal.penjelasan}
            </p>
          </div>
        )}
      </div>

      {showResult && (
        <button onClick={next} className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary-700 transition-all active:scale-95 min-h-[44px]">
          {current + 1 >= shuffled.length ? 'Lihat hasil' : 'Berikutnya'}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ==================== PILIH AKAD ====================

function PilihAkadPage({ onBack, onActivity }: { onBack: () => void; onActivity: () => void }) {
  const { data: skenario, loading, error } = useSkenario();
  const { nama, isValid: hasNick } = useNamaPanggilan();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [simScore, setSimScore] = useState(0);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const [sessionKey, setSessionKey] = useState(0);
  const shuffledAll = useMemo(() => shuffleSkenario(skenario), [skenario, sessionKey]);
  const active = shuffledAll[currentIdx];

  if (loading) return <LoadingSpinner text="Memuat simulasi..." />;
  if (skenario.length === 0) return <EmptyState onBack={onBack} text="Belum ada skenario tersedia." />;

  if (!active) {
    const poin = simScore * 15;
    return (
      <div className="space-y-4 animate-fade-in">
        <BackButton onClick={onBack} />
        <div className="bg-white rounded-xl2 p-8 border border-primary-100 shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-accent-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Simulasi selesai!</h2>
          <p className="text-3xl font-bold text-primary-600 mb-1">{simScore} / {shuffledAll.length}</p>
          <p className="text-sm text-gray-400 mb-4">({poin} poin)</p>
          {submitErr && <p className="text-xs text-error-500 mb-4">Gagal menyimpan skor.</p>}
          <button onClick={() => { setSessionKey((k) => k + 1); setCurrentIdx(0); setChosen(null); setShowAnswer(false); setSimScore(0); }} className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary-700 transition-all active:scale-95 min-h-[44px]">
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Ulangi
          </button>
        </div>
      </div>
    );
  }

  function pick(idx: number) {
    setChosen(idx);
    setShowAnswer(true);
    onActivity();
    const isCorrect = idx === active.correctIndex;
    if (isCorrect) setSimScore((s) => s + 1);
    if (hasNick && isCorrect) {
      submitSkor({ nama_panggilan: nama, poin: 15, sumber: 'simulasi' }).then(({ error: e }) => {
        if (e) setSubmitErr(e);
      });
    }
  }

  function nextScenario() {
    setCurrentIdx((i) => i + 1);
    setChosen(null);
    setShowAnswer(false);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <BackButton onClick={onBack} />
      {error && <FallbackBanner />}

      <div className="flex items-center gap-1.5">
        {shuffledAll.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i === currentIdx ? 'bg-accent-400' : i < currentIdx ? 'bg-accent-300' : 'bg-accent-100'}`} />
        ))}
      </div>

      <div className="bg-gradient-to-br from-accent-300 to-accent-400 text-primary-800 rounded-xl2 p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-70">Skenario {currentIdx + 1} dari {shuffledAll.length}</p>
        <h2 className="font-bold text-lg mb-2">Tebak akad yang tepat</h2>
        <p className="text-sm text-primary-800/80 leading-relaxed">{active.cerita}</p>
      </div>

      <div className="space-y-2">
        {active.shuffledOpsi.map((opt, idx) => {
          const isCorrect = idx === active.correctIndex;
          const isChosen = idx === chosen;
          let style = 'bg-white text-ink border-primary-100 hover:bg-primary-50';
          if (showAnswer && isCorrect) style = 'bg-success-50 text-success-700 border-success-200/50';
          else if (showAnswer && isChosen && !isCorrect) style = 'bg-error-50 text-error-600 border-error-200/50';
          else if (showAnswer) style = 'bg-primary-50/40 text-gray-400 border-primary-50';
          return (
            <button key={idx} onClick={() => !showAnswer && pick(idx)} disabled={showAnswer}
              className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all min-h-[48px] flex items-center justify-between gap-2 ${style}`}>
              <span>{opt}</span>
              {showAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0" aria-hidden="true" />}
              {showAnswer && isChosen && !isCorrect && <XCircle className="w-5 h-5 text-error-500 shrink-0" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {showAnswer && (
        <div className="bg-primary-50/80 rounded-xl p-4 animate-slide-up">
          <p className="text-sm text-ink leading-relaxed">
            <span className="font-semibold text-primary-700">Jawaban: {active.akad_benar}. </span>
            {active.penjelasan}
          </p>
        </div>
      )}

      {showAnswer && (
        <button onClick={nextScenario} className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary-700 transition-all active:scale-95 min-h-[44px]">
          {currentIdx + 1 >= shuffledAll.length ? 'Lihat hasil' : 'Berikutnya'}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ==================== BAGI HASIL ATAU BUNGA? ====================

interface BagiHasilItem {
  deskripsi: string;
  jawaban: 'bagi_hasil' | 'bunga';
  penjelasan: string;
}

const bagiHasilData: BagiHasilItem[] = [
  { deskripsi: 'Nasabah menyetor Rp 10 juta ke bank. Bank menjanjikan bunga 6% per tahun. Di akhir tahun, nasabah pasti menerima Rp 600.000 apa pun kondisi usaha bank.', jawaban: 'bunga', penjelasan: 'Ini bunga (riba): keuntungan nasabah sudah ditentukan di muka, tidak bergantung pada laba atau rugi usaha.' },
  { deskripsi: 'Andi menyetor modal Rp 50 juta ke koperasi syariah. Disepakati nisbah 60:40 — 60% untuk koperasi, 40% untuk Andi. Bulan ini untung Rp 5 juta, jadi Andi dapat Rp 2 juta.', jawaban: 'bagi_hasil', penjelasan: 'Ini bagi hasil (mudharabah): pembagian berdasarkan nisbah dan laba aktual, bukan angka tetap.' },
  { deskripsi: 'Pinjaman KPR dengan angsuran tetap Rp 3,5 juta/bulan, termasuk bunga flat 8% per tahun. Besaran tidak berubah meskipun bank rugi.', jawaban: 'bunga', penjelasan: 'Bunga flat KPR konvensional: angsuran tetap tidak mempedulikan untung atau rugi bank — ini riba.' },
  { deskripsi: 'Bank syariah membeli rumah seharga Rp 300 juta, lalu menjualnya ke nasabah seharga Rp 390 juta dicicil 15 tahun. Margin sudah disepakati di awal dan tidak berubah.', jawaban: 'bagi_hasil', penjelasan: 'Ini murabahah (jual-beli): bank membeli dulu lalu menjual dengan margin transparan. Bukan bunga, karena ada perpindahan kepemilikan barang nyata.' },
  { deskripsi: 'Deposito bank konvensional menjanjikan return 5,5% per tahun. Meskipun bank merugi, nasabah tetap dapat 5,5%.', jawaban: 'bunga', penjelasan: 'Return deposito konvensional yang pasti dan tidak terkait kinerja usaha adalah bunga (riba).' },
  { deskripsi: 'Dua sahabat patungan buka warung kopi — masing-masing setor Rp 25 juta. Jika untung Rp 8 juta di bulan ini, dibagi rata sesuai porsi modal 50:50.', jawaban: 'bagi_hasil', penjelasan: 'Ini musyarakah: modal bersama, keuntungan dan risiko ditanggung sesuai porsi — sesuai syariah.' },
  { deskripsi: 'Kartu kredit membebankan bunga 2,25% per bulan atas saldo yang belum dibayar. Makin lama menunggak, makin besar total bayar.', jawaban: 'bunga', penjelasan: 'Bunga kartu kredit adalah riba: tambahan yang terus menumpuk karena tunggakan — dilarang dalam syariah.' },
  { deskripsi: 'Nasabah investasi di reksadana syariah. Return bulan ini 1,2%, bulan depan bisa 0,5% atau bahkan minus, tergantung kinerja portofolio.', jawaban: 'bagi_hasil', penjelasan: 'Return yang naik-turun mengikuti kinerja aktual adalah ciri bagi hasil — halal selama portofolio sesuai syariah.' },
];

function BagiHasilPage({ onBack, onActivity }: { onBack: () => void; onActivity: () => void }) {
  const { nama, isValid: hasNick } = useNamaPanggilan();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState<'bagi_hasil' | 'bunga' | null>(null);
  const [bgScore, setBgScore] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const item = bagiHasilData[currentIdx];

  if (!item) {
    const poin = bgScore * 10;
    if (hasNick && poin > 0 && !submitted) {
      setSubmitted(true);
      submitSkor({ nama_panggilan: nama, poin, sumber: 'simulasi' });
    }
    return (
      <div className="space-y-4 animate-fade-in">
        <BackButton onClick={onBack} />
        <div className="bg-white rounded-xl2 p-8 border border-primary-100 shadow-card text-center">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-success-600" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Simulasi selesai!</h2>
          <p className="text-3xl font-bold text-primary-600 mb-1">{bgScore} / {bagiHasilData.length}</p>
          <p className="text-sm text-gray-400 mb-4">({poin} poin)</p>
          <button onClick={() => { setCurrentIdx(0); setAnswer(null); setBgScore(0); setSubmitted(false); }} className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary-700 transition-all active:scale-95 min-h-[44px]">
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Ulangi
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = answer === item.jawaban;

  function choose(val: 'bagi_hasil' | 'bunga') {
    setAnswer(val);
    onActivity();
    if (val === item.jawaban) setBgScore((s) => s + 1);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <BackButton onClick={onBack} />

      <div className="flex items-center gap-1.5">
        {bagiHasilData.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i === currentIdx ? 'bg-success-500' : i < currentIdx ? 'bg-success-300' : 'bg-success-100'}`} />
        ))}
      </div>

      <div className="bg-gradient-to-br from-success-500 to-success-600 text-white rounded-xl2 p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-70">Kasus {currentIdx + 1} dari {bagiHasilData.length}</p>
        <h2 className="font-bold text-lg mb-2">Bagi hasil atau bunga?</h2>
        <p className="text-sm text-success-100 leading-relaxed">{item.deskripsi}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(['bagi_hasil', 'bunga'] as const).map((val) => {
          const label = val === 'bagi_hasil' ? 'Bagi Hasil (Syariah)' : 'Bunga (Riba)';
          const isThis = answer === val;
          const correct = val === item.jawaban;
          let style = 'bg-white border-primary-100 text-ink hover:bg-primary-50';
          if (answer !== null && correct) style = 'bg-success-50 border-success-200/50 text-success-700';
          else if (answer !== null && isThis && !correct) style = 'bg-error-50 border-error-200/50 text-error-600';
          else if (answer !== null) style = 'bg-primary-50/40 border-primary-50 text-gray-400';
          return (
            <button key={val} onClick={() => answer === null && choose(val)} disabled={answer !== null}
              className={`p-4 rounded-xl border text-sm font-semibold transition-all min-h-[60px] ${style}`}>
              {val === 'bagi_hasil' ? <Scale className="w-5 h-5 mx-auto mb-1" aria-hidden="true" /> : <AlertCircle className="w-5 h-5 mx-auto mb-1" aria-hidden="true" />}
              {label}
              {answer !== null && correct && <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-success-600" aria-hidden="true" />}
              {answer !== null && isThis && !correct && <XCircle className="w-4 h-4 mx-auto mt-1 text-error-500" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {answer !== null && (
        <>
          <div className="bg-primary-50/80 rounded-xl p-4 animate-slide-up">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-primary-700 mb-1">Kenapa begitu?</p>
                <p className="text-sm text-ink leading-relaxed">{item.penjelasan}</p>
              </div>
            </div>
          </div>
          <button onClick={() => { setCurrentIdx((i) => i + 1); setAnswer(null); }} className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary-700 transition-all active:scale-95 min-h-[44px]">
            {currentIdx + 1 >= bagiHasilData.length ? 'Lihat hasil' : 'Berikutnya'}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

// ==================== HITUNG CICILAN MURABAHAH ====================

function CicilanMurabahahPage({ onBack }: { onBack: () => void }) {
  const [hargaBarang, setHargaBarang] = useState('');
  const [marginPersen, setMarginPersen] = useState('');
  const [tenor, setTenor] = useState('');
  const [result, setResult] = useState<{
    hargaJual: number; totalMargin: number; angsuranPerBulan: number;
  } | null>(null);

  function hitung() {
    const harga = parseFloat(hargaBarang.replace(/\D/g, ''));
    const margin = parseFloat(marginPersen);
    const bulan = parseInt(tenor);
    if (!harga || harga <= 0 || !margin || margin <= 0 || !bulan || bulan <= 0) return;

    const totalMargin = harga * (margin / 100) * (bulan / 12);
    const hargaJual = harga + totalMargin;
    const angsuranPerBulan = hargaJual / bulan;
    setResult({ hargaJual, totalMargin, angsuranPerBulan });
  }

  function formatRp(n: number) {
    return 'Rp ' + Math.round(n).toLocaleString('id-ID');
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <BackButton onClick={onBack} />

      <div className="bg-gradient-to-br from-primary-500 to-accent-400 text-white rounded-xl2 p-5 shadow-card">
        <h2 className="font-bold text-lg mb-1">Hitung cicilan murabahah</h2>
        <p className="text-sm text-primary-100 leading-relaxed">
          Murabahah = bank beli barang dulu, lalu jual ke kamu dengan margin transparan. Yuk hitung!
        </p>
      </div>

      <div className="bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Harga barang (Rp)</label>
          <input
            type="text"
            inputMode="numeric"
            value={hargaBarang}
            onChange={(e) => { setHargaBarang(e.target.value); setResult(null); }}
            placeholder="contoh: 300000000"
            className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm text-ink placeholder:text-gray-400 focus:border-primary-400 transition-colors min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Margin per tahun (%)</label>
          <input
            type="text"
            inputMode="decimal"
            value={marginPersen}
            onChange={(e) => { setMarginPersen(e.target.value); setResult(null); }}
            placeholder="contoh: 10"
            className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm text-ink placeholder:text-gray-400 focus:border-primary-400 transition-colors min-h-[44px]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5">Tenor (bulan)</label>
          <input
            type="text"
            inputMode="numeric"
            value={tenor}
            onChange={(e) => { setTenor(e.target.value); setResult(null); }}
            placeholder="contoh: 60"
            className="w-full px-3 py-2.5 rounded-xl border border-primary-100 text-sm text-ink placeholder:text-gray-400 focus:border-primary-400 transition-colors min-h-[44px]"
          />
        </div>
        <button
          onClick={hitung}
          disabled={!hargaBarang || !marginPersen || !tenor}
          className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 disabled:opacity-40 transition-all active:scale-95 min-h-[44px]"
        >
          Hitung
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft space-y-3 animate-slide-up">
          <h3 className="font-bold text-sm text-ink flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary-600" aria-hidden="true" />
            Hasil perhitungan
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <ResultRow label="Harga barang" value={formatRp(parseFloat(hargaBarang.replace(/\D/g, '')))} />
            <ResultRow label="Total margin" value={formatRp(result.totalMargin)} accent />
            <ResultRow label="Harga jual (harga + margin)" value={formatRp(result.hargaJual)} />
            <div className="bg-primary-50 rounded-xl p-4 mt-1">
              <p className="text-xs text-gray-500 mb-0.5">Angsuran per bulan</p>
              <p className="text-2xl font-bold text-primary-600">{formatRp(result.angsuranPerBulan)}</p>
              <p className="text-xs text-gray-400 mt-1">selama {tenor} bulan</p>
            </div>
          </div>

          <div className="bg-accent-50 rounded-xl p-4 border border-accent-200/50">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-accent-600 mb-1">Kenapa begitu?</p>
                <p className="text-xs text-ink leading-relaxed">
                  Berbeda dari bunga bank konvensional, margin murabahah bersifat tetap dan transparan sejak awal akad. 
                  Bank benar-benar membeli barang lalu menjualnya kepadamu — ada transaksi jual beli nyata, bukan sekadar pinjam uang plus bunga.
                  Total yang kamu bayar tidak bisa berubah di tengah jalan, jadi kamu tahu pasti berapa seluruh cicilanmu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-primary-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${accent ? 'text-accent-500' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

// ==================== Shared small components ====================

function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin" aria-hidden="true" />
      <p className="text-sm text-gray-500 mt-3">{text}</p>
    </div>
  );
}

function FallbackBanner() {
  return (
    <div className="flex items-center gap-2 bg-warning-50 border border-warning-200/50 rounded-xl px-4 py-3">
      <AlertCircle className="w-4 h-4 text-warning-600 shrink-0" aria-hidden="true" />
      <p className="text-xs text-warning-700">Data dari cadangan lokal.</p>
    </div>
  );
}

function EmptyState({ onBack, text }: { onBack: () => void; text: string }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <BackButton onClick={onBack} />
      <div className="text-center py-12">
        <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
