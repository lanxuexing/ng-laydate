import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';

import { NgLaydateComponent } from './ng-laydate.component';

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

  it('should respect lang setting for month names', () => {
    fixture.componentRef.setInput('config', { lang: 'en' });
    fixture.detectChanges();
    expect(component.i18n().months[0]).toBe('Jan');

    fixture.componentRef.setInput('config', { lang: 'cn' });
    fixture.detectChanges();
    expect(component.i18n().months[0]).toBe('1月');
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
});
