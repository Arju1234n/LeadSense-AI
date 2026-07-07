'use client';

import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-bg-secondary border border-border-primary rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-5 text-center"
      >
        <div className="relative w-16 h-16">
          {/* Animated Spinner Rings */}
          <div className="absolute inset-0 rounded-full border-4 border-bg-tertiary"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-bg-tertiary/40"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-accent-light border-r-transparent border-t-transparent border-l-transparent animate-spin-slow"></div>
        </div>
        <div>
          <p className="text-base font-bold text-text-primary tracking-tight">
            Please Wait
          </p>
          <p className="text-sm font-semibold text-text-secondary mt-1">
            {message}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
