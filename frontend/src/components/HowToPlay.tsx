export default function HowToPlay() {
  const divider = <hr className="border-t-2 border-gray-200 dark:border-gray-700 my-6 transition-colors" />;

  const DemoRow = ({ price, colorClass, arrow }: { price: string, colorClass: string, arrow: string }) => (
    <div className="flex gap-2 h-12 w-full max-w-75 my-2.5">
      <div className="flex-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-xl text-gray-900 dark:text-white font-bold shadow-sm transition-colors">
        ₱{price}
      </div>
      <div className={`flex-1 rounded-lg flex items-center justify-center text-xl text-white font-bold shadow-sm ${colorClass}`}>
        {arrow}
      </div>
    </div>
  );

  return (
    <div className="text-left text-gray-800 dark:text-gray-200 leading-relaxed transition-colors">
      
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Palengkedle</h3>
      <p>Guess the <strong>product's price</strong> in 6 tries.</p>
      <p>Incorrect guesses will help guide you to the target price.</p>
      <p>If you guess within 5% of the target price, you win!</p>
      <p className="mt-4 font-bold">A new Palengkedle is available every day!</p>

      {divider}

      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sample Game</h3>
      
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-2 inline-block mb-3 bg-gray-50 dark:bg-gray-800 transition-colors">
        <h4 className="m-0 text-base text-center">SM Bonus White Sugar 1kg</h4>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">We are trying to guess the price of this SM Bonus White Sugar</p>

      <DemoRow price="50.00" colorClass="bg-red-500" arrow="⬆️" />
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The first guess of ₱50.00 is lower by more than 25% of the target price.</p>

      <DemoRow price="90.00" colorClass="bg-yellow-500" arrow="⬇️" />
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The second guess of ₱90.00 is too high but within 25% of the target price.</p>

      <DemoRow price="85.00" colorClass="bg-green-500" arrow="✅" />
      <p className="text-sm text-gray-500 dark:text-gray-400">The third guess of ₱85.00 was within 5% of the target price! You win!</p>

      {divider}

      <p className="mb-2">Thank you for playing my game! I made this clone to learn more about full stack development! hehe</p>
      <p className="mb-1">Source code available on my <a href="https://github.com/reneaquitania" target="_blank" rel="noreferrer" className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">GitHub!</a></p>
      <p className="mb-1">Suggestions? Find a bug? <a href="mailto:palengkedle@gmail.com" className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">Let me know!</a></p>
      <p className="mb-4">Special thanks to <a href="https://costcodle.com" target="_blank" rel="noreferrer" className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">COSTCODLE</a> for existing and being the basis for the game &lt;3 </p>
      <p className="mt-6 font-bold">
        Created by <a href="https://reneaquitania.github.io/portfolio/" target="_blank" rel="noreferrer" className="text-green-600 dark:text-green-500 hover:text-green-800 dark:hover:text-green-400 underline">Rene</a>
      </p>
    </div>
  );
}