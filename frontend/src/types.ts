export interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  gameDate: string;
}

export interface GameStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[]; // Array of 6 numbers
}

export type ViewState = 'game' | 'help' | 'stats';