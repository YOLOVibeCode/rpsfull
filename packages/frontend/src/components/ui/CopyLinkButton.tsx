'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Copy, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  link: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

/**
 * CopyLinkButton Component
 * 
 * Copies a link to clipboard with visual feedback
 * Following ISP: Single responsibility - copying URLs
 */
export function CopyLinkButton({
  link,
  className,
  variant = 'secondary',
  size = 'sm',
  showText = true,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={className}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          {showText && <span className="ml-2">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {showText && <span className="ml-2">Copy Link</span>}
        </>
      )}
    </Button>
  );
}

