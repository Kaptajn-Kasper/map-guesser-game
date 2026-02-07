import { Component, output, input, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Difficulty, RoundCount } from '../../models/city.model';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [FormsModule, TranslateModule, Select],
  template: `
    <div class="controls">
      <div class="control-group">
        <label>{{ 'CONTROLS.DIFFICULTY' | translate }}:</label>
        <p class="control-description">
          {{ 'SETTINGS.DIFFICULTY_EXPLANATION' | translate }}
        </p>
        <p-select
          [(ngModel)]="difficulty"
          [options]="difficultyOptions"
          optionLabel="label"
          optionValue="value"
          (onChange)="onDifficultySelectChange()"
          styleClass="w-full"
        />
      </div>

      <div class="control-group">
        <label>{{ 'CONTROLS.ROUND_COUNT' | translate }}:</label>
        <p class="control-description">
          {{ 'CONTROLS.ROUND_COUNT_DESCRIPTION' | translate }}
        </p>
        <p-select
          [(ngModel)]="selectedRoundCount"
          [options]="roundCountOptionsComputed()"
          optionLabel="label"
          optionValue="value"
          (onChange)="onRoundCountSelectChange()"
          styleClass="w-full"
        />
        <small>{{ 'CONTROLS.POOL_SIZE' | translate }}: {{ poolSize() }}</small>
      </div>
    </div>
  `,
  styles: [
    `
      .controls {
        background: var(--brand-bg-subtle);
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .control-group {
        background: var(--brand-bg-card);
        border: 1px solid var(--brand-secondary-light-blue);
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      }

      label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--brand-text-primary);
      }

      .control-description {
        margin: 0 0 0.5rem 0;
        color: var(--brand-text-secondary);
        font-size: 0.95rem;
      }

      small {
        display: block;
        color: var(--brand-text-secondary);
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class ControlsComponent {
  initialRoundCount = input<RoundCount>(10);
  initialDifficulty = input<Difficulty>('easy');
  poolSize = input<number>(0);

  difficultyChange = output<Difficulty>();
  roundCountChange = output<RoundCount>();

  difficulty: Difficulty = 'easy';
  selectedRoundCount: RoundCount = 10;

  difficultyOptions: { label: string; value: Difficulty }[] = [];

  roundCountOptionsComputed = computed(() => {
    const pool = this.poolSize();
    return ([5, 10, 15] as RoundCount[])
      .filter((n) => n <= pool || n === 5)
      .map((n) => ({
        label: `${Math.min(n, pool)}`,
        value: n,
      }));
  });

  constructor(private translate: TranslateService) {
    this.difficulty = this.initialDifficulty();
    this.selectedRoundCount = this.initialRoundCount();
    this.buildDifficultyOptions();
    this.translate.onLangChange.subscribe(() => this.buildDifficultyOptions());

    effect(() => {
      this.difficulty = this.initialDifficulty();
      this.selectedRoundCount = this.initialRoundCount();
    });
  }

  private buildDifficultyOptions(): void {
    this.difficultyOptions = [
      {
        label: this.translate.instant('CONTROLS.DIFFICULTY_EASY'),
        value: 'easy',
      },
      {
        label: this.translate.instant('CONTROLS.DIFFICULTY_MEDIUM'),
        value: 'medium',
      },
      {
        label: this.translate.instant('CONTROLS.DIFFICULTY_HARD'),
        value: 'hard',
      },
    ];
  }

  onDifficultySelectChange(): void {
    this.difficultyChange.emit(this.difficulty);
  }

  onRoundCountSelectChange(): void {
    this.roundCountChange.emit(this.selectedRoundCount);
  }
}
