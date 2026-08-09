import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';

import { NgLaydateComponent } from './ng-laydate.component';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('NgLaydateComponent', () => {
  let component: NgLaydateComponent;
  let fixture: ComponentFixture<NgLaydateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgLaydateComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NgLaydateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply theme class based on config', async () => {
    fixture.componentRef.setInput('config', { theme: 'molv' });
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('laydate-theme-molv');

    fixture.componentRef.setInput('config', { theme: 'grid' });
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('laydate-theme-grid');
  });

  it('should initialize with range value', async () => {
    const rangeValue = '2024-01-01 - 2024-01-31';
    fixture.componentRef.setInput('config', { range: true, value: rangeValue });
    fixture.detectChanges();

    expect(component.startDate().year).toBe(2024);
    expect(component.startDate().month).toBe(0); // 0-indexed internally? Need to check laydate.ts
    expect(component.startDate().date).toBe(1);

    expect(component.endDate().year).toBe(2024);
    expect(component.endDate().month).toBe(0);
    expect(component.endDate().date).toBe(31);
  });

  it('should render shortcuts if provided', () => {
    const shortcuts = [{ text: 'Today', value: 'today' }];
    fixture.componentRef.setInput('config', { shortcuts });
    fixture.detectChanges();

    const shortcutItems = fixture.nativeElement.querySelectorAll('.layui-laydate-shortcut li');
    expect(shortcutItems.length).toBe(1);
    expect(shortcutItems[0].textContent).toContain('Today');
  });

  it('should respect lang setting for month and week names across 8 supported languages', () => {
    fixture.componentRef.setInput('config', { lang: 'en' });
    fixture.detectChanges();
    expect(component.i18n().months[0]).toBe('Jan');
    expect(component.i18n().weeks[0]).toBe('Su');

    fixture.componentRef.setInput('config', { lang: 'cn' });
    fixture.detectChanges();
    expect(component.i18n().months[0]).toBe('1月');
    expect(component.i18n().weeks[0]).toBe('日');

    fixture.componentRef.setInput('config', { lang: 'tw' });
    fixture.detectChanges();
    expect(component.i18n().months[0]).toBe('1月');
    expect(component.i18n().tools.confirm).toBe('確認');

    fixture.componentRef.setInput('config', { lang: 'ja' });
    fixture.detectChanges();
    expect(component.i18n().weeks[1]).toBe('月');
    expect(component.i18n().tools.confirm).toBe('決定');

    fixture.componentRef.setInput('config', { lang: 'ko' });
    fixture.detectChanges();
    expect(component.i18n().weeks[0]).toBe('일');
    expect(component.i18n().tools.confirm).toBe('확인');

    fixture.componentRef.setInput('config', { lang: 'es' });
    fixture.detectChanges();
    expect(component.i18n().months[0]).toBe('Ene');
    expect(component.i18n().tools.confirm).toBe('Confirmar');

    fixture.componentRef.setInput('config', { lang: 'de' });
    fixture.detectChanges();
    expect(component.i18n().months[0]).toBe('Jan');
    expect(component.i18n().tools.confirm).toBe('Bestätigen');

    fixture.componentRef.setInput('config', { lang: 'fr' });
    fixture.detectChanges();
    expect(component.i18n().months[0]).toBe('Janv');
    expect(component.i18n().tools.confirm).toBe('Valider');
  });

  it('should parse datetime initial value with hours, minutes, seconds intact', async () => {
    const datetimeVal = '2024-05-15 14:30:45';
    fixture.componentRef.setInput('config', { type: 'datetime', value: datetimeVal });
    fixture.detectChanges();

    expect(component.currentDate().year).toBe(2024);
    expect(component.currentDate().month).toBe(4);
    expect(component.currentDate().date).toBe(15);
    expect(component.currentDate().hours).toBe(14);
    expect(component.currentDate().minutes).toBe(30);
    expect(component.currentDate().seconds).toBe(45);
  });

  it('should handle string range shortcut correctly', async () => {
    const shortcuts = [{ text: 'Jan Range', value: '2024-01-01 - 2024-01-31' }];
    fixture.componentRef.setInput('config', { range: true, shortcuts });
    fixture.detectChanges();

    component.handleShortcut(shortcuts[0]);
    expect(component.startDate().year).toBe(2024);
    expect(component.startDate().month).toBe(0);
    expect(component.startDate().date).toBe(1);
    expect(component.endDate().date).toBe(31);
  });

  it('should reactively update i18n dictionary when config input signal changes', async () => {
    fixture.componentRef.setInput('config', { lang: 'cn' });
    fixture.detectChanges();
    expect(component.i18n().tools.confirm).toBe('确定');

    fixture.componentRef.setInput('config', { lang: 'en' });
    fixture.detectChanges();
    expect(component.i18n().tools.confirm).toBe('Confirm');

    fixture.componentRef.setInput('config', { lang: 'ja' });
    fixture.detectChanges();
    expect(component.i18n().tools.confirm).toBe('決定');
  });

  it('should support darkMode: "system" or "auto" to follow OS color scheme', async () => {
    component.systemDarkMode.set(true);
    fixture.componentRef.setInput('config', { darkMode: 'system' });
    fixture.detectChanges();
    expect(component.isDarkMode()).toBe(true);

    component.systemDarkMode.set(false);
    fixture.detectChanges();
    expect(component.isDarkMode()).toBe(false);
  });

  it('should parse Chinese formatted date strings (yyyy年MM月dd日)', async () => {
    const chineseValue = '2026年08月21日';
    fixture.componentRef.setInput('config', { format: 'yyyy年MM月dd日', value: chineseValue });
    fixture.detectChanges();

    expect(component.currentDate().year).toBe(2026);
    expect(component.currentDate().month).toBe(7); // 0-indexed August
    expect(component.currentDate().date).toBe(21);
  });

  it('should merge custom i18n dictionary overrides', async () => {
    fixture.componentRef.setInput('config', {
      i18n: {
        invalidDate: 'Custom Invalid Date',
        tools: { confirm: 'Submit', clear: 'Reset', now: 'Today' }
      }
    });
    fixture.detectChanges();

    expect(component.i18n().invalidDate).toBe('Custom Invalid Date');
    expect(component.i18n().tools.confirm).toBe('Submit');
    expect(component.i18n().tools.clear).toBe('Reset');
  });

  it('should merge partial i18n overrides on top of built-in English language', async () => {
    fixture.componentRef.setInput('config', {
      lang: 'en',
      i18n: {
        tools: { confirm: 'OK' }
      }
    });
    fixture.detectChanges();

    expect(component.i18n().months[0]).toBe('Jan'); // Preserved from English
    expect(component.i18n().weeks[0]).toBe('Su');   // Preserved from English
    expect(component.i18n().tools.confirm).toBe('OK'); // Overridden
    expect(component.i18n().tools.clear).toBe('Clear'); // Preserved from English
  });

  it('should accept a full custom LaydateI18n object passed directly to lang', async () => {
    const customLang = {
      weeks: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      months: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
      time: ['H', 'M', 'S'],
      timeTips: 'Time',
      backToDate: 'Back',
      hint: 'Preview',
      startTime: 'Start',
      endTime: 'End',
      dateTips: 'Date',
      monthTips: 'Month',
      yearTips: 'Year',
      duration: 'Len',
      tools: { confirm: 'OK', clear: 'Clear', now: 'Now' },
      formatYear: (y: number) => `${y}`,
      formatMonth: (m: number) => `M${m + 1}`,
      invalidRange: 'Limit: {min} - {max}',
      invalidDate: 'Unavailable',
      invalidEndEarly: 'Early end'
    };

    fixture.componentRef.setInput('config', { lang: customLang });
    fixture.detectChanges();

    expect(component.i18n().weeks[0]).toBe('S');
    expect(component.i18n().tools.confirm).toBe('OK');
  });

  it('should execute hintFormatter callback and support suppression by returning false', async () => {
    let intercepted = false;
    fixture.componentRef.setInput('config', {
      hintFormatter: (type: string, meta: any) => {
        intercepted = true;
        if (type === 'invalidDate') return false; // Suppress
        return `Format: ${meta.defaultText}`;
      }
    });
    fixture.detectChanges();

    component.showHint('Default Text', 3000, 'invalidDate');
    expect(intercepted).toBe(true);
    expect(component.hintState().visible).toBe(false); // Suppressed

    component.showHint('Default Text', 3000, 'invalidRange');
    expect(component.hintState().visible).toBe(true);
    expect(component.hintState().content).toBe('Format: Default Text');
  });

  it('should trigger clear callbacks and reset date state when clear is called', async () => {
    let onClearCalled = false;
    fixture.componentRef.setInput('config', {
      onClear: () => { onClearCalled = true; }
    });
    fixture.detectChanges();

    component.clear();
    expect(component.isCleared()).toBe(true);
    expect(onClearCalled).toBe(true);
  });

  it('should respect disabledDate function via getCalendarData', async () => {
    const config = { disabledDate: (date: Date) => date.getDay() === 0 }; // Disable Sundays
    const days = component['service'].getCalendarData(2026, 7, config); // Aug 2026

    const sunday = days.find(d => d.day === 2 && d.type === 'current'); // Aug 2, 2026 is Sunday
    const monday = days.find(d => d.day === 3 && d.type === 'current'); // Aug 3, 2026 is Monday

    expect(sunday?.disabled).toBe(true);
    expect(monday?.disabled).toBe(false);
  });

  it('should support hex theme color string like "#FF5722"', async () => {
    fixture.componentRef.setInput('config', { theme: '#FF5722' });
    fixture.detectChanges();

    expect(component.themeColorLight()).toContain('rgba(');
  });

  it('should handle range date selection via selectDay and swap end before start', async () => {
    fixture.componentRef.setInput('config', { range: true });
    fixture.detectChanges();

    const day1 = { year: 2026, month: 7, day: 20, type: 'current' as const, disabled: false, mark: '' };
    const day2 = { year: 2026, month: 7, day: 10, type: 'current' as const, disabled: false, mark: '' };

    component.selectDay(day1);
    expect(component.startDate().date).toBe(20);

    // Pick earlier end date -> should auto-swap
    component.selectDay(day2);
    expect(component.startDate().date).toBe(10);
    expect(component.endDate().date).toBe(20);
  });

  it('should support function, Date array, and timestamp in shortcuts', async () => {
    const fnShortcut = {
      text: 'Fn Shortcut',
      value: () => [new Date(2026, 0, 1), new Date(2026, 0, 15)]
    };
    fixture.componentRef.setInput('config', { range: true, shortcuts: [fnShortcut] });
    fixture.detectChanges();

    component.handleShortcut(fnShortcut);
    expect(component.startDate().year).toBe(2026);
    expect(component.startDate().month).toBe(0);
    expect(component.startDate().date).toBe(1);
    expect(component.endDate().date).toBe(15);
  });

  it('should sanitize XSS payloads in custom html inputs while preserving safe tags', async () => {
    const xssPayload = '<img src=x onerror=alert(1)><span style="color: red">Safe</span>';
    const pipe = new SafeHtmlPipe(TestBed.inject(DomSanitizer));
    const sanitized = pipe.transform(xssPayload) as string;

    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('alert');
    expect(sanitized).toContain('Safe');
  });
});
