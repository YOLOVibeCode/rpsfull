'use client';

import { useState } from 'react';
import { Copy, Download, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface QRCodeDisplayProps {
  qrCodeDataUrl: string;
  invitationLink: string;
  expiresAt: Date;
  className?: string;
}

export function QRCodeDisplay({
  qrCodeDataUrl,
  invitationLink,
  expiresAt,
  className,
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDownloadQR = () => {
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `game-invitation-qr-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Rock Paper Scissors game!',
          text: 'I challenge you to a game of Rock Paper Scissors!',
          url: invitationLink,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  const formatExpiration = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* QR Code */}
      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
        <img
          src={qrCodeDataUrl}
          alt="Game invitation QR code"
          className="w-48 h-48 border-2 border-gray-200 rounded-lg"
        />
        <p className="mt-2 text-sm text-gray-600 text-center">
          Scan to join the game
        </p>
      </div>

      {/* Shareable Link */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Shareable Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={invitationLink}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleDownloadQR}
          isLoading={downloading}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download QR
        </Button>
        {navigator.share && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </div>

      {/* Expiration Info */}
      <div className="text-xs text-gray-500 text-center">
        Link expires in {formatExpiration(expiresAt)}
      </div>
    </div>
  );
}

