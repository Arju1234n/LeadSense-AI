'use client';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import PageTransition from '@/components/PageTransition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Get page title based on current route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/upload') return 'Upload CSV';
    if (pathname === '/history') return 'Import History';
    if (pathname?.includes('/preview')) return 'CSV Preview';
    if (pathname?.includes('/processing')) return 'Processing Import';
    if (pathname?.includes('/results')) return 'Import Results';
    return 'GrowEasy CSV Importer';
  };

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar title={getPageTitle()} />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-bg-primary/40 bg-dots">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
