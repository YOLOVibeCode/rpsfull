'use client';

import Link from 'next/link';
import { Gamepad2, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-700 mb-4">
            RPSFull
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium">
            Play. Compete. Win.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-stretch mb-12 md:mb-16">
          {/* Start a Game Button */}
          <Link
            href="/start-game"
            className="group relative flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[160px] md:min-h-[200px] max-w-full md:max-w-[400px] w-full"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                <Gamepad2 className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  START A GAME
                </h2>
                <p className="text-base md:text-lg text-white/90 font-medium">
                  Challenge a player • Quick match
                </p>
              </div>
            </div>
          </Link>

          {/* Start a Tournament Button */}
          <Link
            href={isAuthenticated ? '/tournaments/create' : '/login'}
            className="group relative flex flex-col items-center justify-center p-8 md:p-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[160px] md:min-h-[200px] max-w-full md:max-w-[400px] w-full"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                <Trophy className="w-12 h-12 md:w-16 md:h-16 text-white" strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  START A TOURNAMENT
                </h2>
                <p className="text-base md:text-lg text-white/90 font-medium">
                  Create or join • Competitive bracket
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="text-center">
          {!isAuthenticated ? (
            <div className="flex items-center justify-center gap-4 text-base md:text-lg">
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
              >
                Login
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/register"
                className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 text-base md:text-lg">
              <Link
                href="/dashboard"
                className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/stats"
                className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
              >
                Statistics
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
