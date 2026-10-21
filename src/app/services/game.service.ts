import { Injectable, signal, computed } from '@angular/core';
import { City, Difficulty, RoundCount, RoundResult } from '../models/city.model';
import { appConfig } from '../app-config';
import citiesData from '../../assets/data/cities.dk.json';
import easyStyle from '../../assets/styles/easy.json';

const DIFFICULTY_TIERS: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 40000, max: Infinity },
  medium: { min: 20000, max: 40000 },
  hard: { min: 0, max: 20000 },
};

export const ROUND_COUNT_OPTIONS: RoundCount[] = [5, 10, 15];

export type ScreenState = 'start' | 'playing' | 'finished';
export type RoundState = 'playing' | 'correct' | 'wrong';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly cities: City[] = citiesData as City[];
  private readonly ROUND_COUNT_KEY = 'map-guesser-round-count';
  private readonly DIFFICULTY_KEY = 'map-guesser-difficulty';
  private readonly HIGH_SCORE_PREFIX = 'map-guesser-high-score';

  private readonly sortedCities: City[] = [...this.cities].sort(
    (a, b) => b.population - a.population
  );

  // Screen + settings
  screenState = signal<ScreenState>('start');
  roundCount = signal<RoundCount>(this.loadRoundCount());
  difficulty = signal<Difficulty>(this.loadDifficulty());

  // Current game
  currentCity = signal<City | null>(null);
  choiceOptions = signal<string[]>([]);
  gameState = signal<RoundState>('playing');
  lastGuess = signal<string>('');
  results = signal<RoundResult[]>([]);
  streak = signal<number>(0);
  bestStreak = signal<number>(0);

  // High score (correct answers per game, stored per difficulty + round count)
  highScore = signal<number>(0);
  isNewHighScore = signal<boolean>(false);

  pool = computed(() => {
    const tier = DIFFICULTY_TIERS[this.difficulty()];
    return this.sortedCities.filter(
      (c) => c.population >= tier.min && c.population < tier.max
    );
  });
  poolSize = computed(() => this.pool().length);
  totalRounds = computed(() => Math.min(this.roundCount(), this.poolSize()));
  correctCount = computed(() => this.results().filter((r) => r.correct).length);
  playedCount = computed(() => this.results().length);
  currentRound = computed(() =>
    Math.min(
      this.playedCount() + (this.gameState() === 'playing' ? 1 : 0),
      this.totalRounds()
    )
  );
  isLastRound = computed(() => this.playedCount() >= this.totalRounds());
  accuracy = computed(() =>
    this.playedCount() === 0
      ? 0
      : Math.round((this.correctCount() / this.playedCount()) * 100)
  );
  missedCities = computed(() =>
    this.results()
      .filter((r) => !r.correct)
      .map((r) => r.name)
  );

  // Fixed style — always use easy (all roads + water)
  style = computed(() => {
    const style = JSON.parse(JSON.stringify(easyStyle));
    const apiKey = appConfig.mapTilerKey;
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

  private usedCities = new Set<string>();

  constructor() {
    this.loadHighScore();
  }

  // ── Settings ──────────────────────────────────────────────

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty.set(difficulty);
    this.store(this.DIFFICULTY_KEY, difficulty);
    this.loadHighScore();
  }

  cycleRoundCount(): void {
    const i = ROUND_COUNT_OPTIONS.indexOf(this.roundCount());
    const next = ROUND_COUNT_OPTIONS[(i + 1) % ROUND_COUNT_OPTIONS.length];
    this.roundCount.set(next);
    this.store(this.ROUND_COUNT_KEY, next.toString());
    this.loadHighScore();
  }

  // ── Game flow ─────────────────────────────────────────────

  beginPlaying(): void {
    this.usedCities.clear();
    this.results.set([]);
    this.streak.set(0);
    this.bestStreak.set(0);
    this.isNewHighScore.set(false);
    this.loadHighScore();
    this.screenState.set('playing');
    this.startNewRound();
  }

  startNewRound(): void {
    const eligible = this.pool().filter((c) => !this.usedCities.has(c.name));
    if (eligible.length === 0 || this.usedCities.size >= this.totalRounds()) {
      this.endGame();
      return;
    }

    const city = eligible[Math.floor(Math.random() * eligible.length)];
    this.currentCity.set(city);
    this.gameState.set('playing');
    this.lastGuess.set('');
    this.choiceOptions.set(this.generateChoiceOptions(city.name));
  }

  submitGuess(guess: string): boolean {
    const city = this.currentCity();
    if (!city || this.gameState() !== 'playing') return false;

    const correct =
      this.normalizeString(guess) === this.normalizeString(city.name);

    this.usedCities.add(city.name);
    this.results.update((r) => [...r, { name: city.name, correct }]);
    this.lastGuess.set(guess);

    if (correct) {
      this.streak.update((s) => s + 1);
      this.bestStreak.update((b) => Math.max(b, this.streak()));
      this.gameState.set('correct');
    } else {
      this.streak.set(0);
      this.gameState.set('wrong');
    }
    return correct;
  }

  endGame(): void {
    if (this.playedCount() === 0) {
      this.returnToStart();
      return;
    }
    const score = this.correctCount();
    const isNew = score > this.highScore();
    this.isNewHighScore.set(isNew);
    if (isNew) this.saveHighScore(score);
    this.screenState.set('finished');
  }

  returnToStart(): void {
    this.screenState.set('start');
    this.currentCity.set(null);
    this.gameState.set('playing');
    this.usedCities.clear();
  }

  // ── Helpers ───────────────────────────────────────────────

  private generateChoiceOptions(correctName: string, count = 4): string[] {
    let wrongPool = this.pool()
      .map((c) => c.name)
      .filter((n) => n !== correctName);

    // Fall back to all cities if the selected pool is too small
    if (wrongPool.length < count - 1) {
      wrongPool = this.sortedCities
        .map((c) => c.name)
        .filter((n) => n !== correctName);
    }

    const wrong = this.shuffle(wrongPool).slice(0, count - 1);
    return this.shuffle([correctName, ...wrong]);
  }

  private shuffle<T>(items: T[]): T[] {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replaceAll(/[̀-ͯ]/g, '')
      .trim();
  }

  private loadRoundCount(): RoundCount {
    const parsed = Number.parseInt(this.read(this.ROUND_COUNT_KEY) ?? '10', 10);
    return ROUND_COUNT_OPTIONS.includes(parsed as RoundCount)
      ? (parsed as RoundCount)
      : 10;
  }

  private loadDifficulty(): Difficulty {
    const stored = this.read(this.DIFFICULTY_KEY);
    return stored === 'easy' || stored === 'medium' || stored === 'hard'
      ? stored
      : 'easy';
  }

  private highScoreKey(): string {
    return `${this.HIGH_SCORE_PREFIX}-${this.difficulty()}-${this.totalRounds()}`;
  }

  private loadHighScore(): void {
    const stored = this.read(this.highScoreKey());
    this.highScore.set(stored ? Number.parseInt(stored, 10) || 0 : 0);
  }

  private saveHighScore(score: number): void {
    this.store(this.highScoreKey(), score.toString());
    this.highScore.set(score);
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private store(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable (private mode etc.) — settings just won't persist
    }
  }
}
