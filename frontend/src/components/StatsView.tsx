import { useEffect, useState } from 'react';
import type { GameStats } from '../types';

interface StatsViewProps {
  stats: GameStats;
  todayAttemptCount: number | null | 'X';
}

export default function StatsView({ stats, todayAttemptCount }: StatsViewProps) {
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    // Run the countdown only if player has finished today's game
    if (!todayAttemptCount) return;

    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      
      // Set the target time to exactly midnight local time tonight
      tomorrow.setHours(24, 0, 0, 0); 
      
      const diff = tomorrow.getTime() - now.getTime();
      
      // Convert milliseconds into hours, minutes, and seconds
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
      const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      
      setCountdown(`${h}:${m}:${s}`);
    };

    // Call it immediately so there isn't a 1-second delay before it shows up
    updateTimer();
    
    // Set the interval to tick every 1000 milliseconds (1 second)
    const interval = setInterval(updateTimer, 1000);
    
    // Cleanup function: Stop timer if user navigates away from the Stats view
    return () => clearInterval(interval);
  }, [todayAttemptCount]);

  return (
    <div className="flex flex-col items-center p-4 w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">STATISTICS</h2>
      
      {/* Top Stats Grid */}
      <div className="flex justify-center gap-4 w-full max-w-75 mb-8 text-center">
        <div className="flex flex-col flex-1">
          <div className="text-3xl font-bold">{stats.played}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Played</div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-3xl font-bold">
            {stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Win %</div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-3xl font-bold">{stats.currentStreak}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="text-3xl font-bold">{stats.maxStreak}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Max</div>
        </div>
      </div>

      {/* Guess Distribution Bar Chart */}
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">GUESS DISTRIBUTION</h3>
      <div className="w-full max-w-75 flex flex-col gap-2 mb-8">
        {stats.distribution.map((count, index) => {
          const maxCount = Math.max(...stats.distribution, 1);
          const widthPercentage = Math.max((count / maxCount) * 100, 7); 
          const isToday = todayAttemptCount === index + 1;
          
          return (
            <div key={index} className="flex items-center text-sm">
              <div className="w-4 font-bold mr-2 text-right">{index + 1}</div>
              <div className="flex-1">
                <div 
                  className={`h-6 flex items-center justify-end px-2 font-bold text-white transition-all ${isToday ? 'bg-green-500' : 'bg-gray-500'}`}
                  style={{ width: `${widthPercentage}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW: The Countdown Timer */}
      {todayAttemptCount && (
        <div className="mt-2 pt-6 border-t-2 border-gray-200 dark:border-gray-700 w-full max-w-75 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">NEXT PALENGKEDLE</h3>
          <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
            {countdown}
          </div>
        </div>
      )}
    </div>
  );
}