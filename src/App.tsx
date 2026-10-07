import { SettingsProvider } from '@/context/SettingsContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import { Layout } from '@/components/Layout';
import { BerandaPage } from '@/pages/BerandaPage';
import { BelajarPage, ModulPage, MateriPage } from '@/pages/BelajarPage';
import { KamusPage } from '@/pages/KamusPage';
import { MainPage } from '@/pages/MainPage';
import { TanyaAIPage } from '@/pages/TanyaAIPage';
import { PeringkatPage } from '@/pages/PeringkatPage';
import { PengaturanPage } from '@/pages/PengaturanPage';
import { SumberPage } from '@/pages/SumberPage';
import { TentangPage } from '@/pages/TentangPage';

function RouterOutlet() {
  const { route } = useRouter();

  switch (route.name) {
    case 'beranda':
      return <BerandaPage />;
    case 'belajar':
      return <BelajarPage />;
    case 'modul':
      return <ModulPage slug={route.slug} />;
    case 'materi':
      return <MateriPage slug={route.slug} materiIndex={route.materiIndex} />;
    case 'kamus':
      return <KamusPage />;
    case 'main':
      return <MainPage />;
    case 'tanya-ai':
      return <TanyaAIPage />;
    case 'peringkat':
      return <PeringkatPage />;
    case 'pengaturan':
      return <PengaturanPage />;
    case 'sumber':
      return <SumberPage />;
    case 'tentang':
      return <TentangPage />;
    default:
      return <BerandaPage />;
  }
}

export default function App() {
  return (
    <SettingsProvider>
      <RouterProvider>
        <Layout>
          <RouterOutlet />
        </Layout>
      </RouterProvider>
    </SettingsProvider>
  );
}
