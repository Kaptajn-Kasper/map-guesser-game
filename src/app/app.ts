import { Component, ViewChild, effect, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { GameService } from './services/game.service';
import { MapComponent } from './components/map/map.component';
import { ControlsComponent } from './components/controls/controls.component';
import { GameComponent } from './components/game/game.component';
import { Difficulty } from './models/city.model';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MapComponent,
    ControlsComponent,
    GameComponent,
    TranslateModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  @ViewChild(ControlsComponent) controlsComponent?: ControlsComponent;
  @ViewChild(GameComponent) gameComponent?: GameComponent;

  uiHidden = false;
  private wrongEndTimeout: number | undefined;

  constructor(
    public gameService: GameService,
    private translate: TranslateService
  ) {
    // Set up translations
    const savedLang = localStorage.getItem('map-guesser-language') || 'da';
    translate.setFallbackLang('da');
    translate.use(savedLang);

    // Update components when game state changes
    effect(() => {
      const state = this.gameService.gameState();
      const streak = this.gameService.streak();
      const lastGuess = this.gameService.lastGuess();
      const correctAnswer = this.gameService.currentCity()?.name || '';
      const highScore = this.gameService.highScore();

      // When all cities have been guessed, go straight to results
      if (
        state === 'completed' &&
        this.gameService.screenState() !== 'finished'
      ) {
        this.gameService.endGame();
      }

      // On wrong guess: show the overlay with the correct answer.
      if (state === 'wrong' && this.gameService.screenState() !== 'finished') {
        this.uiHidden = false;
      }

      if (this.gameComponent) {
        this.gameComponent.updateGameState(
          state,
          streak,
          lastGuess,
          correctAnswer,
          highScore
        );
      }
    });

    // Ensure UI is hidden initially when entering playing screen
    effect(() => {
      const screen = this.gameService.screenState();
      if (screen === 'playing') {
        this.uiHidden = true;
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialize game component state on load
    if (this.gameComponent) {
      const state = this.gameService.gameState();
      const streak = this.gameService.streak();
      const lastGuess = this.gameService.lastGuess();
      const correctAnswer = this.gameService.currentCity()?.name || '';
      const highScore = this.gameService.highScore();
      this.gameComponent.updateGameState(
        state,
        streak,
        lastGuess,
        correctAnswer,
        highScore
      );
    }
  }

  onCitiesCountChange(count: number): void {
    this.gameService.setCitiesCount(count);
  }

  onDifficultyChange(difficulty: Difficulty): void {
    this.gameService.setDifficulty(difficulty);
  }

  onGuessSubmitted(guess: string): void {
    this.gameService.submitGuess(guess);
  }

  onNextCityRequested(): void {
    this.gameService.startNewRound();
    // Ensure the map is visible when the next city loads
    this.uiHidden = true;
  }

  onRestartRequested(): void {
    this.gameService.restartAfterCompletion();
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('map-guesser-language', lang);
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.switchLanguage(select.value);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || 'da';
  }

  toggleUI(): void {
    this.uiHidden = !this.uiHidden;
  }

  playAgain(): void {
    this.gameService.beginPlaying();
  }

  changeSettings(): void {
    this.gameService.screenState.set('settings');
  }
}
