'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { Loader2, AlertCircle, Trophy } from 'lucide-react';
import { ITournamentInvitationDetailsDto, IJoinTournamentResultDto } from '@rpsfull-platform/contracts';

interface PlayerInfo {
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Join Tournament Page
 * 
 * Public page for joining tournament via invitation token
 * Following ISP: Single responsibility - tournament join flow
 */
export default function JoinTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invitationDetails, setInvitationDetails] = useState<ITournamentInvitationDetailsDto | null>(null);
  const [playerData, setPlayerData] = useState<PlayerInfo>({
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
        const response = await apiClient.get<ITournamentInvitationDetailsDto>(
          `/tournaments/join/${token}`
        );
        setInvitationDetails(response);
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

    if (!playerData.firstName || !playerData.lastName || !playerData.email) {
      setErrors({ submit: 'Please fill in all fields' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post<IJoinTournamentResultDto>(
        `/tournaments/join/${token}`,
        {
          player: {
            firstName: playerData.firstName.trim(),
            lastName: playerData.lastName.trim(),
            email: playerData.email.toLowerCase().trim(),
          },
        }
      );

      // Store access token for auto-login
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
      }

      // Redirect to tournament page
      router.push(`/tournaments/${response.tournamentId}`);
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Failed to join tournament. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerData((prev) => ({
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
          <Trophy className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary-700 mb-2">Join Tournament</h1>
          <p className="text-gray-600">
            You've been invited to join a tournament!
          </p>
        </div>

        {/* Tournament Info */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{invitationDetails.name}</h2>
          {invitationDetails.description && (
            <p className="text-gray-600 mb-4">{invitationDetails.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Type</p>
              <p className="font-semibold capitalize">{invitationDetails.tournamentType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-600">Participants</p>
              <p className="font-semibold">
                {invitationDetails.currentParticipants} / {invitationDetails.maxParticipants || '∞'}
              </p>
            </div>
            {invitationDetails.startDate && (
              <div>
                <p className="text-gray-600">Start Date</p>
                <p className="font-semibold">
                  {new Date(invitationDetails.startDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-600">Organizer</p>
              <p className="font-semibold">{invitationDetails.organizerName}</p>
            </div>
          </div>
        </div>

        {/* Player Registration Form */}
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={playerData.firstName}
              onChange={handleChange}
              required
              placeholder="John"
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
              value={playerData.lastName}
              onChange={handleChange}
              required
              placeholder="Doe"
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
              value={playerData.email}
              onChange={handleChange}
              required
              placeholder="john.doe@example.com"
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
            Join Tournament
          </Button>
        </form>
      </div>
    </main>
  );
}

