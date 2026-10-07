import { useState } from 'react';
import { Type, Contrast, Moon, Sparkles, Volume2, Square, Accessibility, User } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useNamaPanggilan } from '@/hooks/useMateri';
import { speak, stopSpeaking } from '@/utils/speech';
import type { FontSize } from '@/settings';

export function PengaturanPage() {
  const { settings, setFontSize, toggleHighContrast, toggleDarkMode, toggleModePengantar } = useSettings();
  const { nama, setNama, isValid } = useNamaPanggilan();
  const [namaInput, setNamaInput] = useState(nama);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-ink mb-1">Pengaturan aksesibilitas</h1>
        <p className="text-sm text-gray-500">Sesuaikan tampilan agar nyaman dibaca.</p>
      </div>

      {/* Nama panggilan */}
      <section className="bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="font-bold text-sm text-ink">Nama panggilan</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">Nama ini dipakai untuk papan peringkat. Cukup nama panggilan (2–20 huruf).</p>
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
            {isValid ? 'Ubah' : 'Simpan'}
          </button>
        </form>
        {isValid && <p className="text-xs text-success-600 mt-2">Tersimpan sebagai "{nama}"</p>}
      </section>

      {/* Font size */}
      <section className="bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="font-bold text-sm text-ink">Ukuran huruf</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'normal', label: 'Normal', sample: 'Aa' },
            { value: 'large', label: 'Besar', sample: 'Aa' },
            { value: 'xlarge', label: 'Sangat besar', sample: 'Aa' },
          ] as { value: FontSize; label: string; sample: string }[]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFontSize(opt.value)}
              aria-label={`Ukuran huruf ${opt.label}`}
              aria-pressed={settings.fontSize === opt.value}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all min-h-[64px] ${
                settings.fontSize === opt.value
                  ? 'bg-primary-50 border-primary-400 text-primary-700'
                  : 'bg-white border-primary-100 text-gray-500 hover:border-primary-300'
              }`}
            >
              <span className="font-bold" style={{ fontSize: opt.value === 'xlarge' ? '1.5rem' : opt.value === 'large' ? '1.25rem' : '1rem' }}>
                {opt.sample}
              </span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Toggles */}
      <section className="bg-white rounded-xl2 border border-primary-100 shadow-soft divide-y divide-primary-50">
        <ToggleRow
          icon={Contrast}
          label="Kontras tinggi"
          desc="Tingkatkan perbedaan warna untuk keterbacaan"
          on={settings.highContrast}
          onToggle={toggleHighContrast}
        />
        <ToggleRow
          icon={Moon}
          label="Mode gelap"
          desc="Tampilan gelap untuk kenyamanan mata"
          on={settings.darkMode}
          onToggle={toggleDarkMode}
        />
        <ToggleRow
          icon={Sparkles}
          label="Mode Pengantar"
          desc="Bahasa Indonesia tampil dulu, istilah Arab sebagai tooltip"
          on={settings.modePengantar}
          onToggle={toggleModePengantar}
        />
      </section>

      {/* Speech test */}
      <section className="bg-white rounded-xl2 p-5 border border-primary-100 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <Accessibility className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="font-bold text-sm text-ink">Coba bacakan (Web Speech)</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3">Tekan tombol untuk mendengarkan suara bahasa Indonesia.</p>
        <div className="flex gap-2">
          <button
            onClick={() => speak('Halo, selamat datang di Paham Syariah. Mari belajar ekonomi syariah bersama-sama.')}
            className="inline-flex items-center gap-2 bg-accent-100 text-accent-600 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-accent-200 transition-colors min-h-[44px] active:scale-95"
            aria-label="Bacakan teks contoh"
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
            Bacakan
          </button>
          <button
            onClick={stopSpeaking}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-colors min-h-[44px] active:scale-95"
            aria-label="Hentikan pembacaan"
          >
            <Square className="w-4 h-4" aria-hidden="true" />
            Stop
          </button>
        </div>
      </section>

      {/* Info */}
      <section className="bg-primary-50 rounded-xl2 p-4 border border-primary-100">
        <p className="text-xs text-primary-700 leading-relaxed">
          Pengaturan ini tersimpan di perangkatmu. Semua orang, dari berbagai usia dan agama, dapat menikmati
          konten ini dengan nyaman.
        </p>
      </section>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  desc,
  on,
  onToggle,
}: {
  icon: typeof Moon;
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 p-4 hover:bg-primary-50/40 transition-colors text-left min-h-[64px]"
      aria-label={`${label} ${on ? 'aktif' : 'mati'}`}
      aria-pressed={on}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${on ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-ink">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <div className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-primary-600' : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? 'left-6' : 'left-0.5'}`} />
      </div>
    </button>
  );
}
