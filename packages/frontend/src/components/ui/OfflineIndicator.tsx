'use client';

import { useState, useEffect } from 'react';
import { useOffline } from '@/hooks/useOffline';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/toast';

export function OfflineIndicator() {
  const isOffline = useOffline();
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (isOffline && !hasShownToast) {
      toast.error('You are offline', 'Please check your internet connection');
      setHasShownToast(true);
    } else if (!isOffline && hasShownToast) {
      toast.success('Back online', 'Connection restored');
      setHasShownToast(false);
    }
  }, [isOffline, hasShownToast]);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <WifiOff size={18} />
            <span className="text-sm font-medium">You are offline. Some features may not work.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

