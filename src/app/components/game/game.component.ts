import { Component, output, input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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

      <div class="guess-form">
        <input
          type="text"
          name="city"
          [(ngModel)]="guess"
          list="city-suggestions"
          [placeholder]="'GAME.ENTER_CITY' | translate"
          (input)="onTextInput($event)"
          (change)="onTextInput($event)"
          (keyup.enter)="onSubmit()"
          [disabled]="gameState !== 'playing'"
          autocomplete="off"
        />
        <datalist id="city-suggestions">
          @for (city of availableCities(); track city) {
          <option [value]="city"></option>
          }
        </datalist>
        <button
          (click)="onSubmit()"
          [disabled]="!guess || gameState !== 'playing'"
        >
          {{ 'GAME.SUBMIT_GUESS' | translate }}
        </button>
      </div>

      @if (gameState === 'correct') {
      <div class="feedback correct">
        <h3>✓ {{ 'GAME.CORRECT' | translate }}</h3>
        <p>{{ 'GAME.CORRECT_MESSAGE' | translate : { city: lastGuess } }}</p>
        <button (click)="onNextCity()">
          {{ 'GAME.NEXT_CITY' | translate }}
        </button>
      </div>
      } @if (gameState === 'wrong') {
      <div class="feedback wrong">
        <h3>✗ {{ 'GAME.WRONG' | translate }}</h3>
        <p>
          {{ 'GAME.YOUR_GUESS' | translate }}: <strong>{{ lastGuess }}</strong>
        </p>
        <p>
          {{ 'GAME.CORRECT_ANSWER' | translate }}:
          <strong>{{ correctAnswer }}</strong>
        </p>
        <p>{{ 'GAME.STREAK_RESET' | translate }}</p>
        <button (click)="onNextCity()">
          {{ 'GAME.NEXT_CITY' | translate }}
        </button>
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
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .streak {
        text-align: center;
        margin-bottom: 1.5rem;

        h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }

        .high-score {
          margin: 0.5rem 0 0 0;
          font-size: 1rem;
          color: #666;
          font-weight: 600;
        }
        .progress {
          margin: 0.25rem 0 0 0;
          font-size: 0.95rem;
          color: #555;
        }
      }

      .guess-form {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;

        input {
          flex: 1;
          padding: 0.75rem;
          border: 2px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;

          &:focus {
            outline: none;
            border-color: #007bff;
          }

          &:disabled {
            background: #f5f5f5;
          }
        }

        button {
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;

          &:hover:not(:disabled) {
            background: #0056b3;
          }

          &:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        }
      }

      /* Mobile: stack input and submit button vertically */
      @media (max-width: 600px) {
        .guess-form {
          flex-direction: column;
        }

        .guess-form button {
          width: 100%;
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

        button {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;

          &:hover {
            background: #218838;
          }
        }
      }

      .correct {
        background: #d4edda;
        border: 2px solid #28a745;
        color: #155724;
      }

      .wrong {
        background: #f8d7da;
        border: 2px solid #dc3545;
        color: #721c24;
      }

      .celebration {
        background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
        border: 3px solid #ffc107;
        color: #fff;

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
  availableCities = input.required<string[]>();
  totalSelectedCities = input<number>(0);
  attemptedCount = input<number>(0);
  remainingCount = input<number>(0);

  guess = '';
  streak = 0;
  highScore = 0;
  gameState: 'playing' | 'correct' | 'wrong' | 'completed' = 'playing';
  lastGuess = '';
  correctAnswer = '';

  guessSubmitted = output<string>();
  nextCityRequested = output<void>();
  restartRequested = output<void>();

  onSubmit(): void {
    if (this.guess.trim()) {
      this.guessSubmitted.emit(this.guess.trim());
    }
  }

  onTextInput(event: Event): void {
    // Ensure value updates when selecting from datalist on Android/Chrome
    this.guess = (event.target as HTMLInputElement).value || '';
  }

  onNextCity(): void {
    this.guess = '';
    this.nextCityRequested.emit();
  }

  onRestart(): void {
    this.guess = '';
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
