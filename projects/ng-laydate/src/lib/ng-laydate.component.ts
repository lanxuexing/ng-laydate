import { Component, ViewEncapsulation, ElementRef, inject, input, output, signal, computed, effect, ChangeDetectionStrategy, WritableSignal, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLaydateService } from './ng-laydate.service';
import { DateObject, LaydateConfig, CalendarDay } from './ng-laydate.types';
import { SafeHtmlPipe } from './safe-html.pipe';

@Component({
  selector: 'ng-laydate',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './ng-laydate.component.html',
  styleUrls: ['./ng-laydate.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.layui-laydate]': 'true',
    '[class.layui-laydate-static]': 'finalConfig().position === "static"',
    '[class.layui-laydate-range]': '!!finalConfig().range',
    '[class.laydate-has-shortcut]': '!!finalConfig().shortcuts',
    '[class.layui-laydate-linkage]': 'isLinked()',
    '[class.laydate-theme-molv]': 'parsedTheme().base === "molv"',
    '[class.laydate-theme-grid]': 'parsedTheme().base === "grid"',
    '[class.laydate-theme-circle]': 'parsedTheme().base === "circle"',
    '[class.laydate-theme-fullpanel]': 'parsedTheme().base === "fullpanel"',
    '[class.laydate-theme-dark]': 'parsedTheme().base === "dark" || !!finalConfig().darkMode',
    '[class.laydate-ym-show]': '!finalConfig().range && (view() === "year" || view() === "month")',
    '[class.laydate-time-show]': '!finalConfig().range && view() === "time"',
    '[style.--laydate-theme-color]': 'parsedTheme().color',
    '[style.--laydate-theme-color-light]': 'themeColorLight()'
  }
})
export class NgLaydateComponent {
  private service = inject(NgLaydateService);
  private el = inject(ElementRef);
  @ViewChildren('timeOl_hours') hoursOls!: QueryList<ElementRef<HTMLOListElement>>;
  @ViewChildren('timeOl_minutes') minutesOls!: QueryList<ElementRef<HTMLOListElement>>;
  @ViewChildren('timeOl_seconds') secondsOls!: QueryList<ElementRef<HTMLOListElement>>;

  config = input<LaydateConfig>({});
  select = output<string>();
  clearOutput = output<void>();



  // State
  // We initialize with a default, but effect will override based on config
  currentDate = signal<DateObject>(this.service.systemDate());

  // Range State
  startDate = signal<DateObject>(this.service.systemDate());
  endDate = signal<DateObject>(this.service.systemDate());
  rangeState = signal<'none' | 'selecting'>('none');
  hoverDate = signal<DateObject | null>(null);

  // Navigation State (for rendering calendars)
  leftDate = signal<DateObject>(this.service.systemDate());
  rightDate = signal<DateObject>(this.service.systemDate());

  // Views
  view = signal<'date' | 'month' | 'year' | 'time'>('date');
  leftView = signal<'date' | 'month' | 'year' | 'time'>('date');
  rightView = signal<'date' | 'month' | 'year' | 'time'>('date');

  // Year Lists
  yearList = signal<number[]>([]);
  leftYearList = signal<number[]>([]);
  rightYearList = signal<number[]>([]);
  private initialized = false;
  private lastValueProp: any = undefined;

  // Static Data
  timeList = {
    hours: Array.from({ length: 24 }, (_, i) => i),
    minutes: Array.from({ length: 60 }, (_, i) => i),
    seconds: Array.from({ length: 60 }, (_, i) => i)
  };


  // Computed Data
  // Note: We use computed for calendar data to automatically react to date/config changes
  // This replaces the explicit render() call for the most part

  // However, because getCalendarData depends on year/month which are inside objects, 
  // we need to be careful. Signals trigger on reference change (immutability).
  // We must ensure we propagate updates by creating new DateObjects.

  calendarData = computed(() => {
    const d = this.currentDate();
    const c = this.config();
    return this.service.getCalendarData(d.year, d.month, c);
  });

  leftCalendar = computed(() => {
    const d = this.leftDate();
    const c = this.config();
    return this.service.getCalendarData(d.year, d.month, c);
  });

  rightCalendar = computed(() => {
    const d = this.rightDate();
    const c = this.config();
    return this.service.getCalendarData(d.year, d.month, c);
  });

  finalConfig = computed(() => {
    const cfg = this.config();
    return {
      showBottom: true,
      btns: ['clear', 'now', 'confirm'],
      autoConfirm: true,
      ...cfg
    };
  });

  isLinked = computed(() => {
    const cfg = this.finalConfig();
    if (!cfg.range || !cfg.rangeLinked) return false;
    return true;
  });

