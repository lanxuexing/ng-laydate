import { Injectable, inject, ViewContainerRef, ComponentRef, EnvironmentInjector, createComponent, ApplicationRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DateObject, LaydateConfig, CalendarDay } from './ng-laydate.types';
import { NgLaydateComponent } from './ng-laydate.component';

/**
 * NgLaydate 服务，提供命令式/服务化渲染选择器、动态 Hint 消息提醒以及日期计算工具函数
 */
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
    // Track active panel refs by element
    private activePanels = new Map<HTMLElement, ComponentRef<NgLaydateComponent>>();
    // Track latest configs by element
    private elementConfigs = new Map<HTMLElement, LaydateConfig>();
    // Track elements that already have event listeners attached
    private boundElements = new WeakSet<HTMLElement>();
    // Track event listeners and timers for cleanup
    private documentClickListeners = new Map<ComponentRef<any>, any>();
    private documentClickTimers = new Map<ComponentRef<any>, any>();
    private shadeClickTimers = new Map<ComponentRef<any>, any>();
    private subscriptionsMap = new Map<ComponentRef<any>, { unsubscribe: () => void }[]>();

    /**
     * 将十六进制颜色值转为带指定透明度的 RGBA 字符串
     * @param hex 十六进制颜色值 (如 '#16b777' 或 '#fff')
     * @param opacity 透明度 (0-1)
     */
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

    /**
     * 注册组件实例句柄
     */
    register(id: string, component: NgLaydateComponent) {
        if (id) {
            this.instances.set(id, component);
        }
    }

    /**
     * 注销组件实例句柄
     */
    unregister(id: string) {
        if (id) {
            this.instances.delete(id);
        }
    }

    /**
     * 静态 Hint 气泡提示 API，向指定 ID 的控件弹出一个自定义提示消息
     * @param id 目标控件注册的 ID
     * @param opts 提示参数，包含 content 消息文本及 ms 持续展示毫秒数
     */
    hint(id: string, opts: { content: string; ms?: number }) {
        const inst = this.instances.get(id);
        if (inst) {
            inst.showHint(opts.content, opts.ms);
        } else {
            console.warn(`Laydate: instance with id '${id}' not found`);
        }
    }

    /**
     * 设置渲染的目标 ViewContainerRef 视图容器
     */
    setContainer(vcr: ViewContainerRef) {
        this.defaultVcr = vcr;
    }

    /**
     * 动态更新目标 DOM 元素绑定的 Laydate 配置参数
     * @param elem 目标 HTML 元素
     * @param config 最新 LaydateConfig 配置
     */
    updateConfig(elem: HTMLElement, config: LaydateConfig) {
        this.elementConfigs.set(elem, config);
        const activeRef = this.activePanels.get(elem);
        if (activeRef) {
            activeRef.setInput('config', config);
        }
    }

    /**
     * 服务化渲染入口：在指定 target 元素上动态命令式创建并弹出 Laydate 控件
     * @param config Laydate 完整配置对象 (必须包含 elem 目标元素或 Selector 字符串)
     * @returns 返回生成的 ComponentRef 组件引用指针 (SSR 场景下返回 null)
     */
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

        if (elem instanceof HTMLElement) {
            elem.setAttribute('autocomplete', 'off');
            this.elementConfigs.set(elem, config);
        }

        // If position is static, render immediately
        if (config.position === 'static') {
            return this.openPanel(config, elem);
        }

        // Bind click & focus listeners to target element if not already bound
        if (!this.boundElements.has(elem)) {
            this.boundElements.add(elem);

            const triggerHandler = () => {
                if (!this.activePanels.get(elem)) {
                    const latestConfig = this.elementConfigs.get(elem) || config;
                    this.openPanel(latestConfig, elem);
                }
            };

            elem.addEventListener('click', triggerHandler);
            elem.addEventListener('focus', triggerHandler);
        }

        // Only open panel immediately on render if explicitly set in config.show === true
        if (config.show === true && !this.activePanels.get(elem)) {
            const latestConfig = this.elementConfigs.get(elem) || config;
            return this.openPanel(latestConfig, elem);
        }

        return this.activePanels.get(elem) || null;
    }

    private openPanel(config: LaydateConfig, elem: HTMLElement): ComponentRef<NgLaydateComponent> {
        // Create component
        const componentRef = createComponent(NgLaydateComponent, {
            environmentInjector: this.envInjector,
            hostElement: undefined
        });

        if (config.position !== 'static') {
            this.activePanels.set(elem, componentRef);
        }

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

        // Track subscriptions for cleanup
        this.subscriptionsMap.set(componentRef, [sub, subClear]);

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
            const timer = setTimeout(() => {
                this.shadeClickTimers.delete(componentRef);
                shadeEl?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.destroy(componentRef, shadeEl);
                });
            }, 150);
            this.shadeClickTimers.set(componentRef, timer);
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
            const timer = setTimeout(() => {
                this.documentClickTimers.delete(componentRef);
                // Verify component hasn't been destroyed before adding listener
                if (this.documentClickListeners.has(componentRef)) {
                    document.addEventListener('mousedown', clickListener);
                }
            }, 150);
            this.documentClickTimers.set(componentRef, timer);
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

            // Horizontal Alignment & Mobile Responsive Clamp
            const isMobile = window.innerWidth <= 640;
            if (isMobile) {
                const maxMobileWidth = window.innerWidth - 24;
                componentEl.style.maxWidth = `${maxMobileWidth}px`;
                componentEl.style.boxSizing = 'border-box';
                const actualWidth = Math.min(panelW || maxMobileWidth, maxMobileWidth);
                left = Math.max(12, scrollL + (window.innerWidth - actualWidth) / 2);
            } else {
                if (left + panelW > scrollL + window.innerWidth) {
                    left = scrollL + window.innerWidth - panelW - 5;
                }
                if (left < scrollL) left = scrollL;
            }

            componentEl.style.top = top + 'px';
            componentEl.style.left = left + 'px';
            componentEl.style.margin = '0'; // Clear default margin
        });
    }

    private destroy(ref: ComponentRef<NgLaydateComponent>, shadeEl?: HTMLElement | null) {
        // Remove from activePanels map
        for (const [elem, activeRef] of this.activePanels.entries()) {
            if (activeRef === ref) {
                this.activePanels.delete(elem);
                break;
            }
        }

        // Clear pending timers
        const clickTimer = this.documentClickTimers.get(ref);
        if (clickTimer) {
            clearTimeout(clickTimer);
            this.documentClickTimers.delete(ref);
        }
        const shadeTimer = this.shadeClickTimers.get(ref);
        if (shadeTimer) {
            clearTimeout(shadeTimer);
            this.shadeClickTimers.delete(ref);
        }

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

        // Cleanup subscriptions
        const subs = this.subscriptionsMap.get(ref);
        if (subs) {
            subs.forEach(s => s.unsubscribe());
            this.subscriptionsMap.delete(ref);
        }

        this.appRef.detachView(ref.hostView);
        ref.destroy();
    }

    /**
     * 判断指定年份是否为闰年
     */
    isLeap(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    /**
     * 数字补零补齐指定位数 (默认 2 位)
     */
    digit(num: number | string, length: number = 2): string {
        let str = String(num);
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }

    /**
     * 将 DateObject 格式化为对应格式的日期字符串
     * @param date DateObject 格式对象
     * @param formatStr 格式化字符串 (默认 'yyyy-MM-dd')
     */
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

    /**
     * 将 DateObject 日期对象转为毫秒时间戳用于对比运算
     */
    getTime(date: DateObject): number {
        return new Date(date.year, date.month, date.date, date.hours, date.minutes, date.seconds).getTime();
    }

    /**
     * 获取指定年份与月份的总天数
     */
    totalDay(year: number, month: number): number {
        const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const m = ((month % 12) + 12) % 12;
        return this.isLeap(year) && m === 1 ? 29 : days[m];
    }

    /**
     * 获取系统当前时间或指定 Date 对象的 DateObject 数据结构
     */
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

    /**
     * 将字符串、Date 对象或数值解析为 DateObject 标准数据结构
     */
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

        // Match yyyy-MM-dd HH:mm:ss or yyyy-MM-dd manually to avoid timezone issues with new Date()
        const match = typeof value === 'string' ? value.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/) : null;
        if (match) {
            return {
                year: parseInt(match[1], 10),
                month: parseInt(match[2], 10) - 1, // month is 0-indexed
                date: parseInt(match[3], 10),
                hours: match[4] ? parseInt(match[4], 10) : 0,
                minutes: match[5] ? parseInt(match[5], 10) : 0,
                seconds: match[6] ? parseInt(match[6], 10) : 0
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

    /**
     * 生成并计算用于日历面板渲染的 42 格单元格数据 (含上月余日、当月天数、下月填补天数)
     */
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

    /**
     * 校验并约束 DateObject 年月日时分秒的有效取值范围，防止合法性越界
     */
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
