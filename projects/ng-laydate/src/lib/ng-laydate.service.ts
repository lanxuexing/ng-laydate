import { Injectable, inject, ViewContainerRef, ComponentRef, EnvironmentInjector, createComponent, ApplicationRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DateObject, LaydateConfig, CalendarDay } from './ng-laydate.types';
import { NgLaydateComponent } from './ng-laydate.component';

@Injectable({
    providedIn: 'root'
})
export class NgLaydateService {

    private envInjector = inject(EnvironmentInjector);
    private appRef = inject(ApplicationRef);
    private platformId = inject(PLATFORM_ID);
    private defaultVcr?: ViewContainerRef;

    // Instance Registry
    private instances = new Map<string, NgLaydateComponent>();
    // Track event listeners for cleanup
    private documentClickListeners = new Map<ComponentRef<any>, any>();

    hexToRgba(hex: string, opacity: number): string {
        if (!hex) return `rgba(22, 183, 119, ${opacity})`; // Default green
        if (!hex.startsWith('#')) return hex;
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    register(id: string, component: NgLaydateComponent) {
        if (id) {
            this.instances.set(id, component);
        }
    }

    unregister(id: string) {
        if (id) {
            this.instances.delete(id);
        }
    }

    // Static-like hint API
    hint(id: string, opts: { content: string; ms?: number }) {
        const inst = this.instances.get(id);
        if (inst) {
            inst.showHint(opts.content, opts.ms);
        } else {
            console.warn(`Laydate: instance with id '${id}' not found`);
        }
    }

    // Set a default container for rendering (usually from the root component or a central place)
    setContainer(vcr: ViewContainerRef) {
        this.defaultVcr = vcr;
    }

    render(config: LaydateConfig): ComponentRef<NgLaydateComponent> | null {
        // SSR Guard: Do not render dynamic components accessing DOM in Server
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }

        const elem = typeof config.elem === 'string' ? document.querySelector(config.elem) as HTMLElement : config.elem;
        if (!elem) {
            console.error('Laydate: target element not found', config.elem);
            return null;
        }

        // Create component
        const componentRef = createComponent(NgLaydateComponent, {
            environmentInjector: this.envInjector,
            hostElement: undefined
        });

        // Set inputs correctly
        componentRef.setInput('config', config);

        const componentEl = componentRef.location.nativeElement;

        // Position Logic
        if (config.position === 'static') {
            componentEl.style.position = 'static';
            componentEl.style.display = 'inline-block';
            elem.appendChild(componentEl);
        } else {
            componentEl.style.position = 'absolute';
            componentEl.style.zIndex = '99999999';
            document.body.appendChild(componentEl);
            this.setAbsolutePosition(elem, componentEl);
        }

        // Attach to application ref for change detection
        this.appRef.attachView(componentRef.hostView);

        // Handle selection
        const sub = componentRef.instance.select.subscribe((value: string) => {
            if (elem instanceof HTMLInputElement || elem instanceof HTMLTextAreaElement) {
                let displayValue = value;
                if (config.formatToDisplay) {
                    displayValue = config.formatToDisplay(value);
                }
                elem.value = displayValue;
                elem.dispatchEvent(new Event('input', { bubbles: true }));
                elem.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Auto close behavior (only for non-static)
            if (config.position !== 'static') {
                setTimeout(() => {
                    this.destroy(componentRef, shadeEl);
                }, 0);
            }
        });

        // Handle clear (Don't close)
        const subClear = componentRef.instance.clearOutput.subscribe(() => {
            if (elem instanceof HTMLInputElement || elem instanceof HTMLTextAreaElement) {
                elem.value = '';
                elem.dispatchEvent(new Event('input', { bubbles: true }));
                elem.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        // Create shade overlay if configured
        let shadeEl: HTMLElement | null = null;
        if (config.shade && config.position !== 'static') {
            const opacity = typeof config.shade === 'number' ? config.shade : 0.5;
            shadeEl = document.createElement('div');
            shadeEl.className = 'layui-laydate-shade';
            shadeEl.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, ${opacity});
                z-index: 99999998;
            `;
            document.body.appendChild(shadeEl);

            // Click shade to close (with delay to avoid immediate close)
            setTimeout(() => {
                shadeEl?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.destroy(componentRef, shadeEl);
                });
            }, 150);
        }

        // Click outside to close - ONLY if no shade (shade handles its own close)
        if (config.position !== 'static' && !config.shade) {
            const clickListener = (e: Event) => {
                const target = e.target as Node;
                if (!elem.contains(target) && !componentEl.contains(target)) {
                    this.destroy(componentRef, shadeEl);
                }
            };

            // Register listener for cleanup
            this.documentClickListeners.set(componentRef, clickListener);

            // Use mousedown to detect clicks before they bubble, with delay
            setTimeout(() => {
                document.addEventListener('mousedown', clickListener);
            }, 150);
        }

        return componentRef;
    }

    private setAbsolutePosition(elem: HTMLElement, componentEl: HTMLElement) {
        if (!isPlatformBrowser(this.platformId)) return;

        requestAnimationFrame(() => {
            const rect = elem.getBoundingClientRect();
            const scrollT = window.pageYOffset || document.documentElement.scrollTop;
            const scrollL = window.pageXOffset || document.documentElement.scrollLeft;

            const panelW = componentEl.offsetWidth;
            const panelH = componentEl.offsetHeight;

            let top = rect.bottom + scrollT;
            let left = rect.left + scrollL;

            // Smart Alignment: check if it overflows the bottom
            if (top + panelH > scrollT + window.innerHeight && rect.top > panelH) {
                top = rect.top + scrollT - panelH - 2; // flip up
            }

            // Horizontal Alignment: check if it overflows the right
            if (left + panelW > scrollL + window.innerWidth) {
                left = scrollL + window.innerWidth - panelW - 5;
            }
            if (left < scrollL) left = scrollL;

            componentEl.style.top = top + 'px';
            componentEl.style.left = left + 'px';
            componentEl.style.margin = '0'; // Clear default margin
        });
    }

    private destroy(ref: ComponentRef<NgLaydateComponent>, shadeEl?: HTMLElement | null) {
        if (ref.instance.config().close) {
            ref.instance.config().close!();
        }
        if (shadeEl && shadeEl.parentNode) {
            shadeEl.parentNode.removeChild(shadeEl);
        }

        // Cleanup listener
        const listener = this.documentClickListeners.get(ref);
        if (listener) {
            document.removeEventListener('mousedown', listener);
            this.documentClickListeners.delete(ref);
        }

        this.appRef.detachView(ref.hostView);
        ref.destroy();
    }

    // Check if leap year
    isLeap(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // Add leading zero
    digit(num: number | string, length: number = 2): string {
        let str = String(num);
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }

    // Format date object to string
    format(date: DateObject, formatStr: string = 'yyyy-MM-dd'): string {
        const yyyy = this.digit(date.year, 4);
        const y = String(date.year);
        const MM = this.digit(date.month + 1);
        const M = String(date.month + 1);
        const dd = this.digit(date.date);
        const d = String(date.date);
        const HH = this.digit(date.hours);
        const H = String(date.hours);
        const mm = this.digit(date.minutes);
        const m = String(date.minutes);
        const ss = this.digit(date.seconds);
        const s = String(date.seconds);

        return formatStr
            .replace(/yyyy/g, yyyy)
            .replace(/y/g, y)
            .replace(/MM/g, MM)
            .replace(/M/g, M)
            .replace(/dd/g, dd)
            .replace(/d/g, d)
            .replace(/HH/g, HH)
            .replace(/H/g, H)
            .replace(/mm/g, mm)
            .replace(/m/g, m)
            .replace(/ss/g, ss)
            .replace(/s/g, s);
    }

    // Convert DateObject to timestamp for comparison
    getTime(date: DateObject): number {
        return new Date(date.year, date.month, date.date, date.hours, date.minutes, date.seconds).getTime();
    }

    // Get days in a month
    totalDay(year: number, month: number): number {
        const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return this.isLeap(year) && month === 1 ? 29 : days[month];
    }

    // System date helper
    systemDate(newDate?: Date): DateObject {
        const thisDate = newDate || new Date();
        return {
            year: thisDate.getFullYear(),
            month: thisDate.getMonth(),
            date: thisDate.getDate(),
            hours: thisDate.getHours(),
            minutes: thisDate.getMinutes(),
            seconds: thisDate.getSeconds()
        };
    }

    // Parse string to date object
    parse(value: string | Date | number, format: string = 'yyyy-MM-dd'): DateObject {
        if (typeof value === 'number') {
            const d = new Date();
            d.setDate(d.getDate() + value);
            return this.systemDate(d);
        }
        if (value instanceof Date) {
            return this.systemDate(value);
        }
        // Handle time only string (simple)
        if (typeof value === 'string' && /^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(value)) {
            value = '1970-01-01 ' + value;
        }

        // Simple ISO parsing fallback
        // In a real implementation this should use the format string to parse strictly

        // Match yyyy-MM-dd manually to avoid timezone issues with new Date()
        const match = typeof value === 'string' ? value.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/) : null;
        if (match) {
            return {
                year: parseInt(match[1]),
                month: parseInt(match[2]) - 1, // month is 0-indexed
                date: parseInt(match[3]),
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }

        // Match yyyy-MM (Month picker)
        const matchYM = typeof value === 'string' ? value.match(/^(\d{4})[-\/](\d{1,2})$/) : null;
        if (matchYM) {
            return {
                year: parseInt(matchYM[1]),
                month: parseInt(matchYM[2]) - 1,
                date: 1, // Default to 1st
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }

        // Match yyyy (Year picker)
        const matchY = typeof value === 'string' ? value.match(/^(\d{4})$/) : null;
        if (matchY) {
            return {
                year: parseInt(matchY[1]),
                month: 0, // Default to Jan
                date: 1, // Default to 1st
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        }

        const d = value ? new Date(value) : new Date();
        // Check for invalid date
        if (isNaN(d.getTime())) {
            return this.systemDate();
        }
        return this.systemDate(d);
    }

    // Get surrounding dates for calendar view
    getCalendarData(year: number, month: number, config?: LaydateConfig): CalendarDay[] {
        const startDay = new Date(year, month, 1).getDay(); // 0 is Sunday
        const weekStart = config?.weekStart || 0;
        const emptyDays = (startDay - weekStart + 7) % 7;

        const daysInMonth = this.totalDay(year, month);
        const daysInPrevMonth = this.totalDay(year, month === 0 ? 11 : month - 1);

        const list: CalendarDay[] = [];

        // Gregorian festivals
        const festivals: { [key: string]: string } = {
            '1-1': '元旦',
            '2-14': '情人节',
            '3-8': '妇女节',
            '3-12': '植树节',
            '4-1': '愚人节',
            '5-1': '劳动节',
            '5-4': '青年节',
            '6-1': '儿童节',
            '7-1': '建党节',
            '8-1': '建军节',
            '9-10': '教师节',
            '10-1': '国庆节',
            '12-25': '圣诞节'
        };

        // Helper to check disabled, marks, and holidays
        // Pre-calculate min/max timestamps outside the loop
        let minTime = -Infinity;
        let maxTime = Infinity;

        if (config) {
            if (config.min) {
                const minD = this.parse(config.min) as DateObject;
                minTime = new Date(minD.year, minD.month, minD.date).getTime();
            }
            if (config.max) {
                const maxD = this.parse(config.max) as DateObject;
                maxTime = new Date(maxD.year, maxD.month, maxD.date).getTime();
            }
        }

        const checkStatus = (y: number, m: number, d: number) => {
            const status: { disabled: boolean; mark: string; holiday?: '休' | '班' } = { disabled: false, mark: '' };
            if (!config) return status;

            // Check disabled
            const dateOnly = new Date(y, m, d).getTime();
            status.disabled = dateOnly < minTime || dateOnly > maxTime;

            // Check callback disabledDate
            if (!status.disabled && config.disabledDate) {
                status.disabled = config.disabledDate(new Date(y, m, d), 'date');
            }

            // Check marks (custom marks have priority)
            if (config.mark) {
                const ymd = `${y}-${m + 1}-${d}`;
                const ymdZero = `${y}-${this.digit(m + 1)}-${this.digit(d)}`;

                if (typeof config.mark === 'function') {
                    // Function support
                    const render = (input: string | Record<string, string>) => {
                        if (typeof input === 'string') return input;
                        // Object map support with priorities
                        // 1. Specific: yyyy-M-d (or yyyy-MM-dd)
                        if (input[ymd]) return input[ymd];
                        if (input[ymdZero]) return input[ymdZero];

                        // 2. Annual: 0-M-d
                        const annual = `0-${m + 1}-${d}`;
                        const annualZero = `0-${this.digit(m + 1)}-${this.digit(d)}`;
                        if (input[annual]) return input[annual];
                        if (input[annualZero]) return input[annualZero];

                        // 3. Monthly: 0-0-d
                        const monthly = `0-0-${d}`;
                        const monthlyZero = `0-0-${this.digit(d)}`;
                        if (input[monthly]) return input[monthly];
                        if (input[monthlyZero]) return input[monthlyZero];

                        return ''; // No match
                    };

                    const result = config.mark({ year: y, month: m + 1, date: d }, render);
                    if (result && typeof result === 'string') {
                        status.mark = result;
                    }

                } else {
                    // Legacy object support
                    const markMap = config.mark as Record<string, string>;
                    if (markMap[ymd]) status.mark = markMap[ymd];
                    else if (markMap[ymdZero]) status.mark = markMap[ymdZero];
                }
            }

            // Check festivals if enabled and no custom mark
            if (config.calendar && !status.mark) {
                const md = `${m + 1}-${d}`;
                if (festivals[md]) status.mark = festivals[md];
            }

            // Check holidays (休/班)
            if (config.holidays) {
                const ymd = `${y}-${m + 1}-${d}`;
                const ymdZero = `${y}-${this.digit(m + 1)}-${this.digit(d)}`;
                const [holidayDates, workDates] = config.holidays;

                if (holidayDates?.includes(ymd) || holidayDates?.includes(ymdZero)) {
                    status.holiday = '休';
                } else if (workDates?.includes(ymd) || workDates?.includes(ymdZero)) {
                    status.holiday = '班';
                }
            }

            return status;
        };

        // Prev month days
        for (let i = 0; i < emptyDays; i++) {
            const y = month === 0 ? year - 1 : year;
            const m = month === 0 ? 11 : month - 1;
            const d = daysInPrevMonth - (emptyDays - i - 1);
            const status = checkStatus(y, m, d);
            list.push({
                type: 'prev',
                day: d,
                month: m,
                year: y,
                disabled: status.disabled,
                mark: status.mark,
                holiday: status.holiday
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const status = checkStatus(year, month, i);
            list.push({
                type: 'current',
                day: i,
                month: month,
                year: year,
                disabled: status.disabled,
                mark: status.mark,
                holiday: status.holiday
            });
        }

        // Next month days
        const remaining = 42 - list.length;
        for (let i = 1; i <= remaining; i++) {
            const y = month === 11 ? year + 1 : year;
            const m = month === 11 ? 0 : month + 1;
            const status = checkStatus(y, m, i);
            list.push({
                type: 'next',
                day: i,
                month: m,
                year: y,
                disabled: status.disabled,
                mark: status.mark,
                holiday: status.holiday
            });
        }

        // Apply cellRender if defined
        if (config && config.cellRender) {
            list.forEach(item => {
                const ymd = { year: item.year, month: item.month, date: item.day };
                config.cellRender!(ymd, (content) => {
                    item.customContent = content;
                }, { type: 'date' });
            });
        }

        return list;
    }

    // Check and constrain date validity
    checkDate(date: DateObject): DateObject {
        const LIMIT_YEAR = [100, 200000];

        if (date.year > LIMIT_YEAR[1]) date.year = LIMIT_YEAR[1];
        if (date.year < LIMIT_YEAR[0]) date.year = LIMIT_YEAR[0];
        if (date.month > 11) date.month = 11;
        if (date.month < 0) date.month = 0;

        // Time constraints
        if (date.seconds > 59) { date.seconds = 0; date.minutes++; }
        if (date.minutes > 59) { date.minutes = 0; date.hours++; }
        if (date.hours > 23) date.hours = 0;

        // Check last day of month
        const maxDay = this.totalDay(date.year, date.month);
        if (date.date > maxDay) date.date = maxDay;

        return date;
    }
}
