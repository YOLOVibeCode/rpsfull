'use client';

import { useState } from 'react';
import { QRCodeDisplay } from '@/components/match/QRCodeDisplay';
import { CopyLinkButton } from '@/components/ui/CopyLinkButton';
import { ShareButton } from '@/components/ui/ShareButton';
import { Button } from '@/components/ui/Button';
import { useCreateTournamentInvitation, useTournamentInvitation } from '@/hooks/api/useTournaments';
import { Loader2, RefreshCw } from 'lucide-react';

interface TournamentShareCardProps {
  tournamentId: string;
  tournamentName: string;
  isOrganizer: boolean;
}

/**
 * TournamentShareCard Component
 * 
 * Displays QR code and share options for tournament invitations
 * Following ISP: Single responsibility - tournament sharing
 */
export function TournamentShareCard({
  tournamentId,
  tournamentName,
  isOrganizer,
}: TournamentShareCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const createInvitation = useCreateTournamentInvitation();
  const { data: invitation, isLoading, refetch } = useTournamentInvitation(tournamentId);

  const handleCreateInvitation = async () => {
    setIsGenerating(true);
    try {
      await createInvitation.mutateAsync(tournamentId);
      await refetch();
    } catch (error) {
      console.error('Failed to create invitation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      await createInvitation.mutateAsync(tournamentId);
      await refetch();
    } catch (error) {
      console.error('Failed to regenerate invitation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOrganizer) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Tournament</h3>
        <p className="text-gray-600 mb-4">
          Generate an invitation link and QR code to share this tournament with players.
        </p>
        <Button
          onClick={handleCreateInvitation}
          isLoading={isGenerating}
          variant="primary"
          className="w-full"
        >
          Generate Invitation Link
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Share Tournament</h3>
        <Button
          onClick={handleRegenerate}
          isLoading={isGenerating}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </Button>
      </div>

      <p className="text-gray-600 mb-6">
        Share this link or QR code with players to join the tournament instantly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div>
          <QRCodeDisplay
            qrCodeDataUrl={invitation.qrCodeDataUrl}
            invitationLink={invitation.invitationLink}
            expiresAt={new Date(invitation.expiresAt)}
          />
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invitation Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={invitation.invitationLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <CopyLinkButton link={invitation.invitationLink} />
            </div>
          </div>

          <div className="flex gap-2">
            <ShareButton
              url={invitation.invitationLink}
              title={`Join ${tournamentName}`}
              text={`Join ${tournamentName} tournament!`}
              variant="primary"
              className="flex-1"
            />
          </div>

          <div className="text-sm text-gray-500 mt-4">
            <p>This invitation expires on:</p>
            <p className="font-medium">
              {new Date(invitation.expiresAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

