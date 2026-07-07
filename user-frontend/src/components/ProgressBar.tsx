'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  status?: 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
}

export default function ProgressBar({ 
  progress, 
  status = 'uploading',
  message 
}: ProgressBarProps) {
  const getColorClass = () => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500';
      case 'processing':
        return 'bg-gradient-to-r from-indigo-500 to-purple-500';
      default:
        return 'bg-gradient-to-r from-indigo-500 to-purple-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      case 'processing':
        return 'Processing';
      default:
        return 'Uploading';
    }
  };

  return (
    <div className="space-y-3.5 w-full">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-text-primary">
          {message || getStatusText()}
        </span>
        <span className="font-bold text-accent">{progress}%</span>
      </div>
      <div className="w-full h-3 bg-bg-tertiary rounded-full overflow-hidden relative shadow-inner-glow">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`h-full rounded-full relative overflow-hidden ${getColorClass()}`}
        >
          {/* Progress Shimmer */}
          {status !== 'completed' && status !== 'error' && (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '1.5s' }} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
