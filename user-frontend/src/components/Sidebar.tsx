'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Upload, 
  History, 
  LogOut,
  FileUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Upload CSV', href: '/upload', icon: Upload },
  { name: 'Import History', href: '/history', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-bg-secondary border-r border-border-primary min-h-screen flex flex-col transition-all duration-300 z-20">
      {/* Logo */}
      <div className="p-6 border-b border-border-primary">
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-md shadow-indigo-500/25"
          >
            <FileUp className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-text-primary">
              GrowEasy
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-accent uppercase">
              CSV Importer
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navigation.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden group',
                  isActive
                    ? 'text-accent font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {/* Active Background Glow */}
                {isActive && (
                  <motion.span 
                    layoutId="activeSidebar"
                    className="absolute inset-0 bg-accent-bg -z-10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Accent line */}
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-full" />
                )}

                <item.icon className={cn(
                  'w-5 h-5 transition-transform duration-300 group-hover:scale-110',
                  isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'
                )} />
                <span>{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border-primary">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary w-full transition-all duration-300"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
