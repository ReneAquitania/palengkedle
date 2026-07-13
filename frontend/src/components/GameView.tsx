import type { Product } from '../types';

interface GameViewProps {
  product: Product;
  guesses: number[];
  currentGuess: string;
  setCurrentGuess: (guess: string) => void;
  isWinner: boolean;
  isGameOver: boolean;
  isAnimating: boolean;
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
  handleGuess: (e: React.FormEvent<HTMLFormElement>) => void;
  handleShare: () => void;
  maxGuesses: number;
}

export default function GameView({
  product,
  guesses,
  currentGuess,
  setCurrentGuess,
  isWinner,
  isGameOver,
  isAnimating,
  imageLoaded,
  setImageLoaded,
  handleGuess,
  handleShare,
  maxGuesses
}: GameViewProps) {
  return (
    <>
      <style>
        {`
          @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes fadeOut { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.9); } }
        `}
      </style>

      <p className="text-gray-500 dark:text-gray-400 mb-5 mt-0 font-medium transition-colors">
        Guess the price! (Within 5% wins)
      </p>

      {/* Product Card */}
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm mb-5 transition-colors">
        <div className="relative w-full h-50 mb-2 flex justify-center items-center bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
          {!imageLoaded && <div className="absolute text-gray-400 dark:text-gray-500 font-bold text-lg">Loading image... ⏳</div>}
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            onLoad={() => setImageLoaded(true)} 
            className={`w-full h-full object-contain rounded-lg ${imageLoaded ? 'block' : 'hidden'}`} 
          />
        </div>
        <h2 className="text-xl font-bold m-1 text-gray-800 dark:text-gray-100">{product.name}</h2>
      </div>

      {/* Guess Grid */}
      <div className="flex flex-col gap-2 mb-6">
        {Array.from({ length: maxGuesses }).map((_, index) => {
          const guessVal = guesses[index];

          if (guessVal === undefined) {
            const isTargetBox = index === guesses.length && isAnimating;
            return (
              <div 
                key={index} 
                className="h-12 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors" 
                style={{ animation: isTargetBox ? 'fadeOut 0.3s ease-in forwards' : 'none' }} 
              />
            );
          }

          const diffPercentage = Math.abs(guessVal - product.price) / product.price;
          const bgColorClass = diffPercentage <= 0.05 ? 'bg-green-500' : (diffPercentage <= 0.25 ? 'bg-yellow-500' : 'bg-red-500');
          const arrowIcon = diffPercentage <= 0.05 ? '✅' : (guessVal < product.price ? '⬆️' : '⬇️');

          return (
            <div key={index} className="flex gap-2 h-12" style={{ animation: 'popIn 0.3s ease-out forwards' }}>
              <div className="flex-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-xl text-gray-900 dark:text-white font-bold shadow-sm transition-colors">
                ₱{guessVal.toFixed(2)}
              </div>
              <div className={`flex-1 rounded-lg flex items-center justify-center text-xl text-white font-bold shadow-sm ${bgColorClass}`}>
                {arrowIcon}
              </div>
            </div>
          );
        })}
      </div>

      {/* Game Over Banner */}
      {isGameOver && (
        <div 
          className={`p-4 mb-5 rounded-lg text-xl font-bold border-2 transition-colors ${isWinner ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'}`} 
          style={{ animation: 'popIn 0.4s ease-out forwards' }}
        >
          <div className="mb-1">{isWinner ? '🎉 You got it!' : 'Game Over!'}</div>
          <div className="font-normal text-lg">The actual price is <strong>₱{product.price.toFixed(2)}</strong></div>
        </div>
      )}

      {/* Guess Input/Share button */}
      {isGameOver ? (
        <button 
          onClick={handleShare} 
          className="w-full py-3 px-6 text-xl bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg cursor-pointer font-bold shadow-sm transition-colors"
          style={{ animation: 'popIn 0.5s ease-out forwards' }}
        >
          Share Result 📋
        </button>
      ) : (
        <form onSubmit={handleGuess} className="flex gap-3 justify-center">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-xl text-gray-500 dark:text-gray-400 font-bold">₱</span>
            <input 
              type="number" 
              step="0.01" 
              value={currentGuess} 
              onChange={(e) => setCurrentGuess(e.target.value)} 
              disabled={isAnimating} 
              placeholder="0.00" 
              className="py-3 pr-4 pl-9 text-xl rounded-lg border-2 border-gray-300 dark:border-gray-600 w-37.5 outline-none bg-white dark:bg-gray-800 text-black dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-900 transition-colors shadow-sm"
            />
          </div>
          <button 
            type="submit" 
            disabled={!currentGuess || isAnimating} 
            className="py-3 px-6 text-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-lg disabled:cursor-not-allowed font-bold shadow-sm transition-colors"
          >
            Guess
          </button>
        </form>
      )}
    </>
  );
}