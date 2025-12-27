import { Injectable, signal, computed } from '@angular/core';
import { City, Difficulty } from '../models/city.model';
import { environment } from '../../environments/environment';
import citiesData from '../../assets/data/cities.dk.json';
import easyStyle from '../../assets/styles/easy.json';
import mediumStyle from '../../assets/styles/medium.json';
import hardStyle from '../../assets/styles/hard.json';
import extremeStyle from '../../assets/styles/extreme.json';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly cities: City[] = citiesData as City[];
  private readonly STORAGE_KEY = 'map-guesser-cities-count';
  private readonly HIGH_SCORE_PREFIX = 'map-guesser-high-score';

  // Signals for reactive state
  screenState = signal<'start' | 'settings' | 'playing' | 'finished'>('start');
  currentCity = signal<City | null>(null);
  citiesToInclude = signal<number>(this.loadCitiesCount());
  difficulty = signal<Difficulty>('easy');
  streak = signal<number>(0);
  highScore = signal<number>(0);
  gameState = signal<'playing' | 'correct' | 'wrong' | 'completed'>('playing');
  lastGuess = signal<string>('');
  finalScore = signal<number>(0);
  isNewHighScore = signal<boolean>(false);

  private usedCities: Set<string> = new Set();

  // Computed signal for style that updates when difficulty changes
  style = computed(() => {
    const styles = {
      easy: easyStyle,
      medium: mediumStyle,
      hard: hardStyle,
      extreme: extremeStyle,
    };
    const style = JSON.parse(JSON.stringify(styles[this.difficulty()]));

    // Inject API key into style
    const apiKey = environment.mapTilerKey;
    if (style.sources?.openmaptiles?.url) {
      style.sources.openmaptiles.url = style.sources.openmaptiles.url.replace(
        '{MAPTILER_KEY}',
        apiKey
      );
    }
    if (style.glyphs) {
      style.glyphs = style.glyphs.replace('{MAPTILER_KEY}', apiKey);
    }

    return style;
  });

  private sortedCities: City[] = [];

  constructor() {
    // Prepare sorted list of cities by population (desc)
    this.sortedCities = [...this.cities].sort(
      (a, b) => b.population - a.population
    );
    this.loadHighScore();
  }

  private loadCitiesCount(): number {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    // Default to 5 cities if not set
    return stored ? Number.parseInt(stored, 10) : 5;
  }

  private saveCitiesCount(count: number): void {
    localStorage.setItem(this.STORAGE_KEY, count.toString());
  }

  private getHighScoreKey(): string {
    return `${
      this.HIGH_SCORE_PREFIX
    }-${this.difficulty()}-${this.citiesToInclude()}`;
  }

  private loadHighScore(): void {
    const stored = localStorage.getItem(this.getHighScoreKey());
    this.highScore.set(stored ? Number.parseInt(stored, 10) : 0);
  }

  private saveHighScore(score: number): void {
    localStorage.setItem(this.getHighScoreKey(), score.toString());
    this.highScore.set(score);
  }

  setCitiesCount(count: number): void {
    // Clamp to valid range
    const max = this.cities.length;
    const clamped = Math.max(1, Math.min(count, max));
    this.citiesToInclude.set(clamped);
    this.saveCitiesCount(clamped);
    this.loadHighScore();
    this.usedCities.clear();
    this.streak.set(0);
    this.startNewRound();
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty.set(difficulty);
    this.loadHighScore();
    this.usedCities.clear();
    this.streak.set(0);
  }

  startNewRound(): void {
    const topN = this.sortedCities.slice(0, this.citiesToInclude());
    const eligibleCities = topN.filter(
      (city) => !this.usedCities.has(city.name)
    );

    if (eligibleCities.length === 0) {
      // Completed the run (attempted all selected cities)
      this.gameState.set('completed');
      return;
    }

    const randomIndex = Math.floor(Math.random() * eligibleCities.length);
    this.currentCity.set(eligibleCities[randomIndex]);
    this.gameState.set('playing');
    this.lastGuess.set('');
  }

  submitGuess(guess: string): boolean {
    const currentCityName = this.currentCity()?.name;
    if (!currentCityName) return false;

    const normalizedGuess = this.normalizeString(guess);
    const normalizedAnswer = this.normalizeString(currentCityName);

    const isCorrect = normalizedGuess === normalizedAnswer;

    // Mark current city as attempted regardless of correctness
    this.usedCities.add(currentCityName);

    if (isCorrect) {
      this.streak.update((s) => s + 1);
      const newStreak = this.streak();
      if (newStreak > this.highScore()) {
        this.saveHighScore(newStreak);
      }
      this.gameState.set('correct');
    } else {
      // Wrong answer: set state to 'wrong' and let the App component
      // show feedback briefly before ending the game.
      this.gameState.set('wrong');
    }

    this.lastGuess.set(guess);
    return isCorrect;
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '') // Remove diacritics
      .trim();
  }

  getCitiesCount(): number {
    return this.citiesToInclude();
  }

  getTotalCityCount(): number {
    return this.cities.length;
  }

  getAttemptedCount(): number {
    return this.usedCities.size;
  }

  getRemainingCount(): number {
    const remaining = this.citiesToInclude() - this.usedCities.size;
    return remaining > 0 ? remaining : 0;
  }

  getAvailableCityNames(): string[] {
    return this.cities.map((city) => city.name).sort();
  }

  restartAfterCompletion(): void {
    this.usedCities.clear();
    this.streak.set(0);
    this.startNewRound();
  }

  // Screen flow methods
  startGame(): void {
    this.screenState.set('settings');
  }

  beginPlaying(): void {
    this.screenState.set('playing');
    this.usedCities.clear();
    this.streak.set(0);
    this.loadHighScore();
    this.startNewRound();
  }

  endGame(): void {
    const currentScore = this.streak();
    const currentHighScore = this.highScore();
    this.finalScore.set(currentScore);
    this.isNewHighScore.set(currentScore > currentHighScore);

    if (currentScore > currentHighScore) {
      this.saveHighScore(currentScore);
    }

    this.screenState.set('finished');
  }

  returnToStart(): void {
    this.screenState.set('start');
    this.currentCity.set(null);
    this.streak.set(0);
    this.gameState.set('playing');
    this.usedCities.clear();
  }
}
