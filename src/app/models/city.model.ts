export interface City {
  name: string;
  population: number;
  lat: number;
  lon: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type RoundCount = 5 | 10 | 15;
