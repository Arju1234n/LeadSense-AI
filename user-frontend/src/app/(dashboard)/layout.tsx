'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import PageTransition from '@/components/PageTransition';
import { AlertCircle } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.isGuest) {
            setIsGuest(true);
          }
        } catch (e) {
          console.error('Failed to parse user session in layout', e);
        }
      }
    }
    setLoading(false);
  }, [router]);

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

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-bg-tertiary"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar title={getPageTitle()} />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-bg-primary/40 bg-dots">
            {isGuest && (
              <div className="mb-6 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-500 flex items-center gap-3 text-sm font-semibold relative overflow-hidden backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <span className="font-black uppercase tracking-wider text-xs bg-amber-500/10 px-2 py-0.5 rounded-md mr-2">
                    Demo Mode
                  </span>
                  <span>You are exploring the application without signing in. Some features may be limited.</span>
                </div>
              </div>
            )}
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
