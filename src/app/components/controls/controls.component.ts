import { Component, output, input, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Slider } from 'primeng/slider';
import { Select } from 'primeng/select';
import { Difficulty } from '../../models/city.model';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [FormsModule, TranslateModule, Slider, Select],
  template: `
    <div class="controls">
      <div class="control-group">
        <label for="cities-count">
          {{ 'CONTROLS.CITIES_COUNT' | translate }}: {{ sliderValue }}
        </label>
        <p class="control-description">
          {{ 'CONTROLS.CITIES_COUNT_DESCRIPTION' | translate }}
        </p>
        <p-slider
          [(ngModel)]="sliderValue"
          [min]="1"
          [max]="maxCities()"
          [step]="1"
          (onChange)="onSliderChange()"
          styleClass="brand-slider"
        />
        <small
          >{{ 'CONTROLS.TOTAL_CITIES' | translate }}: {{ maxCities() }}</small
        >
      </div>

      <div class="control-group">
        <label for="difficulty">{{ 'CONTROLS.DIFFICULTY' | translate }}:</label>
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

      :host ::ng-deep .brand-slider {
        width: 100%;
        margin: 0.75rem 0;
      }

      small {
        display: block;
        color: var(--brand-text-secondary);
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class ControlsComponent {
  initialCitiesCount = input<number>(5);
  maxCitiesInput = input<number>(0);

  selectedCitiesCount = computed(() => this.initialCitiesCount());
  maxCities = computed(() => this.maxCitiesInput());
  difficulty: Difficulty = 'easy';
  sliderValue = 5;

  difficultyOptions: { label: string; value: Difficulty }[] = [];

  citiesCountChange = output<number>();
  difficultyChange = output<Difficulty>();

  constructor(private translate: TranslateService) {
    this.sliderValue = this.initialCitiesCount();
    this.buildDifficultyOptions();
    this.translate.onLangChange.subscribe(() => this.buildDifficultyOptions());
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
      {
        label: this.translate.instant('CONTROLS.DIFFICULTY_EXTREME'),
        value: 'extreme',
      },
    ];
  }

  ngOnChanges(): void {
    this.sliderValue = this.initialCitiesCount();
  }

  onSliderChange(): void {
    this.citiesCountChange.emit(this.sliderValue);
  }

  onDifficultySelectChange(): void {
    this.difficultyChange.emit(this.difficulty);
  }
}
