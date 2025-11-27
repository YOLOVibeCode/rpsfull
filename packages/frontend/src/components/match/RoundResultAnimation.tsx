'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RoundResult } from '@rpsfull-platform/contracts';
import { CheckCircle, XCircle, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RoundResultAnimationProps {
  result: RoundResult | null;
  onAnimationComplete?: () => void;
}

export function RoundResultAnimation({ result, onAnimationComplete }: RoundResultAnimationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (result) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onAnimationComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [result, onAnimationComplete]);

  if (!result) return null;

  const config = {
    [RoundResult.WIN]: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      message: 'You Won!',
      emoji: '🎉',
    },
    [RoundResult.LOSS]: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      message: 'You Lost',
      emoji: '😔',
    },
    [RoundResult.TIE]: {
      icon: Minus,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      message: 'Tie!',
      emoji: '🤝',
    },
  };

  const { icon: Icon, color, bgColor, message, emoji } = config[result];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className={`${bgColor} rounded-full p-8 shadow-2xl`}
          >
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center gap-4"
            >
              <Icon className={`${color} w-20 h-20`} />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-6xl"
              >
                {emoji}
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-3xl font-bold ${color}`}
              >
                {message}
              </motion.h2>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

