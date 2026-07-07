'use client';

import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { motion } from 'framer-motion';

interface AdminNavbarProps {
  title: string;
}

export default function AdminNavbar({ title }: AdminNavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 bg-bg-secondary/75 border-b border-border-primary px-8 py-4 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary capitalize">{title}</h2>
          <p className="text-xs text-text-secondary mt-0.5 font-medium">System Administration</p>
        </div>

        <div className="flex items-center gap-5">
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
        </div>
      </div>
    </header>
  );
}
