import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { NgLaydateDirective } from './ng-laydate.directive';
import { NgLaydateService } from './ng-laydate.service';
import { LaydateConfig } from './ng-laydate.types';

@Component({
    standalone: true,
    imports: [NgLaydateDirective],
    template: `
    <input #dir="laydate" id="test-input" type="text" [laydate]="config" (laydateChange)="onDateChange($event)">
  `
})
class TestHostComponent {
    @ViewChild(NgLaydateDirective) directive!: NgLaydateDirective;
    config: LaydateConfig = {
        value: '2026-08-21'
    };
    latestValue: any = null;

    onDateChange(val: any) {
        this.latestValue = val;
    }
}

describe('NgLaydateDirective', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let inputEl: HTMLInputElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [NgLaydateService]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        hostComponent = fixture.componentInstance;
        fixture.detectChanges();
        inputEl = fixture.nativeElement.querySelector('#test-input');
    });

    it('should create directive and set initial input value', () => {
        expect(inputEl).toBeTruthy();
        expect(inputEl.value).toBe('2026-08-21');
    });

    it('should update input value when config changes reactively', async () => {
        hostComponent.config = { value: '2026-10-01' };
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(inputEl.value).toBe('2026-10-01');
    });

    it('should handle Chinese formatted value in directive config', async () => {
        hostComponent.config = { format: 'yyyy年MM月dd日', value: '2026年08月21日' };
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(inputEl.value).toBe('2026年08月21日');
    });

    it('should support programmatic open() and close() methods', () => {
        const dir = hostComponent.directive;
        expect(dir).toBeTruthy();

        dir.open();
        const popup = document.querySelector('ng-laydate');
        expect(popup).toBeTruthy();

        dir.close();
        const popupAfterClose = document.querySelector('ng-laydate');
        expect(popupAfterClose).toBeNull();
    });
});
