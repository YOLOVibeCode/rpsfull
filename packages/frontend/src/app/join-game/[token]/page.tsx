'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { Loader2, AlertCircle } from 'lucide-react';

interface InvitationDetails {
  matchId: string;
  invitationToken: string;
  invitationLink: string;
  qrCodeDataUrl: string;
  expiresAt: string;
  player1Name: string;
}

interface Player2Info {
  firstName: string;
  lastName: string;
  email: string;
}

export default function JoinGamePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null);
  const [player2Data, setPlayer2Data] = useState<Player2Info>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInvitation, setLoadingInvitation] = useState(true);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await apiClient.get<{ success: boolean; data: InvitationDetails }>(
          `/matches/join/${token}`
        );
        setInvitationDetails(response.data);
      } catch (error: any) {
        setErrors({
          submit: error.message || 'Invalid or expired invitation link',
        });
      } finally {
        setLoadingInvitation(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!player2Data.firstName || !player2Data.lastName || !player2Data.email) {
      setErrors({ submit: 'Please fill in all fields' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post<{ success: boolean; data: { matchId: string } }>(
        `/matches/join/${token}`,
        {
          token,
          player2: {
            firstName: player2Data.firstName.trim(),
            lastName: player2Data.lastName.trim(),
            email: player2Data.email.toLowerCase().trim(),
          },
        }
      );

      router.push(`/play/${response.data.matchId}`);
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Failed to join game. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayer2Data((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: '' }));
    }
  };

  if (loadingInvitation) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </main>
    );
  }

  if (errors.submit && !invitationDetails) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{errors.submit}</p>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </main>
    );
  }

  if (!invitationDetails) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">Join Game</h1>
          <p className="text-gray-600">
            You've been invited to play Rock Paper Scissors!
          </p>
        </div>

        {/* Player 1 Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Playing against:</p>
          <p className="text-lg font-semibold text-gray-800">{invitationDetails.player1Name}</p>
        </div>

        {/* Player 2 Registration Form */}
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={player2Data.firstName}
              onChange={handleChange}
              required
              placeholder="Sally"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={player2Data.lastName}
              onChange={handleChange}
              required
              placeholder="Scissor"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={player2Data.email}
              onChange={handleChange}
              required
              placeholder="sally.scissor@example.com"
              className="w-full"
            />
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Join Game
          </Button>
        </form>
      </div>
    </main>
  );
}

