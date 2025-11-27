'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ValidationIcon, ValidationStatus } from '@/components/ui/ValidationIcon';
import { QRCodeDisplay } from '@/components/match/QRCodeDisplay';
import { useEmailValidationSimple } from '@/hooks/api/useValidation';
import { apiClient } from '@/lib/api/client';
import { Users, QrCode } from 'lucide-react';

interface PlayerInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface InvitationResponse {
  matchId: string;
  invitationToken: string;
  invitationLink: string;
  qrCodeDataUrl: string;
  expiresAt: string;
  player1Name: string;
}

export default function StartGamePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'both' | 'invitation'>('both');
  const [player1Data, setPlayer1Data] = useState<PlayerInfo>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [player2Data, setPlayer2Data] = useState<PlayerInfo>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationResponse | null>(null);

  // Real-time validation for Player 1
  const player1EmailValidation = useEmailValidationSimple(player1Data.email, {
    enabled: player1Data.email.length > 0 && player1Data.email.includes('@'),
  });

  // Real-time validation for Player 2 (only if not in invitation mode)
  const player2EmailValidation = useEmailValidationSimple(player2Data.email, {
    enabled: mode === 'both' && player2Data.email.length > 0 && player2Data.email.includes('@'),
  });

  const getEmailStatus = (email: string, validation: any): ValidationStatus => {
    if (!email || !email.includes('@')) return 'idle';
    if (validation.checking) return 'checking';
    if (validation.isValid === true) return 'valid';
    if (validation.isValid === false) return 'invalid';
    return 'idle';
  };

  const handleCreateWithInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate Player 1
    if (!player1Data.firstName || !player1Data.lastName || !player1Data.email) {
      setErrors({ submit: 'Please fill in all Player 1 fields' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post<InvitationResponse>(
        '/matches/create-with-invitation',
        {
          player1: {
            firstName: player1Data.firstName.trim(),
            lastName: player1Data.lastName.trim(),
            email: player1Data.email.toLowerCase().trim(),
          },
          invitedPlayerEmail: player2Data.email ? player2Data.email.toLowerCase().trim() : undefined,
        }
      );

      // API client already unwraps the response.data, so response is the InvitationResponse directly
      setInvitationData(response);
      setMode('invitation');
      setIsLoading(false);
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Failed to create game invitation. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleQuickStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validation
    if (player1Data.email.toLowerCase() === player2Data.email.toLowerCase()) {
      setErrors({ submit: 'Players must have different email addresses' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post<{
        matchId: string;
        accessToken?: string;
        refreshToken?: string;
      }>('/matches/quick-start', {
        player1: {
          firstName: player1Data.firstName,
          lastName: player1Data.lastName,
          email: player1Data.email.toLowerCase().trim(),
        },
        player2: {
          firstName: player2Data.firstName,
          lastName: player2Data.lastName,
          email: player2Data.email.toLowerCase().trim(),
        },
      });

      if (response.accessToken) {
        apiClient.setToken(response.accessToken);
        apiClient.setRefreshToken(response.refreshToken || '');
      }

      router.push(`/play/${response.matchId}`);
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Failed to start game. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handlePlayerChange = (
    player: 'player1' | 'player2',
    field: keyof PlayerInfo,
    value: string
  ) => {
    if (player === 'player1') {
      setPlayer1Data((prev) => ({ ...prev, [field]: value }));
    } else {
      setPlayer2Data((prev) => ({ ...prev, [field]: value }));
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-700 mb-2">
              Start a Game
            </h1>
            <p className="text-gray-600">
              {mode === 'invitation'
                ? 'Share the link or QR code with Player 2'
                : 'Enter Player 1 details and choose how to add Player 2'}
            </p>
          </div>

          {mode === 'invitation' && invitationData ? (
            /* Invitation Display Mode */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ✅ Game created! Share the link or QR code with Player 2
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Player 1 Info */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">Player 1</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{invitationData.player1Name}</p>
                    <p className="text-sm text-gray-600">{player1Data.email}</p>
                  </div>
                </div>

                {/* Right: QR Code & Link */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Share with Player 2
                  </h2>
                  <QRCodeDisplay
                    qrCodeDataUrl={invitationData.qrCodeDataUrl}
                    invitationLink={invitationData.invitationLink}
                    expiresAt={new Date(invitationData.expiresAt)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMode('both');
                    setInvitationData(null);
                  }}
                >
                  Create Another Game
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => router.push(`/play/${invitationData.matchId}`)}
                >
                  Go to Game
                </Button>
              </div>
            </div>
          ) : (
            /* Form Mode */
            <form
              onSubmit={mode === 'both' ? handleQuickStart : handleCreateWithInvitation}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Player 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Player 1</h2>
                  </div>

                  <div>
                    <label
                      htmlFor="player1-firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First Name
                    </label>
                    <Input
                      id="player1-firstName"
                      name="player1-firstName"
                      type="text"
                      value={player1Data.firstName}
                      onChange={(e) =>
                        handlePlayerChange('player1', 'firstName', e.target.value)
                      }
                      required
                      placeholder="Rocky"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="player1-lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name
                    </label>
                    <Input
                      id="player1-lastName"
                      name="player1-lastName"
                      type="text"
                      value={player1Data.lastName}
                      onChange={(e) =>
                        handlePlayerChange('player1', 'lastName', e.target.value)
                      }
                      required
                      placeholder="Rocker"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="player1-email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        id="player1-email"
                        name="player1-email"
                        type="email"
                        value={player1Data.email}
                        onChange={(e) =>
                          handlePlayerChange('player1', 'email', e.target.value)
                        }
                        required
                        placeholder="rocky.rocker@example.com"
                        className="w-full pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <ValidationIcon
                          status={getEmailStatus(player1Data.email, player1EmailValidation)}
                          message={player1EmailValidation.exists ? 'Email exists - you can sign in' : player1EmailValidation.message}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Player 2 or Invitation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-secondary-600 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Player 2</h2>
                  </div>

                  {mode === 'both' ? (
                    <>
                      <div>
                        <label
                          htmlFor="player2-firstName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          First Name
                        </label>
                        <Input
                          id="player2-firstName"
                          name="player2-firstName"
                          type="text"
                          value={player2Data.firstName}
                          onChange={(e) =>
                            handlePlayerChange('player2', 'firstName', e.target.value)
                          }
                          required
                          placeholder="Sally"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="player2-lastName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Last Name
                        </label>
                        <Input
                          id="player2-lastName"
                          name="player2-lastName"
                          type="text"
                          value={player2Data.lastName}
                          onChange={(e) =>
                            handlePlayerChange('player2', 'lastName', e.target.value)
                          }
                          required
                          placeholder="Scissor"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="player2-email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <Input
                            id="player2-email"
                            name="player2-email"
                            type="email"
                            value={player2Data.email}
                            onChange={(e) =>
                              handlePlayerChange('player2', 'email', e.target.value)
                            }
                            required
                            placeholder="sally.scissor@example.com"
                            className="w-full pr-10"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <ValidationIcon
                              status={getEmailStatus(player2Data.email, player2EmailValidation)}
                              message={player2EmailValidation.exists ? 'Email exists - you can sign in' : player2EmailValidation.message}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        Player 2 will join via the invitation link or QR code
                      </p>
                    </div>
                  )}

                  {/* Mode Toggle */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant={mode === 'both' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setMode('both')}
                      className="flex-1"
                    >
                      Both Players
                    </Button>
                    <Button
                      type="button"
                      variant={mode === 'invitation' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setMode('invitation')}
                      className="flex-1"
                    >
                      Create Link
                    </Button>
                  </div>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium mb-1">💡 Quick Start</p>
                <p>
                  {mode === 'both'
                    ? 'If an email already exists, we will use that account and add this game to their history. New emails will create accounts automatically.'
                    : 'Create a shareable link or QR code that Player 2 can use to join the game remotely.'}
                </p>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full text-lg py-6"
              >
                {mode === 'both' ? 'Start Game' : 'Create Game & Generate Link'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
