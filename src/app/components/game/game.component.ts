import { Component, output, input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AutoComplete, Button],
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
        <p-autocomplete
          [(ngModel)]="guess"
          [suggestions]="filteredCities"
          (completeMethod)="filterCities($event)"
          [placeholder]="'GAME.ENTER_CITY' | translate"
          [disabled]="gameState !== 'playing'"
          (keydown.enter)="onSubmit()"
          [forceSelection]="false"
          [dropdown]="false"
          styleClass="guess-autocomplete"
        />
        <p-button
          [label]="'GAME.SUBMIT_GUESS' | translate"
          (onClick)="onSubmit()"
          [disabled]="!guess || gameState !== 'playing'"
          severity="primary"
        />
      </div>

      @if (gameState === 'correct') {
      <div class="feedback correct">
        <h3>✓ {{ 'GAME.CORRECT' | translate }}</h3>
        <p>{{ 'GAME.CORRECT_MESSAGE' | translate : { city: lastGuess } }}</p>
        <p-button
          [label]="'GAME.NEXT_CITY' | translate"
          (onClick)="onNextCity()"
          severity="success"
        />
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
        background: var(--brand-bg-card);
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

      .guess-form {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;

        :host ::ng-deep .guess-autocomplete {
          flex: 1;

          .p-autocomplete-input {
            width: 100%;
          }
        }
      }

      /* Mobile: stack input and submit button vertically */
      @media (max-width: 600px) {
        .guess-form {
          flex-direction: column;

          :host ::ng-deep .guess-autocomplete {
            width: 100%;
          }

          :host ::ng-deep p-button {
            width: 100%;

            .p-button {
              width: 100%;
            }
          }
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
  filteredCities: string[] = [];

  guessSubmitted = output<string>();
  nextCityRequested = output<void>();
  restartRequested = output<void>();

  filterCities(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.filteredCities = this.availableCities().filter((city) =>
      city.toLowerCase().includes(query)
    );
  }

  onSubmit(): void {
    if (this.guess && this.guess.trim()) {
      this.guessSubmitted.emit(this.guess.trim());
    }
  }

  onNextCity(): void {
    this.guess = '';
    this.filteredCities = [];
    this.nextCityRequested.emit();
  }

  onRestart(): void {
    this.guess = '';
    this.filteredCities = [];
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
