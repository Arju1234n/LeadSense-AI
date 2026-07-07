'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/30',
    success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30',
    danger: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/30',
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(var(--accent), 0.1)' }}
      className="card bg-bg-secondary border border-border-primary/80 p-6 rounded-2xl flex items-center justify-between shadow-sm transition-all duration-300"
    >
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          {title}
        </p>
        <motion.p 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-3xl font-extrabold text-text-primary mt-2 tracking-tight"
        >
          {value}
        </motion.p>
        {trend && (
          <p
            className={cn(
              'text-xs font-semibold mt-2 flex items-center gap-1',
              trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
            )}
          >
            <span className="text-[14px]">{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-text-tertiary font-normal">vs last month</span>
          </p>
        )}
      </div>
      <div className={cn('p-3.5 rounded-xl border flex items-center justify-center shadow-sm', colorClasses[color])}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
}
