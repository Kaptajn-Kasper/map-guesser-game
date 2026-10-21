import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('cycles through 5, 10 and 15 rounds', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 3; i++) {
      service.cycleRoundCount();
      seen.add(service.roundCount());
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([5, 10, 15]);
  });

  it('offers four distinct choices including the right city', () => {
    service.beginPlaying();
    const options = service.choiceOptions();
    expect(options.length).toBe(4);
    expect(new Set(options).size).toBe(4);
    expect(options).toContain(service.currentCity()!.name);
  });

  it('tracks score, streak and missed cities', () => {
    service.setDifficulty('easy');
    service.beginPlaying();

    const first = service.currentCity()!.name;
    service.submitGuess(first);
    expect(service.gameState()).toBe('correct');
    expect(service.streak()).toBe(1);

    service.startNewRound();
    const second = service.currentCity()!.name;
    const wrong = service.choiceOptions().find((o) => o !== second)!;
    service.submitGuess(wrong);
    expect(service.gameState()).toBe('wrong');
    expect(service.streak()).toBe(0);
    expect(service.bestStreak()).toBe(1);

    service.endGame();
    expect(service.screenState()).toBe('finished');
    expect(service.correctCount()).toBe(1);
    expect(service.playedCount()).toBe(2);
    expect(service.accuracy()).toBe(50);
    expect(service.missedCities()).toEqual([second]);
    expect(service.isNewHighScore()).toBeTrue();
    expect(service.highScore()).toBe(1);
  });

  it('ignores a second guess in the same round', () => {
    service.beginPlaying();
    const city = service.currentCity()!.name;
    service.submitGuess(city);
    service.submitGuess('Nowhere');
    expect(service.playedCount()).toBe(1);
  });

  it('finishes after the chosen number of rounds', () => {
    service.setDifficulty('hard');
    while (service.roundCount() !== 5) service.cycleRoundCount();
    service.beginPlaying();
    for (let i = 0; i < 5; i++) {
      service.submitGuess(service.currentCity()!.name);
      service.startNewRound();
    }
    expect(service.screenState()).toBe('finished');
    expect(service.correctCount()).toBe(5);
  });

  it('goes back to the start screen when ending before any guess', () => {
    service.beginPlaying();
    service.endGame();
    expect(service.screenState()).toBe('start');
  });
});