  isConfirmDisabled = computed(() => {
    const cfg = this.finalConfig();
    if (!cfg.range) return false;

    // Range must be fully selected (not in 'selecting' state)
    // and start must not be greater than end
    if (this.rangeState() === 'selecting') return true;

    const start = this.service.getTime(this.startDate());
    const end = this.service.getTime(this.endDate());
    return start > end;
  });

  // Parse theme config: can be 'molv', '#FF5722', or ['grid', '#FF5722']
  parsedTheme = computed(() => {
    const theme = this.finalConfig().theme;
    const builtInThemes = ['default', 'molv', 'grid', 'circle', 'fullpanel', 'dark'];

    if (!theme) {
      return { base: 'default', color: null };
    }

    // Array format: ['grid', '#FF5722']
    if (Array.isArray(theme)) {
      return {
        base: builtInThemes.includes(theme[0]) ? theme[0] : 'default',
        color: theme[1] || null
      };
    }

    // String format
    if (typeof theme === 'string') {
      // Check if it's a color (starts with #)
      if (theme.startsWith('#')) {
        return { base: 'default', color: theme };
      }
      // Built-in theme name
      if (builtInThemes.includes(theme)) {
        return { base: theme, color: null };
      }
      // Treat as custom color
      return { base: 'default', color: theme };
    }

    return { base: 'default', color: null };
  });

  themeColorLight = computed(() => {
    const color = this.parsedTheme().color;
    return this.service.hexToRgba(color || '#16b777', 0.1);
  });

