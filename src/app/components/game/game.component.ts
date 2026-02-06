import { Component, output, input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, TranslateModule, Button],
  template: `
    <div class="game-panel">
      <div class="streak">
        <h2>
          {{ 'GAME.CORRECT_SO_FAR' | translate }}:
          {{
            (attemptedCount() ? (streak / attemptedCount()) * 100 : 0)
              | number : '1.0-0'
          }}%
        </h2>
        <p class="high-score">
          {{ 'GAME.HIGH_SCORE' | translate }}: {{ highScore }}
        </p>
      </div>
      <p class="progress">
        {{ 'GAME.ATTEMPTED' | translate }}: {{ attemptedCount() }} /
        {{ totalSelectedCities() }} · {{ 'GAME.REMAINING' | translate }}:
        {{ remainingCount() }}
      </p>

      @if (gameState === 'playing') {
      <div class="choice-grid">
        @for (option of choiceOptions(); track option) {
        <button class="choice-btn" (click)="onChoiceSelected(option)">
          {{ option }}
        </button>
        }
      </div>
      }

      @if (gameState === 'correct') {
      <div class="feedback correct">
        <h3>{{ 'GAME.CORRECT' | translate }}</h3>
        <p>{{ 'GAME.CORRECT_MESSAGE' | translate : { city: lastGuess } }}</p>
        <p-button
          [label]="'GAME.NEXT_CITY' | translate"
          (onClick)="onNextCity()"
          severity="success"
        />
      </div>
      } @if (gameState === 'wrong') {
      <div class="feedback wrong">
        <h3>{{ 'GAME.WRONG' | translate }}</h3>
        <p>
          {{ 'GAME.YOUR_GUESS' | translate }}: <strong>{{ lastGuess }}</strong>
        </p>
        <p>
          {{ 'GAME.CORRECT_ANSWER' | translate }}:
          <strong>{{ correctAnswer }}</strong>
        </p>
        <p>{{ 'GAME.STREAK_RESET' | translate }}</p>
        <p-button
          [label]="'GAME.NEXT_CITY' | translate"
          (onClick)="onNextCity()"
          severity="secondary"
        />
      </div>
      } @if (gameState === 'completed') {
      <div class="feedback celebration">
        <h3>{{ 'GAME.CONGRATULATIONS' | translate }}</h3>
        <p>{{ 'GAME.ALL_GUESSED' | translate : { count: streak } }}</p>
        <p class="perfect-score">{{ 'GAME.PERFECT_SCORE' | translate }}</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .game-panel {
        padding: 1rem;
      }

      .streak {
        text-align: center;
        margin-bottom: 1rem;

        h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--brand-text-primary);
        }

        .high-score {
          margin: 0.5rem 0 0 0;
          font-size: 1rem;
          color: var(--brand-text-secondary);
          font-weight: 600;
        }
      }

      .progress {
        margin: 0.25rem 0 1rem 0;
        font-size: 0.95rem;
        color: var(--brand-text-secondary);
        text-align: center;
      }

      .choice-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .choice-btn {
        padding: 1rem 0.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        border: 2px solid var(--brand-primary);
        border-radius: 8px;
        background: var(--brand-bg-card);
        color: var(--brand-text-primary);
        cursor: pointer;
        transition:
          background 0.15s,
          transform 0.1s;
        text-align: center;
        min-height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .choice-btn:hover {
        background: var(--brand-primary);
        color: var(--brand-text-light);
      }

      .choice-btn:active {
        transform: scale(0.97);
      }

      @media (max-width: 400px) {
        .choice-grid {
          gap: 0.5rem;
        }
        .choice-btn {
          font-size: 1rem;
          padding: 0.75rem 0.5rem;
        }
      }

      .feedback {
        padding: 1rem;
        border-radius: 4px;
        text-align: center;

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }

        p {
          margin: 0.5rem 0;
        }

        :host ::ng-deep p-button {
          margin-top: 1rem;
        }
      }

      .correct {
        background: var(--brand-success-bg);
        border: 2px solid var(--brand-success-border);
        color: var(--brand-success-text);
      }

      .wrong {
        background: var(--brand-error-bg);
        border: 2px solid var(--brand-error-border);
        color: var(--brand-error-text);
      }

      .celebration {
        background: linear-gradient(
          135deg,
          var(--brand-secondary-soft-teal) 0%,
          var(--brand-primary-deep) 100%
        );
        border: 3px solid var(--brand-accent-teal);
        color: var(--brand-text-light);

        h3 {
          font-size: 2rem;
        }

        .perfect-score {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 1rem 0;
        }
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
