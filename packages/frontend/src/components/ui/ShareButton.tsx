'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ShareButton Component
 * 
 * Provides native share functionality with fallback to copy
 * Following ISP: Single responsibility - sharing URLs
 */
export function ShareButton({
  url,
  title,
  text,
  className,
  variant = 'secondary',
  size = 'md',
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Share',
          text: text || '',
          url,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
          // Fallback to copy
          await handleCopy();
        }
      }
    } else {
      // Fallback to copy
      await handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={className}
    >
      {shared ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </>
      )}
    </Button>
  );
}

