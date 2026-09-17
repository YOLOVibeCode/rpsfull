'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
}

export function triggerConfetti(options: ConfettiOptions = {}) {
  const {
    particleCount = 100,
    spread = 70,
    origin = { x: 0.5, y: 0.5 },
    colors = ['#8b5cf6', '#f97316', '#0ea5e9'],
  } = options;

  confetti({
    particleCount,
    spread,
    origin,
    colors,
    zIndex: 9999,
  });
}

export function triggerWinConfetti() {
  // Multiple bursts for celebration
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#8b5cf6', '#f97316'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#0ea5e9', '#f97316'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}








