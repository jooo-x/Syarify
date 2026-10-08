import {
  Home,
  BookOpen,
  BookMarked,
  GamepadIcon,
  MessageCircleQuestion,
  Trophy,
  Settings,
  Scale,
  Info,
  ScrollText,
} from 'lucide-react';
import { useRouter, type Route } from '@/context/RouterContext';
import { useSettings } from '@/context/SettingsContext';
import { Sparkles, Moon, Sun } from 'lucide-react';

interface NavItem {
  label: string;
  icon: typeof Home;
  route: Route;
  match: string[];
}

const navItems: NavItem[] = [
  { label: 'Beranda', icon: Home, route: { name: 'beranda' }, match: ['beranda'] },
  { label: 'Belajar', icon: BookOpen, route: { name: 'belajar' }, match: ['belajar', 'modul', 'materi'] },
  { label: 'Kamus', icon: BookMarked, route: { name: 'kamus' }, match: ['kamus'] },
  { label: 'Main', icon: GamepadIcon, route: { name: 'main' }, match: ['main'] },
  { label: 'Pencari Materi', icon: MessageCircleQuestion, route: { name: 'tanya-ai' }, match: ['tanya-ai'] },
  { label: 'Peringkat', icon: Trophy, route: { name: 'peringkat' }, match: ['peringkat'] },
  { label: 'Sumber', icon: ScrollText, route: { name: 'sumber' }, match: ['sumber'] },
  { label: 'Tentang', icon: Info, route: { name: 'tentang' }, match: ['tentang'] },
  { label: 'Pengaturan', icon: Settings, route: { name: 'pengaturan' }, match: ['pengaturan'] },
];

const mobileNavItems = navItems.slice(0, 5);

export function Layout({ children }: { children: React.ReactNode }) {
  const { route, navigate } = useRouter();
  const { settings, toggleDarkMode } = useSettings();

  const isActive = (item: NavItem) => item.match.includes(route.name);

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-primary-100 flex-col z-30">
        <div className="p-5 border-b border-primary-100">
          <button
            onClick={() => navigate({ name: 'beranda' })}
            className="flex items-center gap-2.5 w-full text-left"
            aria-label="Ke Beranda"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-bold text-primary-700 text-base leading-tight">Syarify</h1>
              <p className="text-xs text-gray-500">Ekonomi syariah, mudah dipahami</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-primary-50/60 hover:text-primary-700'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-primary-100 space-y-2">
          <button
            onClick={toggleDarkMode}
            aria-label={settings.darkMode ? 'Matikan mode gelap' : 'Nyalakan mode gelap'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-primary-50/60 transition-colors min-h-[44px]"
          >
            {settings.darkMode ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
            {settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
          </button>
          <div className="px-3 py-2 rounded-xl bg-accent-50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-400 shrink-0" aria-hidden="true" />
            <span className="text-xs text-accent-600 font-medium">Mode Pengantar {settings.modePengantar ? 'aktif' : 'mati'}</span>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-primary-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate({ name: 'beranda' })}
            className="flex items-center gap-2"
            aria-label="Ke Beranda"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-primary-700 text-sm">Syarify</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate({ name: 'tentang' })}
              aria-label="Tentang aplikasi"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-50 transition-colors"
            >
              <Info className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => navigate({ name: 'pengaturan' })}
              aria-label="Buka pengaturan"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-50 transition-colors"
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={toggleDarkMode}
              aria-label={settings.darkMode ? 'Matikan mode gelap' : 'Nyalakan mode gelap'}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary-50 transition-colors"
            >
              {settings.darkMode ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-64 pb-24 md:pb-8 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-4 md:py-8">{children}</div>
        <Footer />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-primary-100">
        <div className="flex items-center justify-around px-1 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[44px] min-h-[44px] transition-colors ${
                  active ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-4 py-6 md:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 text-center">
          <p className="text-xs text-primary-700 leading-relaxed">
            Materi edukasi, bukan fatwa. Untuk keputusan pribadi, tanyakan ke ulama atau lembaga resmi.
          </p>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          Paham Syariah &middot; Belajar bersama, tanpa takut salah
        </p>
      </div>
    </footer>
  );
}
