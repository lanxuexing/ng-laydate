import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { NgLaydateComponent } from './ng-laydate.component';

describe('NgLaydateComponent', () => {
  let component: NgLaydateComponent;
  let fixture: ComponentFixture<NgLaydateComponent>;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

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
});
