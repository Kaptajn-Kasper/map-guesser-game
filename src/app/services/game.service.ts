import { Injectable, signal, computed } from '@angular/core';
import { City, Difficulty, RoundCount } from '../models/city.model';
import { environment } from '../../environments/environment';
import citiesData from '../../assets/data/cities.dk.json';
import easyStyle from '../../assets/styles/easy.json';

const DIFFICULTY_TIERS: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 40000, max: Infinity },
  medium: { min: 20000, max: 40000 },
  hard: { min: 0, max: 20000 },
};

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly cities: City[] = citiesData as City[];
  private readonly ROUND_COUNT_KEY = 'map-guesser-round-count';
  private readonly DIFFICULTY_KEY = 'map-guesser-difficulty';
  private readonly HIGH_SCORE_PREFIX = 'map-guesser-high-score';

  // Signals for reactive state
  screenState = signal<'start' | 'settings' | 'playing' | 'finished'>('start');
  currentCity = signal<City | null>(null);
  roundCount = signal<RoundCount>(this.loadRoundCount());
  difficulty = signal<Difficulty>(this.loadDifficulty());
  streak = signal<number>(0);
  highScore = signal<number>(0);
  gameState = signal<'playing' | 'correct' | 'wrong' | 'completed'>('playing');
  lastGuess = signal<string>('');
  finalScore = signal<number>(0);
  isNewHighScore = signal<boolean>(false);
  choiceOptions = signal<string[]>([]);

  private usedCities: Set<string> = new Set();

  // Fixed style — always use easy (all roads + water)
  style = computed(() => {
    const style = JSON.parse(JSON.stringify(easyStyle));

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

  private loadRoundCount(): RoundCount {
    const stored = localStorage.getItem(this.ROUND_COUNT_KEY);
    const parsed = stored ? Number.parseInt(stored, 10) : 10;
    return [5, 10, 15].includes(parsed) ? (parsed as RoundCount) : 10;
  }

  private saveRoundCount(count: RoundCount): void {
    localStorage.setItem(this.ROUND_COUNT_KEY, count.toString());
  }

  private loadDifficulty(): Difficulty {
    const stored = localStorage.getItem(this.DIFFICULTY_KEY);
    if (stored === 'easy' || stored === 'medium' || stored === 'hard') {
      return stored;
    }
    return 'easy';
  }

  private saveDifficulty(difficulty: Difficulty): void {
    localStorage.setItem(this.DIFFICULTY_KEY, difficulty);
  }

  private getHighScoreKey(): string {
    return `${this.HIGH_SCORE_PREFIX}-${this.difficulty()}-${this.getRoundCount()}`;
  }

  private loadHighScore(): void {
    const stored = localStorage.getItem(this.getHighScoreKey());
    this.highScore.set(stored ? Number.parseInt(stored, 10) : 0);
  }

  private saveHighScore(score: number): void {
    localStorage.setItem(this.getHighScoreKey(), score.toString());
    this.highScore.set(score);
  }

  getPoolForDifficulty(): City[] {
    const tier = DIFFICULTY_TIERS[this.difficulty()];
    return this.sortedCities.filter(
      (c) => c.population >= tier.min && c.population < tier.max
    );
  }

  getPoolSize(): number {
    return this.getPoolForDifficulty().length;
  }

  getRoundCount(): number {
    return Math.min(this.roundCount(), this.getPoolSize());
  }

  setRoundCount(count: RoundCount): void {
    this.roundCount.set(count);
    this.saveRoundCount(count);
    this.loadHighScore();
    this.usedCities.clear();
    this.streak.set(0);
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty.set(difficulty);
    this.saveDifficulty(difficulty);
    this.loadHighScore();
    this.usedCities.clear();
    this.streak.set(0);
  }

  startNewRound(): void {
    const pool = this.getPoolForDifficulty();
    const effectiveRounds = Math.min(this.roundCount(), pool.length);
    const eligibleCities = pool.filter(
      (city) => !this.usedCities.has(city.name)
    );

    if (
      eligibleCities.length === 0 ||
      this.usedCities.size >= effectiveRounds
    ) {
      // Completed the run (attempted all selected rounds)
      this.gameState.set('completed');
      return;
    }

    const randomIndex = Math.floor(Math.random() * eligibleCities.length);
    this.currentCity.set(eligibleCities[randomIndex]);
    this.gameState.set('playing');
    this.lastGuess.set('');
    this.generateChoiceOptions();
  }

  private generateChoiceOptions(count = 4): void {
    const correctName = this.currentCity()?.name;
    if (!correctName) return;

    const pool = this.getPoolForDifficulty();
    let wrongPool = pool
      .filter((c) => c.name !== correctName)
      .map((c) => c.name);

    // Fall back to all cities if the selected pool is too small
    if (wrongPool.length < count - 1) {
      wrongPool = this.sortedCities
        .filter((c) => c.name !== correctName)
        .map((c) => c.name);
    }

    // Shuffle and pick count-1 wrong answers
    const shuffled = wrongPool.sort(() => Math.random() - 0.5);
    const wrongAnswers = shuffled.slice(0, count - 1);

    // Combine and shuffle all options
    const options = [correctName, ...wrongAnswers].sort(
      () => Math.random() - 0.5
    );
    this.choiceOptions.set(options);
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
      // Wrong answer: reset streak and let the App component
      // show feedback briefly before ending the game.
      this.streak.set(0);
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

  getTotalCityCount(): number {
    return this.cities.length;
  }

  getAttemptedCount(): number {
    return this.usedCities.size;
  }

  getRemainingCount(): number {
    const remaining = this.getRoundCount() - this.usedCities.size;
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
