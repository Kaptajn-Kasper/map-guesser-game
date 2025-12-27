import { Component, output, input, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Difficulty } from '../../models/city.model';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    <div class="controls">
      <div class="control-group">
        <label for="cities-count">
          {{ 'CONTROLS.CITIES_COUNT' | translate }}: {{ selectedCitiesCount() }}
        </label>
        <p class="control-description">
          {{ 'CONTROLS.CITIES_COUNT_DESCRIPTION' | translate }}
        </p>
        <input
          type="range"
          id="cities-count"
          [value]="selectedCitiesCount()"
          [min]="1"
          [max]="maxCities()"
          step="1"
          (input)="onCitiesCountChange($event)"
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
        <select
          id="difficulty"
          [value]="difficulty"
          (change)="onDifficultyChange($event)"
        >
          <option value="easy">
            {{ 'CONTROLS.DIFFICULTY_EASY' | translate }}
          </option>
          <option value="medium">
            {{ 'CONTROLS.DIFFICULTY_MEDIUM' | translate }}
          </option>
          <option value="hard">
            {{ 'CONTROLS.DIFFICULTY_HARD' | translate }}
          </option>
          <option value="extreme">
            {{ 'CONTROLS.DIFFICULTY_EXTREME' | translate }}
          </option>
        </select>
      </div>
    </div>
  `,
  styles: [
    `
      .controls {
        background: #f5f5f5;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .control-group {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      }

      label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #333;
      }

      .control-description {
        margin: 0 0 0.5rem 0;
        color: #555;
        font-size: 0.95rem;
      }

      input[type='range'] {
        width: 100%;
        margin: 0.5rem 0;
      }

      select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        background: white;
      }

      small {
        display: block;
        color: #666;
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

  citiesCountChange = output<number>();
  difficultyChange = output<Difficulty>();

  onCitiesCountChange(event: Event): void {
    const value = Number.parseInt((event.target as HTMLInputElement).value);
    this.citiesCountChange.emit(value);
  }

  onDifficultyChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as Difficulty;
    this.difficulty = value;
    this.difficultyChange.emit(value);
  }
}
