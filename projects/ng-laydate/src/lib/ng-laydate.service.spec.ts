import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { NgLaydateService } from './ng-laydate.service';
import { DateObject } from './ng-laydate.types';

describe('NgLaydateService', () => {
    let service: NgLaydateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [NgLaydateService]
        });
        service = TestBed.inject(NgLaydateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('parse()', () => {
        it('should parse ISO date string (yyyy-MM-dd)', () => {
            const res = service.parse('2026-08-21');
            expect(res.year).toBe(2026);
            expect(res.month).toBe(7);
            expect(res.date).toBe(21);
            expect(res.hours).toBe(0);
            expect(res.minutes).toBe(0);
            expect(res.seconds).toBe(0);
        });

        it('should parse ISO datetime string (yyyy-MM-dd HH:mm:ss)', () => {
            const res = service.parse('2026-08-21 14:30:45');
            expect(res.year).toBe(2026);
            expect(res.month).toBe(7);
            expect(res.date).toBe(21);
            expect(res.hours).toBe(14);
            expect(res.minutes).toBe(30);
            expect(res.seconds).toBe(45);
        });

        it('should parse slash formatted date string (yyyy/MM/dd)', () => {
            const res = service.parse('2025/12/31');
            expect(res.year).toBe(2025);
            expect(res.month).toBe(11);
            expect(res.date).toBe(31);
        });

        it('should parse dot formatted date string (yyyy.MM.dd)', () => {
            const res = service.parse('2025.05.20');
            expect(res.year).toBe(2025);
            expect(res.month).toBe(4);
            expect(res.date).toBe(20);
        });

        it('should parse Chinese formatted date string (yyyy年MM月dd日)', () => {
            const res = service.parse('2026年08月21日');
            expect(res.year).toBe(2026);
            expect(res.month).toBe(7);
            expect(res.date).toBe(21);
        });

        it('should parse Chinese formatted datetime string (yyyy年MM月dd日 HH时mm分ss秒)', () => {
            const res = service.parse('2026年08月21日 14时30分45秒');
            expect(res.year).toBe(2026);
            expect(res.month).toBe(7);
            expect(res.date).toBe(21);
            expect(res.hours).toBe(14);
            expect(res.minutes).toBe(30);
            expect(res.seconds).toBe(45);
        });

        it('should parse month string (yyyy-MM, yyyy/MM, yyyy年MM月)', () => {
            const res1 = service.parse('2026-08');
            expect(res1.year).toBe(2026);
            expect(res1.month).toBe(7);
            expect(res1.date).toBe(1);

            const res2 = service.parse('2026年08月');
            expect(res2.year).toBe(2026);
            expect(res2.month).toBe(7);
            expect(res2.date).toBe(1);
        });

        it('should parse year string (yyyy, yyyy年)', () => {
            const res1 = service.parse('2026');
            expect(res1.year).toBe(2026);
            expect(res1.month).toBe(0);

            const res2 = service.parse('2026年');
            expect(res2.year).toBe(2026);
            expect(res2.month).toBe(0);
        });

        it('should parse time string (HH:mm:ss, HH:mm)', () => {
            const res1 = service.parse('14:30:45');
            expect(res1.hours).toBe(14);
            expect(res1.minutes).toBe(30);
            expect(res1.seconds).toBe(45);

            const res2 = service.parse('09:15');
            expect(res2.hours).toBe(9);
            expect(res2.minutes).toBe(15);
            expect(res2.seconds).toBe(0);
        });

        it('should parse Date object', () => {
            const d = new Date(2024, 0, 15, 10, 20, 30);
            const res = service.parse(d);
            expect(res.year).toBe(2024);
            expect(res.month).toBe(0);
            expect(res.date).toBe(15);
            expect(res.hours).toBe(10);
            expect(res.minutes).toBe(20);
            expect(res.seconds).toBe(30);
        });

        it('should parse relative day offset numbers', () => {
            const today = new Date();
            const res = service.parse(7);
            const expectedDate = new Date();
            expectedDate.setDate(today.getDate() + 7);

            expect(res.year).toBe(expectedDate.getFullYear());
            expect(res.month).toBe(expectedDate.getMonth());
            expect(res.date).toBe(expectedDate.getDate());
        });

        it('should parse Unix timestamp (ms and seconds)', () => {
            const tsMs = 1700000000000; // 2023-11-14T22:13:20.000Z
            const resMs = service.parse(tsMs);
            expect(resMs.year).toBe(new Date(tsMs).getFullYear());

            const tsSec = 1700000000;
            const resSec = service.parse(tsSec);
            expect(resSec.year).toBe(new Date(tsSec * 1000).getFullYear());
        });

        it('should unwrap single-element array', () => {
            const res = service.parse(['2026-08-21']);
            expect(res.year).toBe(2026);
            expect(res.month).toBe(7);
            expect(res.date).toBe(21);
        });

        it('should return systemDate for null/undefined/empty string', () => {
            const now = new Date();
            const res1 = service.parse(null);
            expect(res1.year).toBe(now.getFullYear());
            expect(res1.month).toBe(now.getMonth());

            const res2 = service.parse('');
            expect(res2.year).toBe(now.getFullYear());
        });
    });

    describe('format()', () => {
        const sampleDate: DateObject = {
            year: 2026,
            month: 7, // August
            date: 21,
            hours: 14,
            minutes: 30,
            seconds: 45
        };

        it('should format to yyyy-MM-dd HH:mm:ss', () => {
            expect(service.format(sampleDate, 'yyyy-MM-dd HH:mm:ss')).toBe('2026-08-21 14:30:45');
        });

        it('should format to Chinese yyyy年MM月dd日 HH:mm', () => {
            expect(service.format(sampleDate, 'yyyy年MM月dd日 HH:mm')).toBe('2026年08月21日 14:30');
        });

        it('should format to slash yyyy/MM/dd', () => {
            expect(service.format(sampleDate, 'yyyy/MM/dd')).toBe('2026/08/21');
        });

        it('should format to yyyy-MM', () => {
            expect(service.format(sampleDate, 'yyyy-MM')).toBe('2026-08');
        });

        it('should format to yyyy', () => {
            expect(service.format(sampleDate, 'yyyy')).toBe('2026');
        });

        it('should format to HH:mm', () => {
            expect(service.format(sampleDate, 'HH:mm')).toBe('14:30');
        });

        it('should format single-digit tokens (y-M-d H:m:s)', () => {
            const date: DateObject = { year: 2026, month: 3, date: 5, hours: 8, minutes: 9, seconds: 7 };
            expect(service.format(date, 'y-M-d H:m:s')).toBe('2026-4-5 8:9:7');
        });

        it('should support literal text escaping via brackets [...] without collision', () => {
            expect(service.format(sampleDate, 'yyyy-MM-dd [Day: yyyy]')).toBe('2026-08-21 Day: yyyy');
            expect(service.format(sampleDate, 'yyyy-MM-dd [(Monday)]')).toBe('2026-08-21 (Monday)');
        });
    });

    describe('helper methods', () => {
        it('should calculate total days in month correctly (including leap years)', () => {
            expect(service.isLeap(2024)).toBe(true);
            expect(service.isLeap(2025)).toBe(false);
            expect(service.totalDay(2024, 1)).toBe(29); // Feb 2024 (Leap year)
            expect(service.totalDay(2025, 1)).toBe(28); // Feb 2025
            expect(service.totalDay(2026, 7)).toBe(31); // Aug 2026
            expect(service.totalDay(2026, 3)).toBe(30); // Apr 2026
        });

        it('should pad numbers with digit()', () => {
            expect(service.digit(5)).toBe('05');
            expect(service.digit(12)).toBe('12');
            expect(service.digit(3, 3)).toBe('003');
        });

        it('should generate calendar data array with 42 days', () => {
            const days = service.getCalendarData(2026, 7); // Aug 2026
            expect(days.length).toBe(42);
            // Aug 2026 starts on Saturday (6th index in Sunday-first week)
            const currentMonthDays = days.filter(d => d.type === 'current');
            expect(currentMonthDays.length).toBe(31);
        });

        it('should convert DateObject to timestamp via getTime()', () => {
            const dateObj: DateObject = { year: 2026, month: 7, date: 21, hours: 0, minutes: 0, seconds: 0 };
            const time = service.getTime(dateObj);
            const d = new Date(time);
            expect(d.getFullYear()).toBe(2026);
            expect(d.getMonth()).toBe(7);
            expect(d.getDate()).toBe(21);
        });
    });
});
