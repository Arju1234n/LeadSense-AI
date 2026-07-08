'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import AdminNavbar from '@/components/AdminNavbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import PageTransition from '@/components/PageTransition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/imports') return 'All Imports';
    if (pathname === '/leads') return 'Lead Explorer';
    if (pathname === '/users') return 'User Management';
    if (pathname === '/analytics') return 'Analytics';
    return 'Admin Panel';
  };

  if (!authorized) {
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
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminNavbar title={getPageTitle()} />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-bg-primary/40 bg-dots">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
