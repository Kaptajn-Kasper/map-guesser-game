import { Component, HostListener, computed, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import confetti from 'canvas-confetti';
import { GameService } from './services/game.service';
import { MapComponent } from './components/map/map.component';
import { Difficulty } from './models/city.model';

const LANGUAGE_KEY = 'map-guesser-language';
const CHOICE_TILTS = [-1.5, 1, 1.2, -1];
const DIFFICULTY_TILTS: Record<Difficulty, number> = { easy: -2, medium: 1.5, hard: -1 };
const BRAND_CONFETTI = ['#d0b1e3', '#abdee5', '#5b426c', '#0099e5', '#8bc6d4', '#9a66bf'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, MapComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  readonly difficultyTilts = DIFFICULTY_TILTS;
  readonly choiceTilts = CHOICE_TILTS;

  language = signal<string>('da');

  /** Round-by-round strip on the play screen: one slot per round. */
  progressSlots = computed(() => {
    const results = this.game.results();
    const total = this.game.totalRounds();
    const playing = this.game.gameState() === 'playing';
    return Array.from({ length: total }, (_, i) => {
      const r = results[i];
      if (r) return r.correct ? 'correct' : 'wrong';
      return playing && i === results.length ? 'current' : 'todo';
    });
  });

  verdictKey = computed(() => {
    const acc = this.game.accuracy();
    if (acc === 100) return 'RESULTS.VERDICT_PERFECT';
    if (acc >= 70) return 'RESULTS.VERDICT_GREAT';
    if (acc >= 40) return 'RESULTS.VERDICT_OK';
    return 'RESULTS.VERDICT_LOW';
  });

  constructor(
    public game: GameService,
    private translate: TranslateService
  ) {
    const saved = this.readLanguage();
    translate.setFallbackLang('da');
    translate.use(saved);
    this.language.set(saved);
    document.documentElement.lang = saved;

    effect(() => {
      if (this.game.gameState() === 'correct') this.fireConfetti();
    });

    // Match the page background to each screen so iOS overscroll blends in
    effect(() => {
      const bg = this.game.screenState() === 'playing' ? '#cfe7ed' : '#d0b1e3';
      document.body.style.background = bg;
      document.documentElement.style.background = bg;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    });
  }

  toggleLanguage(): void {
    const next = this.language() === 'da' ? 'en' : 'da';
    this.language.set(next);
    this.translate.use(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }

  choose(option: string): void {
    this.game.submitGuess(option);
  }

  choiceState(option: string): 'idle' | 'correct' | 'wrong' | 'faded' {
    const state = this.game.gameState();
    if (state === 'playing') return 'idle';
    if (option === this.game.currentCity()?.name) return 'correct';
    if (option === this.game.lastGuess()) return 'wrong';
    return 'faded';
  }

  next(): void {
    this.game.startNewRound();
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: Event): void {
    if (this.game.screenState() === 'playing' && this.game.gameState() !== 'playing') {
      event.preventDefault();
      this.next();
    }
  }

  private fireConfetti(): void {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    confetti({
      particleCount: 90,
      spread: 70,
      startVelocity: 35,
      origin: { y: 0.35 },
      colors: BRAND_CONFETTI,
      disableForReducedMotion: true,
    });
  }

  private readLanguage(): string {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      return saved === 'en' || saved === 'da' ? saved : 'da';
    } catch {
      return 'da';
    }
  }
}
