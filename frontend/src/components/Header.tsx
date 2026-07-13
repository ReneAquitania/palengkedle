import type { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export default function Header({ currentView, setView }: HeaderProps) {
  let title = "Palengkedle 🇵🇭";
  if (currentView === 'help') title = "HOW TO PLAY";
  if (currentView === 'stats') title = "GAME STATS";

  // Stats/How to play icon button classes
  const btnClasses = "text-xl cursor-pointer p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200 transition-all flex items-center justify-center";

  return (
    <header className="relative flex justify-center items-center mb-5 w-full h-14 transition-colors">
      <button 
        onClick={() => setView(currentView === 'help' ? 'game' : 'help')} 
        className={`absolute left-0 ${btnClasses}`}
        title="How to play"
      >
        ❓
      </button>

      <div className="text-center">
        <h1 className={`font-bold text-green-600 dark:text-green-500 m-0 ${currentView === 'game' ? 'text-4xl' : 'text-2xl sm:text-3xl'}`}>
          {title}
        </h1>
      </div>

      <button 
        onClick={() => setView(currentView === 'stats' ? 'game' : 'stats')} 
        className={`absolute right-0 ${btnClasses}`}
        title="Statistics"
      >
        📊
      </button>
    </header>
  );
}