'use client';

import { useEffect, useState } from 'react';
import { Bell, User, Sun, Moon, LogIn } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
        }
      }
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleSignInClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 bg-bg-secondary/75 border-b border-border-primary px-8 py-4 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary capitalize">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-5">
          {/* Sign In CTA for Guest Users */}
          {user && (user as any).isGuest && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignInClick}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/10 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </motion.button>
          )}

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border-primary bg-bg-secondary text-text-secondary hover:text-text-primary shadow-sm hover:shadow transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl border border-border-primary bg-bg-secondary text-text-secondary hover:text-text-primary shadow-sm hover:shadow transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </motion.button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-5 border-l border-border-primary">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-text-primary">
                {user ? user.name : 'Demo User'}
              </p>
              <p className="text-[10px] text-text-secondary">
                {user ? user.email : 'demo@groweasy.com'}
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {user ? getInitials(user.name) : 'DU'}
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}
