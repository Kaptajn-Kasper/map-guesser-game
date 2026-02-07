import { Component, ViewChild, effect, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
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
    FormsModule,
    MapComponent,
    ControlsComponent,
    GameComponent,
    TranslateModule,
    Select,
    Button,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  @ViewChild(ControlsComponent) controlsComponent?: ControlsComponent;
  @ViewChild(GameComponent) gameComponent?: GameComponent;

  private wrongEndTimeout: number | undefined;

  languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Dansk', value: 'da' },
  ];
  selectedLanguage: string;

  constructor(
    public gameService: GameService,
    private translate: TranslateService
  ) {
    // Set up translations
    const savedLang = localStorage.getItem('map-guesser-language') || 'da';
    translate.setFallbackLang('da');
    translate.use(savedLang);
    this.selectedLanguage = savedLang;

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

    // Sync body background to match each screen's gradient for iOS overscroll
    effect(() => {
      const screen = this.gameService.screenState();
      const bgMap: Record<string, string> = {
        start: '#083841',
        settings: '#3f1e54',
        playing: '#083841',
        finished: '#0a2e37',
      };
      const bg = bgMap[screen] || '#083841';
      document.body.style.background = bg;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
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
  }

  onRestartRequested(): void {
    this.gameService.restartAfterCompletion();
  }

  onLanguageChange(): void {
    this.translate.use(this.selectedLanguage);
    localStorage.setItem('map-guesser-language', this.selectedLanguage);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || 'da';
  }

  playAgain(): void {
    this.gameService.beginPlaying();
  }

  changeSettings(): void {
    this.gameService.screenState.set('settings');
  }
}
