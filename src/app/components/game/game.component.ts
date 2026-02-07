import { Component, output, input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <!-- Choice buttons (bottom bar content) -->
    @if (gameState === 'playing') {
    <div class="choice-row">
      @for (option of choiceOptions(); track option) {
      <button class="choice-btn" (click)="onChoiceSelected(option)">
        {{ option }}
      </button>
      }
    </div>
    }

    <!-- Feedback toast -->
    @if (gameState === 'correct') {
    <div class="feedback-toast correct">
      <span class="feedback-icon">&#10003;</span>
      <span class="feedback-text">
        {{ 'GAME.CORRECT' | translate }} &mdash; {{ lastGuess }}
      </span>
      <button class="next-btn" (click)="onNextCity()">
        {{ 'GAME.NEXT_CITY' | translate }} &rarr;
      </button>
    </div>
    }
    @if (gameState === 'wrong') {
    <div class="feedback-toast wrong">
      <span class="feedback-icon">&#10007;</span>
      <span class="feedback-text">
        {{ lastGuess }} &mdash; {{ 'GAME.CORRECT_ANSWER' | translate }}:
        <strong>{{ correctAnswer }}</strong>
      </span>
      <button class="next-btn" (click)="onNextCity()">
        {{ 'GAME.NEXT_CITY' | translate }} &rarr;
      </button>
    </div>
    }
    @if (gameState === 'completed') {
    <div class="feedback-toast celebration">
      <span class="feedback-icon">&#9733;</span>
      <span class="feedback-text">
        {{ 'GAME.CONGRATULATIONS' | translate }} &mdash;
        {{ 'GAME.PERFECT_SCORE' | translate }}
      </span>
    </div>
    }
  `,
  styles: [
    `
      /* Choice buttons - single row on desktop, 2x2 on mobile */
      .choice-row {
        display: flex;
        gap: 0.5rem;
        width: 100%;
      }

      .choice-btn {
        flex: 1;
        padding: 0.625rem 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        border: 2px solid var(--brand-primary-deep);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.95);
        color: var(--brand-text-primary);
        cursor: pointer;
        transition:
          background 0.15s,
          transform 0.1s;
        text-align: center;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      @media (hover: hover) {
        .choice-btn:hover {
          background: var(--brand-primary-deep);
          color: var(--brand-text-light);
        }
      }

      .choice-btn:focus {
        outline: none;
      }

      .choice-btn:focus-visible {
        outline: 2px solid var(--brand-primary-deep);
        outline-offset: 2px;
      }

      .choice-btn:active {
        background: var(--brand-primary-deep);
        color: var(--brand-text-light);
        transform: scale(0.97);
      }

      @media (max-width: 600px) {
        .choice-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .choice-btn {
          font-size: 0.95rem;
          padding: 0.5rem 0.375rem;
          min-height: 44px;
        }
      }

      /* Feedback toast - inline in bottom bar */
      .feedback-toast {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 500;
      }

      .feedback-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
        width: 1.5rem;
        text-align: center;
      }

      .feedback-text {
        flex: 1;
        min-width: 0;
      }

      .next-btn {
        flex-shrink: 0;
        padding: 0.375rem 0.75rem;
        font-size: 0.85rem;
        font-weight: 600;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        white-space: nowrap;
        min-height: 36px;
        transition: opacity 0.15s;
      }

      .next-btn:hover {
        opacity: 0.85;
      }

      .correct {
        background: var(--brand-success-bg);
        border: 1px solid var(--brand-success-border);
        color: var(--brand-success-text);

        .next-btn {
          background: var(--brand-success-border);
          color: var(--brand-text-light);
        }
      }

      .wrong {
        background: var(--brand-error-bg);
        border: 1px solid var(--brand-error-border);
        color: var(--brand-error-text);

        .next-btn {
          background: var(--brand-error-border);
          color: var(--brand-text-light);
        }
      }

      .celebration {
        background: linear-gradient(
          135deg,
          var(--brand-secondary-soft-teal) 0%,
          var(--brand-primary-deep) 100%
        );
        border: 1px solid var(--brand-accent-teal);
        color: var(--brand-text-light);
      }
    `,
  ],
})
export class GameComponent {
  choiceOptions = input.required<string[]>();
  totalSelectedCities = input<number>(0);
  attemptedCount = input<number>(0);
  remainingCount = input<number>(0);

  streak = 0;
  highScore = 0;
  gameState: 'playing' | 'correct' | 'wrong' | 'completed' = 'playing';
  lastGuess = '';
  correctAnswer = '';

  guessSubmitted = output<string>();
  nextCityRequested = output<void>();
  restartRequested = output<void>();

  onChoiceSelected(city: string): void {
    if (this.gameState === 'playing') {
      this.guessSubmitted.emit(city);
    }
  }

  onNextCity(): void {
    this.nextCityRequested.emit();
  }

  onRestart(): void {
    this.restartRequested.emit();
  }

  updateGameState(
    state: 'playing' | 'correct' | 'wrong' | 'completed',
    streak: number,
    lastGuess: string,
    correctAnswer: string,
    highScore: number
  ): void {
    this.gameState = state;
    this.streak = streak;
    this.lastGuess = lastGuess;
    this.correctAnswer = correctAnswer;
    this.highScore = highScore;
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: Event): void {
    if (this.gameState === 'correct' || this.gameState === 'wrong') {
      event.preventDefault();
      this.onNextCity();
    }
  }
}
