import { useState, useEffect } from 'react';
import type { Product, ViewState, GameStats } from './types';
import Header from './components/Header';
import HowToPlay from './components/HowToPlay';
import StatsView from './components/StatsView';
import GameView from './components/GameView'; // NEW: Import the Game View

const DEFAULT_STATS: GameStats = {
  played: 0, wins: 0, currentStreak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0]
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('game');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<number[]>([]);
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('palengkedle_stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const MAX_GUESSES = 6;
  const GAME_START_DATE = new Date('2026-05-03T00:00:00Z').getTime();

  useEffect(() => {
    fetch('http://localhost:5001/api/daily-product')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
      })
      .then((data: Product) => {
        setProduct(data);
        
        const savedGame = JSON.parse(localStorage.getItem('palengkedle_save') || 'null');
        
        if (savedGame && savedGame.productId === data.id) {
          const loadedGuesses = savedGame.guesses;
          setGuesses(loadedGuesses);
          
          if (loadedGuesses.length > 0) {
            const lastGuess = loadedGuesses[loadedGuesses.length - 1];
            const diffPercentage = Math.abs(lastGuess - data.price) / data.price;
            
            if (diffPercentage <= 0.05) {
              setIsWinner(true);
              setIsGameOver(true);
            } else if (loadedGuesses.length >= MAX_GUESSES) {
              setIsGameOver(true);
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const updateStatsOnGameOver = (won: boolean, attempts: number) => {
    setStats(prev => {
      const newDistribution = [...prev.distribution];
      const newStats = { ...prev, distribution: newDistribution };
      newStats.played += 1;
      if (won) {
        newStats.wins += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
        newStats.distribution[attempts - 1] += 1;
      } else {
        newStats.currentStreak = 0;
      }
      localStorage.setItem('palengkedle_stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const handleGuess = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product || isGameOver || guesses.length >= MAX_GUESSES || isAnimating) return;
    const numericGuess = parseFloat(currentGuess);
    if (isNaN(numericGuess)) return;

    setIsAnimating(true);

    setTimeout(() => {
      const newGuesses = [...guesses, numericGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      localStorage.setItem('palengkedle_save', JSON.stringify({
        productId: product.id,
        guesses: newGuesses
      }));

      const diffPercentage = Math.abs(numericGuess - product.price) / product.price;
      const didWin = diffPercentage <= 0.05;
      const isOutOfGuesses = newGuesses.length >= MAX_GUESSES;

      if (didWin) {
        setIsWinner(true);
        setIsGameOver(true);
        updateStatsOnGameOver(true, newGuesses.length);
        setTimeout(() => setCurrentView('stats'), 1500); 
      } else if (isOutOfGuesses) {
        setIsGameOver(true);
        updateStatsOnGameOver(false, newGuesses.length);
        setTimeout(() => setCurrentView('stats'), 1500);
      }
      
      setIsAnimating(false);
    }, 300);
  };

  const handleShare = async () => {
    if (!product) return;
    const gameDate = new Date(product.gameDate).getTime();
    const gameNumber = Math.max(1, Math.floor((gameDate - GAME_START_DATE) / (1000 * 60 * 60 * 24)) + 1);
    const attemptCount = isWinner ? guesses.length : 'X';
    const resultEmoji = isWinner ? '✅' : '❌';

    const emojiGrid = guesses.map(guessVal => {
      const diffPercentage = Math.abs(guessVal - product.price) / product.price;
      let colorEmoji = diffPercentage <= 0.05 ? '🟩' : (diffPercentage <= 0.25 ? '🟨' : '🟥');
      let directionEmoji = diffPercentage <= 0.05 ? '✅' : (guessVal < product.price ? '⬆️' : '⬇️');
      return `${colorEmoji}${directionEmoji}`;
    }).join('\n');

    const shareText = `Palengkedle #${gameNumber}\n${attemptCount}/6 ${resultEmoji}\n${emojiGrid}\nhttps://palengkedle.com`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert("Results copied to clipboard! 📋");
    } catch {
      alert("Oops! Your browser blocked the clipboard copy.");
    }
  };

  // Full-page Loading/Error states
  if (loading) return <div className="flex justify-center items-center h-screen font-sans text-xl font-bold text-gray-600 dark:text-gray-300 dark:bg-gray-900">Loading today's item... 🛒</div>;
  if (error || !product) return <div className="flex justify-center items-center h-screen font-sans text-xl font-bold text-red-500 dark:bg-gray-900">Error: {error}</div>;

  return (
    <div className="flex justify-center w-full min-h-screen m-0 p-5 box-border bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="w-full max-w-125 font-sans text-center">
        
        <Header currentView={currentView} setView={setCurrentView} />

        {currentView === 'help' && <HowToPlay />}
        
        {currentView === 'stats' && (
          <StatsView stats={stats} todayAttemptCount={isWinner && isGameOver ? guesses.length : null} />
        )}
        
        {/* NEW: Clean, componentized game view */}
        {currentView === 'game' && (
          <GameView 
            product={product}
            guesses={guesses}
            currentGuess={currentGuess}
            setCurrentGuess={setCurrentGuess}
            isWinner={isWinner}
            isGameOver={isGameOver}
            isAnimating={isAnimating}
            imageLoaded={imageLoaded}
            setImageLoaded={setImageLoaded}
            handleGuess={handleGuess}
            handleShare={handleShare}
            maxGuesses={MAX_GUESSES}
          />
        )}
      </div>
    </div>
  );
}