  // i18n Dictionary
  i18n = computed(() => {
    const lang = this.finalConfig().lang || 'cn';

    if (lang === 'en') {
      return {
        weeks: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        time: ['Hours', 'Minutes', 'Seconds'],
        timeTips: 'Select Time',
        backToDate: 'Back to Date',
        hint: 'Preview',
        startTime: 'Start Time',
        endTime: 'End Time',
        dateTips: 'Select Date',
        monthTips: 'Select Month',
        yearTips: 'Select Year',
        duration: 'Duration',
        tools: {
          confirm: 'Confirm',
          clear: 'Clear',
          now: 'Now'
        },
        formatYear: (year: number) => `${year}`,
        formatMonth: (month: number) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months[month];
        },
        invalidRange: 'Date range limit set to <br> {min} - {max}',
        invalidDate: 'Date is unavailable',
        invalidEndEarly: 'End time cannot be earlier than start time<br>Please reselect'
      };
    }

    return {
      weeks: ['日', '一', '二', '三', '四', '五', '六'],
      months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      time: ['时', '分', '秒'],
      timeTips: '选择时间',
      backToDate: '返回日期',
      hint: '结果预览',
      startTime: '开始时间',
      endTime: '结束时间',
      dateTips: '选择日期',
      monthTips: '选择月份',
      yearTips: '选择年份',
      duration: '时长',
      tools: {
        confirm: '确定',
        clear: '清空',
        now: '现在'
      },
      formatYear: (year: number) => `${year}年`,
      formatMonth: (month: number) => `${month + 1}月`,
      invalidRange: '日期可选值设定在 <br> {min} 到 {max}',
      invalidDate: '此日期不可选',
      invalidEndEarly: '结束时间不能早于开始时间<br>请重新选择'
    };
  });

  footerBtns = computed(() => {
    const cfg = this.finalConfig();
    let btns = cfg.btns;

    // Default buttons if not provided
    if (!btns || btns.length === 0) {
      if (cfg.range) {
        btns = ['clear', 'confirm'];
      } else {
        btns = ['clear', 'now', 'confirm'];
      }
    }

    const tools = this.i18n().tools;
    const labels: Record<string, string> = {
      clear: tools.clear,
      now: tools.now,
      confirm: tools.confirm
    };
    return btns.map(b => ({ type: b, label: labels[b] || b }));
  });

  // Week Headers (Rotated)
  weekHeaders = computed(() => {
    const weeks = this.i18n().weeks;
    const offset = this.finalConfig().weekStart || 0;
    return [...weeks.slice(offset), ...weeks.slice(0, offset)];
  });

  // Time Column Visibility
  timeColumnVisibility = computed(() => {
    const fmt = this.getDateFormat();
    return {
      h: /H/i.test(fmt), // 'H' or 'h'
      m: /m/.test(fmt),
      s: /s/.test(fmt)
    };
  });

  // Preview Logic
  showPreview = computed(() => {
    const cfg = this.finalConfig();
    // In FullPanel mode, we ALWAYS want preview for datetime to push buttons to the right
    // and provide visual feedback for the side-by-side selection.
    if (cfg.theme === 'fullpanel') return true;

    // Default true, force false if standard datetime (to keep standard look)
    if (cfg.type === 'datetime') return false;
    return cfg.isPreview !== false;
  });

  // Check if time item is disabled
  isDisabledTime(type: 'hours' | 'minutes' | 'seconds', value: number, isRight: boolean = false): boolean {
    const cfg = this.finalConfig();
    if (!cfg.disabledTime) return false;

    // Get current date context
    const dObj = isRight ? this.rightDate() : (cfg.range ? this.leftDate() : this.currentDate());
    const date = new Date(dObj.year, dObj.month, dObj.date, dObj.hours, dObj.minutes, dObj.seconds);

    // Call callback
    const result = cfg.disabledTime(date, 'time');
    if (!result || typeof result !== 'object') return false;

    // Get disabled limits
    const limits = result as any;
    if (type === 'hours' && typeof limits.hours === 'function') {
      const arr = limits.hours();
      return Array.isArray(arr) && arr.includes(value);
    }
    if (type === 'minutes' && typeof limits.minutes === 'function') {
      const arr = limits.minutes(dObj.hours);
      return Array.isArray(arr) && arr.includes(value);
    }
    if (type === 'seconds' && typeof limits.seconds === 'function') {
      const arr = limits.seconds(dObj.hours, dObj.minutes);
      return Array.isArray(arr) && arr.includes(value);
    }

    return false;
  }

  // Hint State
  hintState = signal<{ content: string; visible: boolean }>({ content: '', visible: false });
  private hintTimer: any = null;

  constructor() {
    // Initialize Logic
    effect(() => {
      const cfg = this.config();
      // Register with service if ID is present
      if (cfg.id) {
        this.service.register(cfg.id, this);
      }

      // Guard against unnecessary resets (especially since config is often an object literal)
      const valToStr = (v: any) => {
        if (!v) return '';
        if (v instanceof Date) return v.getTime().toString();
        return JSON.stringify(v);
      };

      const valueChanged = valToStr(cfg.value) !== valToStr(this.lastValueProp);
      if (this.initialized && !valueChanged) return;

      this.initialized = true;
      this.lastValueProp = cfg.value;

      // Handle initial value
      if (cfg.value) {
        if (cfg.range && typeof cfg.value === 'string') {
          const separator = typeof cfg.range === 'string' ? cfg.range : ' - ';
          const parts = cfg.value.split(separator);
          if (parts.length === 2) {
            const start = this.service.parse(parts[0]);
            const end = this.service.parse(parts[1]);
            this.startDate.set(start);
            this.endDate.set(end);
            this.leftDate.set({ ...start });
            this.rightDate.set({ ...end });
            if (cfg.rangeLinked) {
              this.syncRightDateFromLeft();
            }
          }
        } else {
          const parsed = this.service.parse(cfg.value);
          this.currentDate.set(parsed);
          this.leftDate.set({ ...parsed });
        }
      } else {
        const now = this.service.systemDate();

        // If theme is fullpanel, we want to start at 00:00:00 for time selection
        // per user request for a "clean" starting point.
        if (cfg.theme === 'fullpanel') {
          now.hours = 0;
          now.minutes = 0;
          now.seconds = 0;
        }

        this.currentDate.set(now);
        this.startDate.set(now);
        this.endDate.set(now);
        this.leftDate.set({ ...now });

        const nextMonth = { ...now };
        nextMonth.month++;
        if (nextMonth.month > 11) { nextMonth.month = 0; nextMonth.year++; }
        this.rightDate.set(nextMonth);
      }

      // Handle type
      if (cfg.type === 'year') {
        this.view.set('year');
        this.leftView.set('year');
        this.rightView.set('year');
        this.initYearList(this.currentDate().year, 'single');
        this.initYearList(this.leftDate().year, 'left');
        if (cfg.range) this.initYearList(this.rightDate().year, 'right');
      } else if (cfg.type === 'month') {
        this.view.set('month');
        this.leftView.set('month');
        this.rightView.set('month');
      } else if (cfg.type === 'time') {
        this.view.set('time');
        this.leftView.set('time');
        this.rightView.set('time');
        if (cfg.range) {
          this.leftDate.set({ ...this.startDate() });
          this.rightDate.set({ ...this.endDate() });
        }
      }

      // Ready callback
      if (cfg.ready) {
        cfg.ready(this.currentDate());
      }
    }, { allowSignalWrites: true }); // We write to other signals in this effect

    // Scroll Effect: Whenever time view becomes active OR values change, scroll to selected values
    effect(() => {
      const cfg = this.finalConfig();
      const isTimeView = this.view() === 'time' || this.leftView() === 'time' || this.rightView() === 'time' || cfg.theme === 'fullpanel';
      // Add dependencies on the values to trigger re-scroll when they change (e.g. "Now" clicked)
      const cur = this.currentDate();
      const st = this.startDate();
      const ed = this.endDate();

      if (isTimeView) {
        // Use a slight delay to ensure DOM is rendered (after signal change)
        setTimeout(() => this.autoScrollTime(), 0);
      }
    });

    // Cleanup
    effect((onCleanup) => {
      onCleanup(() => {
        const id = this.config().id;
        if (id) {
          this.service.unregister(id);
        }
      });
    });
  }

  showHint(content: string, ms: number = 3000) {
    this.hintState.set({ content, visible: true });
    if (this.hintTimer) clearTimeout(this.hintTimer);
    if (ms > 0) {
      this.hintTimer = setTimeout(() => {
        this.hintState.set({ content: '', visible: false });
      }, ms);
    }
  }

  // Helper to generate year list
  generateYearList(centerYear: number): number[] {
    const startYear = centerYear - 7;
    return Array.from({ length: 15 }, (_, i) => startYear + i);
  }

  initYearList(centerYear: number, panel: 'left' | 'right' | 'single' = 'single') {
    const list = this.generateYearList(centerYear);
    if (panel === 'left') this.leftYearList.set(list);
    else if (panel === 'right') this.rightYearList.set(list);
    else this.yearList.set(list);
  }

  // Navigation Logic
  prevYear(isRight: boolean = false) {
    const cfg = this.finalConfig();
    const isLinked = this.isLinked();
    const currView = isRight ? this.rightView() : (cfg.range ? this.leftView() : this.view());
    const useLeft = (isLinked || !isRight);

    if (currView === 'year') {
      const list = useLeft ? this.leftYearList() : this.rightYearList();
      const first = list[0] - 15;
      const center = first + 7;
      this.initYearList(center, useLeft ? 'left' : 'right');

      // Update base date to keep header in sync
      const targetSignal = useLeft ? this.leftDate : this.rightDate;
      targetSignal.set({ ...targetSignal(), year: center });
    } else {
      const targetSignal = useLeft ? (cfg.range ? this.leftDate : this.currentDate) : this.rightDate;
      const d = { ...targetSignal() };
      d.year--;
      targetSignal.set(d);
      if (!cfg.range) this.leftDate.set(d);
    }

    if (isLinked) {
      this.syncRightDateFromLeft();
    }
  }

  nextYear(isRight: boolean = false) {
    const cfg = this.finalConfig();
    const isLinked = this.isLinked();
    const currView = isRight ? this.rightView() : (cfg.range ? this.leftView() : this.view());
    const useLeft = (isLinked || !isRight);

    if (currView === 'year') {
      const list = useLeft ? this.leftYearList() : this.rightYearList();
      const last = list[list.length - 1] + 15;
      const center = last - 7;
      this.initYearList(center, useLeft ? 'left' : 'right');

      // Update base date to keep header in sync
      const targetSignal = useLeft ? this.leftDate : this.rightDate;
      targetSignal.set({ ...targetSignal(), year: center });
    } else {
      const targetSignal = useLeft ? (cfg.range ? this.leftDate : this.currentDate) : this.rightDate;
      const d = { ...targetSignal() };
      d.year++;
      targetSignal.set(d);
      if (!cfg.range) this.leftDate.set(d);
    }

    if (isLinked) {
      this.syncRightDateFromLeft();
    }
  }

  prevMonth(isRight: boolean = false) {
    const cfg = this.finalConfig();
    const isLinked = this.isLinked();
    const targetSignal = (isLinked || !isRight) ? (cfg.range ? this.leftDate : this.currentDate) : this.rightDate;

    const d = { ...targetSignal() };
    d.month--;
    if (d.month < 0) { d.month = 11; d.year--; }
    targetSignal.set(d);
    if (!cfg.range) this.leftDate.set(d);

    if (isLinked) {
      this.syncRightDateFromLeft();
    }
  }

  nextMonth(isRight: boolean = false) {
    const cfg = this.finalConfig();
    const isLinked = this.isLinked();
    const targetSignal = (isLinked || !isRight) ? (cfg.range ? this.leftDate : this.currentDate) : this.rightDate;

    const d = { ...targetSignal() };
    d.month++;
    if (d.month > 11) { d.month = 0; d.year++; }
    targetSignal.set(d);
    if (!cfg.range) this.leftDate.set(d);

    if (isLinked) {
      this.syncRightDateFromLeft();
    }
  }

  private syncRightDateFromLeft() {
    const cfg = this.finalConfig();
    const left = this.leftDate();
    const right = { ...left };

    if (cfg.type === 'year') {
      right.year += 15;
    } else if (cfg.type === 'month') {
      right.year += 1;
    } else {
      right.month++;
      if (right.month > 11) {
        right.month = 0;
        right.year++;
      }
    }

    this.rightDate.set(right);

    if (cfg.type === 'year') {
      this.initYearList(right.year, 'right');
    }
  }

  switchView(view: 'date' | 'month' | 'year' | 'time', isRight: boolean = false) {
    const cfg = this.config();
    if (view === 'year') {
      const date = isRight ? this.rightDate() : (cfg.range ? this.leftDate() : this.currentDate());
      this.initYearList(date.year, isRight ? 'right' : (cfg.range ? 'left' : 'single'));
    }

    if (cfg.range) {
      if (isRight) this.rightView.set(view);
      else this.leftView.set(view);
    } else {
      this.view.set(view);
      this.leftView.set(view); // sync
    }
  }

  getYearRangeLabel(isRight: boolean) {
    const list = isRight ? this.rightYearList() : (this.finalConfig().range ? this.leftYearList() : this.yearList());
    if (list.length === 0) return '';
    const start = this.i18n().formatYear(list[0]);
    const end = this.i18n().formatYear(list[list.length - 1]);
    return `${start} - ${end}`;
  }

  selectDay(day: CalendarDay, isRight: boolean = false) {
    if (day.disabled) {
      this.showHint(this.i18n().invalidDate);
      return;
    }

    if (day.type === 'prev') {
      this.prevMonth(isRight);
      return;
    }
    if (day.type === 'next') {
      this.nextMonth(isRight);
      return;
    }

    const cfg = this.config();

    if (cfg.range) {
      const dayObj = { year: day.year, month: day.month, date: day.day, hours: 0, minutes: 0, seconds: 0 };
      if (this.isLinked()) {
        this.handleRangeSelection(dayObj);
      } else {
        // Independent mode: Left panel always sets startDate, Right sets endDate
        if (isRight) {
          this.endDate.set({ ...this.endDate(), ...dayObj });
        } else {
          this.startDate.set({ ...this.startDate(), ...dayObj });
        }
      }
    }
    else {
      const d = { ...this.currentDate() };
      d.date = day.day;
      this.currentDate.set(d);

      const formatStr = this.getDateFormat();
      const result = this.service.format(d, formatStr);

      // Always trigger change callback on selection
      if (cfg.change) cfg.change(result, d);

      // Auto Confirm Logic
      if (cfg.type !== 'datetime' && cfg.type !== 'time') {
        if (this.finalConfig().autoConfirm !== false) {
          this.select.emit(result); // Triggers close
          if (cfg.done) cfg.done(result, d);
        }
      } else {
        // Datetime/Time: switch view or just update signal (handled above)
        if (cfg.type === 'datetime') this.view.set('time');
      }
    }
  }

  confirmRange() {
    const cfg = this.config();
    const separator = typeof cfg.range === 'string' ? cfg.range : ' - ';
    const formatStr = this.getDateFormat();
    const startStr = this.service.format(this.startDate(), formatStr);
    const endStr = this.service.format(this.endDate(), formatStr);
    const result = `${startStr}${separator}${endStr}`;
    this.select.emit(result);
    if (cfg.change) cfg.change(result, this.startDate(), this.endDate());
    if (cfg.done) cfg.done(result, this.startDate(), this.endDate());
  }

  getPreview() {
    const d = this.currentDate();
    const cfg = this.finalConfig();
    const formatStr = this.getDateFormat();
    if (cfg.range) {
      const startStr = this.service.format(this.startDate(), formatStr);
      const endStr = this.service.format(this.endDate(), formatStr);
      const separator = typeof cfg.range === 'string' ? cfg.range : ' - ';
      return `${startStr}${separator}${endStr}`;
    }
    return this.service.format(d, formatStr);
  }


  digit(num: number) { return this.service.digit(num); }

  getRows(data: any[]) {
    const rows = [];
    for (let i = 0; i < data.length; i += 7) {
      rows.push(data.slice(i, i + 7));
    }
    return rows;
  }

  isSameDay(d1: DateObject, year: number, month: number, day: number) {
    return d1.year === year && d1.month === month && d1.date === day;
  }

  isThisDay(year: number, month: number, day: number, isRight: boolean = false) {
    const cfg = this.finalConfig();
    if (cfg.range) {
      if (cfg.rangeLinked) {
        return this.isSameDay(this.startDate(), year, month, day) ||
          (this.rangeState() === 'none' && this.isSameDay(this.endDate(), year, month, day));
      } else {
        // Independent: Left only highlights start, Right only highlights end
        return isRight ? this.isSameDay(this.endDate(), year, month, day) : this.isSameDay(this.startDate(), year, month, day);
      }
    }
    const cur = this.currentDate();
    return cur.year === year && cur.month === month && cur.date === day;
  }

  isThisYear(y: number, isRight: boolean = false) {
    const cfg = this.finalConfig();
    const start = this.startDate();
    const end = this.endDate();

    if (cfg.range && cfg.type === 'year') {
      if (cfg.rangeLinked) {
        return start.year === y || (this.rangeState() === 'none' && end.year === y);
      } else {
        return isRight ? end.year === y : start.year === y;
      }
    }

    // In single year picker, or when navigating years in date picker
    const date = isRight ? this.rightDate() : (cfg.range ? this.leftDate() : this.currentDate());
    return date.year === y;
  }

  isThisMonth(m: number, y: number, isRight: boolean = false) {
    const cfg = this.finalConfig();
    if (cfg.range && cfg.type === 'month') {
      if (cfg.rangeLinked) {
        return (this.startDate().year === y && this.startDate().month === m) ||
          (this.rangeState() === 'none' && this.endDate().year === y && this.endDate().month === m);
      } else {
        const target = isRight ? this.endDate() : this.startDate();
        return target.year === y && target.month === m;
      }
    }
    const date = isRight ? this.rightDate() : (cfg.range ? this.leftDate() : this.currentDate());
    return date.year === y && date.month === m;
  }

  hoverValue(val: Partial<DateObject>) {
    const cfg = this.finalConfig();
    if (cfg.range && this.rangeState() === 'selecting') {
      this.hoverDate.set({
        year: val.year ?? 0,
        month: val.month ?? 0,
        date: val.date ?? 1,
        hours: val.hours ?? 0,
        minutes: val.minutes ?? 0,
        seconds: val.seconds ?? 0
      });
    }
  }

  isInRange(year: number, month: number, day: number, hours: number = 0, minutes: number = 0, seconds: number = 0) {
    const cfg = this.finalConfig();
    if (!cfg.range) return false;

    // Normalize for comparison based on type
    const getTime = (d: DateObject) => {
      // In year picker, just compare years
      if (cfg.type === 'year') return new Date(d.year, 0, 1).getTime();
      // In month picker, compare year and month
      if (cfg.type === 'month') return new Date(d.year, d.month, 1).getTime();
      // In date/time picker, compare YMD
      return new Date(d.year, d.month, d.date).getTime();
    };

    const current = new Date(year, month, day).getTime();
    const start = getTime(this.startDate());

    if (this.rangeState() === 'selecting') {
      const hover = this.hoverDate();
      if (!hover) return current === start;
      const hoverT = getTime(hover);
      const min = Math.min(start, hoverT);
      const max = Math.max(start, hoverT);
      return current >= min && current <= max;
    }

    const end = getTime(this.endDate());
    return current >= start && current <= end;
  }

  selectYear(y: number, isRight: boolean = false) {
    const cfg = this.finalConfig();
    if (cfg.range && cfg.type === 'year') {
      const dayObj = { year: y, month: 0, date: 1 };
      if (this.isLinked()) {
        this.handleRangeSelection(dayObj);
      } else {
        if (isRight) {
          this.endDate.set({ ...this.endDate(), ...dayObj });
          this.rightDate.set({ ...this.rightDate(), year: y });
        } else {
          this.startDate.set({ ...this.startDate(), ...dayObj });
          this.leftDate.set({ ...this.leftDate(), year: y });
        }
      }
      return;
    }

    if (isRight) {
      const d = { ...this.rightDate() };
      d.year = y;
      this.rightDate.set(d);
      this.rightView.set(cfg.type === 'year' ? 'year' : 'month');
    } else {
      const d = { ...this.currentDate() };
      d.year = y;
      this.currentDate.set(d);

      if (cfg.range) {
        const ld = { ...this.leftDate() };
        ld.year = y;
        this.leftDate.set(ld);
      }

      if (cfg.type === 'year') {
        if (this.finalConfig().autoConfirm !== false) {
          this.confirm();
        }
      } else {
        if (cfg.range) this.leftView.set('month');
        else this.view.set('month');
      }
    }
  }

  selectMonth(m: number, isRight: boolean = false) {
    const cfg = this.finalConfig();
    if (cfg.range && cfg.type === 'month') {
      const baseDate = isRight ? this.rightDate() : this.leftDate();
      const dayObj = { year: baseDate.year, month: m, date: 1 };

      if (this.isLinked()) {
        this.handleRangeSelection(dayObj);
      } else {
        if (isRight) {
          this.endDate.set({ ...this.endDate(), ...dayObj });
          this.rightDate.set({ ...this.rightDate(), month: m });
        } else {
          this.startDate.set({ ...this.startDate(), ...dayObj });
          this.leftDate.set({ ...this.leftDate(), month: m });
        }
      }
      return;
    }

    if (isRight) {
      const d = { ...this.rightDate() };
      d.month = m;
      this.rightDate.set(d);
      this.rightView.set(cfg.type === 'month' ? 'month' : 'date');
    } else {
      const d = { ...this.currentDate() };
      d.month = m;
      this.currentDate.set(d);

      if (cfg.range) {
        const ld = { ...this.leftDate() };
        ld.month = m;
        this.leftDate.set(ld);
      }

      if (cfg.type === 'month') {
        if (this.finalConfig().autoConfirm !== false) {
          this.confirm();
        }
      } else {
        if (cfg.range) this.leftView.set('date');
        else this.view.set('date');
      }
    }
  }

  private handleRangeSelection(day: Partial<DateObject>) {
    const cfg = this.finalConfig();
    if (this.rangeState() === 'none') {
      // Start picking
      this.startDate.set({ ...this.startDate(), ...day });
      this.rangeState.set('selecting');
    } else {
      // End picking
      let start = this.startDate();
      let end = { ...this.endDate(), ...day };

      // Auto-swap only in linked mode
      if (cfg.rangeLinked) {
        const startTime = this.service.getTime(start);
        const endTime = this.service.getTime(end);
        if (startTime > endTime) {
          [start, end] = [end, start];
        }
      }

      this.startDate.set(start);
      this.endDate.set(end);
      this.rangeState.set('none');
      this.hoverDate.set(null);
    }
  }

  selectTime(type: 'hours' | 'minutes' | 'seconds', val: number, isRight: boolean = false) {
    if (this.isDisabledTime(type, val, isRight)) {
      this.showHint(this.i18n().invalidDate);
      return;
    }
    const cfg = this.finalConfig();
    if (cfg.range) {
      if (isRight) {
        const d = { ...this.endDate() };
        d[type] = val;
        this.endDate.set(d);
        this.rightDate.set({ ...d }); // Sync HMS for list checkmark
      } else {
        const d = { ...this.startDate() };
        d[type] = val;
        this.startDate.set(d);
        this.leftDate.set({ ...d }); // Sync HMS for list checkmark
      }
    } else {
      const d = { ...this.currentDate() };
      d[type] = val;
      this.currentDate.set(d);
    }
  }

  toggleTime() {
    const cfg = this.finalConfig();
    if (cfg.range) {
      const l = this.leftView() === 'time' ? 'date' : 'time';
      const r = this.rightView() === 'time' ? 'date' : 'time';
      this.leftView.set(l);
      this.rightView.set(r);

      // Sync selection to views when entering time mode
      if (l === 'time') this.leftDate.set({ ...this.startDate() });
      if (r === 'time') this.rightDate.set({ ...this.endDate() });
    } else {
      const v = this.view() === 'time' ? 'date' : 'time';
      this.view.set(v);
      if (v === 'time') this.leftDate.set({ ...this.currentDate() });
    }
  }

  clear() {
    this.clearOutput.emit();
    const cfg = this.finalConfig();
    // Reset internal state for Time Range
    if (cfg.type === 'time' && cfg.range) {
      const zero = new Date();
      zero.setHours(0, 0, 0, 0);
      const max = new Date();
      max.setHours(23, 59, 59, 0); // Or 00:59:59 depending on interpretation, usually 00:00:00 is default clean state.
      // User request: 0:0:0 - 59:59:59 ?? Maybe they mean 00:59:59? 
      // Standard Safe Default: 00:00:00 - 00:00:00

      this.startDate.set({ year: zero.getFullYear(), month: zero.getMonth(), date: zero.getDate(), hours: 0, minutes: 0, seconds: 0 });
      // Logic for end date: user requested 59:59:59, likely implying Max Time (End of Day)
      this.endDate.set({ year: zero.getFullYear(), month: zero.getMonth(), date: zero.getDate(), hours: 23, minutes: 59, seconds: 59 });

      this.leftDate.set({ ...this.startDate() });
      this.rightDate.set({ ...this.endDate() });
      this.autoScrollTime();
    }
  }

  now() {
    const now = this.service.systemDate();
    const cfg = this.finalConfig();
    if (cfg.range) {
      this.startDate.set({ ...now });
      this.endDate.set({ ...now });

      // Update view models to ensure lists reflect 'now'
      this.leftDate.set({ ...now });
      this.rightDate.set({ ...now });

      this.autoScrollTime(); // Ensure scroll to now
      this.confirmRange();
    } else {
      this.currentDate.set(now);
      this.autoScrollTime(); // Ensure scroll to now
      this.confirm();
    }
  }

  handleShortcut(item: any) {
    let value = item.value;
    const cfg = this.finalConfig();

    // 1. Resolve function
    if (typeof value === 'function') {
      value = value();
    }

    // Helper to resolve common tokens
    const resolve = (v: any) => {
      if (v instanceof Date) return v;
      if (typeof v === 'string') {
        const now = new Date();
        if (v === 'now' || v === 'today') return now;
        if (v === 'yesterday') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        if (v === 'tomorrow') return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        if (v === 'last_month') return new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (v === 'next_month') return new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return v; // Return string as-is for parsing
      }
      return v;
    };

    // 2. Handle Range (Array)
    let valArr: any[] = [];
    if (Array.isArray(value)) {
      valArr = value;
    } else if (typeof value === 'string' && cfg.range) {
      // Legacy string helpers for range or single string range
      const now = new Date();
      if (value === 'last_7_days') valArr = [new Date(now.getTime() - 7 * 24 * 3600 * 1000), now];
      else if (value === 'last_30_days') valArr = [new Date(now.getTime() - 30 * 24 * 3600 * 1000), now];
      else if (value === 'last_90_days') valArr = [new Date(now.getTime() - 90 * 24 * 3600 * 1000), now];
      else if (value === 'last_year_now') valArr = [new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), now];
      else if (value === 'next_year_today') valArr = [now, new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())];
    }

    // 3. Apply
    if (cfg.range && valArr.length === 2) {
      const start = this.service.parse(resolve(valArr[0]));
      const end = this.service.parse(resolve(valArr[1]));

      // Validate swap
      if (this.service.getTime(start) > this.service.getTime(end)) {
        const temp = { ...start };
        start.year = end.year; start.month = end.month; start.date = end.date;
        end.year = temp.year; end.month = temp.month; end.date = temp.date;
      }

      this.startDate.set(start);
      this.endDate.set(end);
      this.leftDate.set({ ...start });
      this.rightDate.set({ ...end });
      this.confirmRange();
    } else {
      // Single Value or Fallback
      // If range but no valid array, maybe treat single val as start? or just ignore
      // Typically shortcuts for Single Date Picker use this path
      const resolved = resolve(value);
      const parsed = this.service.parse(resolved);
      this.currentDate.set(parsed);
      this.leftDate.set({ ...parsed });
      this.confirm();
    }
  }

  checkValidity(date: DateObject): boolean {
    const d = this.service.getTime(date);
    const cfg = this.finalConfig();
    const min = cfg.min ? this.service.getTime(this.service.parse(cfg.min)) : -Infinity;
    const max = cfg.max ? this.service.getTime(this.service.parse(cfg.max)) : Infinity;

    if (d < min || d > max) {
      let msg = this.i18n().invalidRange;
      if (cfg.min) msg = msg.replace('{min}', cfg.min.toString());
      if (cfg.max) msg = msg.replace('{max}', cfg.max.toString());
      this.showHint(msg);
      return false;
    }
    return true;
  }

  handleBtnClick(type: string) {
    if (type === 'confirm' && this.isConfirmDisabled()) {
      this.showHint(this.i18n().invalidEndEarly);
      return;
    }
    if (type === 'clear') this.clear();
    if (type === 'now') this.now();
    if (type === 'confirm') {
      const cfg = this.finalConfig();
      if (cfg.range) {
        if (!this.checkValidity(this.startDate()) || !this.checkValidity(this.endDate())) return;
        this.confirmRange();
      } else {
        if (!this.checkValidity(this.currentDate())) return;
        this.confirm();
      }
      if (cfg.onConfirm) cfg.onConfirm(this.service.format(this.currentDate()), this.currentDate());
    }
  }

  confirm() {
    const cfg = this.config();
    const formatStr = this.getDateFormat();
    const result = this.service.format(this.currentDate(), formatStr);
    this.select.emit(result);
    if (cfg.change) cfg.change(result, this.currentDate());
    if (cfg.done) cfg.done(result, this.currentDate());
  }

  // Helper to determine format
  private getDateFormat(): string {
    const cfg = this.config();
    if (cfg.format) return cfg.format;
    if (cfg.type === 'year') return 'yyyy';
    if (cfg.type === 'month') return 'yyyy-MM';
    if (cfg.type === 'time') return 'HH:mm:ss';
    if (cfg.type === 'datetime') return 'yyyy-MM-dd HH:mm:ss';
    return 'yyyy-MM-dd';
  }

  private autoScrollTime() {
    const cfg = this.finalConfig();
    const scroll = (ols: QueryList<ElementRef<HTMLOListElement>>, val: number | ((idx: number) => number)) => {
      ols.forEach((ol, i) => {
        const v = typeof val === 'function' ? val(i) : val;
        // Laydate original formula: 30 * (val - 2) to center the selected item
        ol.nativeElement.scrollTop = (v - 2) * 30;
      });
    };

    if (cfg.range) {
      scroll(this.hoursOls, (i) => i === 0 ? this.startDate().hours : this.endDate().hours);
      scroll(this.minutesOls, (i) => i === 0 ? this.startDate().minutes : this.endDate().minutes);
      scroll(this.secondsOls, (i) => i === 0 ? this.startDate().seconds : this.endDate().seconds);
    } else {
      const cur = this.currentDate();
      scroll(this.hoursOls, cur.hours);
      scroll(this.minutesOls, cur.minutes);
      scroll(this.secondsOls, cur.seconds);
    }
  }
}
