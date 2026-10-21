import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the start screen with difficulty stickers', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('APP.TITLE_LINE1');
    expect(compiled.querySelectorAll('.sticker-row .sticker').length).toBe(4);
    expect(compiled.querySelector('.sticker--on')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('should toggle the language', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const before = app.language();
    app.toggleLanguage();
    expect(app.language()).not.toBe(before);
  });
});
