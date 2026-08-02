/**
 * Represents a complete date and time object with year, month, date, hours, minutes, and seconds.
 */
export interface DateObject {
    /** Year (e.g., 2026) */
    year: number;
    /** Month index (0-11 for Jan-Dec) */
    month: number;
    /** Day of the month (1-31) */
    date: number;
    /** Hours (0-23) */
    hours: number;
    /** Minutes (0-59) */
    minutes: number;
    /** Seconds (0-59) */
    seconds: number;
}

/**
 * Represents a single date cell structure on the calendar grid.
 */
export interface CalendarDay {
    /** Belongs to previous month, current month, or next month */
    type: 'prev' | 'current' | 'next';
    /** Day number of the month (1-31) */
    day: number;
    /** Month index (0-11) */
    month: number;
    /** Year (e.g., 2026) */
    year: number;
    /** Whether the date cell is disabled */
    disabled: boolean;
    /** Custom badge or festival marker label */
    mark: string;
    /** Holiday badge ('休' for holiday, '班' for workday) */
    holiday?: '休' | '班';
    /** Custom injected HTML content */
    customContent?: string;
}

/** Supported international language codes */
export type SupportedLang = 'cn' | 'en' | 'tw' | 'ja' | 'ko' | 'es' | 'de' | 'fr';

/**
 * NgLaydate configuration options interface.
 */
export interface LaydateConfig {
    /** Target element reference or selector string */
    elem?: any;
    /** Custom unique ID for the picker instance */
    id?: string;
    /** Picker selection type ('year' | 'month' | 'date' | 'time' | 'datetime'), defaults to 'date' */
    type?: 'year' | 'month' | 'date' | 'time' | 'datetime';
    /** Enable range selection. Can be true (default separator '-') or custom separator string (e.g., ' ~ ') */
    range?: boolean | string;
    /** Whether to link left and right panel months continuously, defaults to false */
    rangeLinked?: boolean;
    /** Date output formatting template (e.g., 'yyyy-MM-dd HH:mm:ss') */
    format?: string;
    /** Initial value as formatted string or Date object */
    value?: string | Date;
    /** Whether to automatically populate initial value into the input element, defaults to true */
    isInitValue?: boolean;
    /** Minimum selectable date as string, Date, or relative day offset (e.g., -7) */
    min?: string | Date | number;
    /** Maximum selectable date as string, Date, or relative day offset (e.g., 7) */
    max?: string | Date | number;
    /** Event type that triggers the picker panel (e.g., 'click', 'focus') */
    trigger?: string;
    /** Dark mode toggle: true, false, 'system'/'auto' (follow OS dark mode), or dynamic reactive getter function */
    darkMode?: boolean | number | 'system' | 'auto' | (() => boolean | number | 'system' | 'auto');
    /** Whether to display the picker panel immediately after initialization */
    show?: boolean;
    /** Positioning strategy ('absolute' | 'fixed' | 'static') */
    position?: 'absolute' | 'fixed' | 'static';
    /** CSS z-index for the picker panel overlay */
    zIndex?: number;
    /** Whether to display the bottom footer bar, defaults to true */
    showBottom?: boolean;
    /** List and order of footer buttons to display, defaults to ['clear', 'now', 'confirm'] */
    btns?: string[];
    /** Language configuration. Supports reactive getter function and automatic browser locale detection */
    lang?: SupportedLang | (() => SupportedLang);
    /** Visual theme name ('default', 'molv', 'grid', 'circle', 'fullpanel', 'dark') or Hex color (e.g., '#16b777' or ['grid', '#9C27B0']) */
    theme?: string | string[];
    /** Whether to show solar terms and festivals on the calendar grid */
    calendar?: boolean;
    /** Custom date markers map (e.g., {'0-0-15': 'Mid'}) or marker generator function */
    mark?: Record<string, string> | ((ymd: { year: number; month: number; date: number }, render: (input: string | Record<string, string>) => string) => string | void);
    /** Simple shorthand key-value pairs (e.g., {'yesterday': '2024-01-01'}) */
    shorthand?: Record<string, string>;
    /** Holiday and workday date badges [[holidays], [workdays]] */
    holidays?: [string[], string[]];
    /** Background overlay configuration, supports boolean or opacity number (0.5) */
    shade?: boolean | number;
    /** Advanced shortcut buttons for quick date ranges and presets */
    shortcuts?: { text: string; value: any | (() => any) }[];
    /** Automatically confirm and close panel upon selection (single mode only), defaults to true */
    autoConfirm?: boolean;
    /** Whether to display live selection preview text in the footer bar */
    isPreview?: boolean;
    /** Start day of the week (0-6, 0 for Sunday, 1 for Monday), defaults to 0 */
    weekStart?: number;
    /** Callback function to disable specific dates. Returns true to disable */
    disabledDate?: (date: Date, type?: string) => boolean;
    /** Callback function to disable specific hours, minutes, or seconds */
    disabledTime?: (date: Date, type?: string) => { hours?: () => number[]; minutes?: (h: number) => number[]; seconds?: (h: number, m: number) => number[] };
    /** Custom renderer for date cell HTML content */
    cellRender?: (ymd: { year: number; month: number; date: number }, render: (content: string) => void, info: { type: string }) => void;
    /** Display formatter for input box text only without affecting model value */
    formatToDisplay?: (value: string) => string;

    // Callbacks
    /** Triggered when the picker panel completes rendering */
    ready?: (date: DateObject) => void;
    /** Triggered whenever selection value changes */
    change?: (value: string, date: DateObject, endDate?: DateObject) => void;
    /** Triggered when selection is confirmed or completed */
    done?: (value: string, date: DateObject, endDate?: DateObject) => void;
    /** Triggered when the picker panel is closed */
    close?: () => void;
    /** Triggered when the "Confirm" button is clicked */
    onConfirm?: (value: string, date: DateObject, endDate?: DateObject) => void;
    /** Triggered when the "Now" button is clicked */
    onNow?: (value: string, date: DateObject, endDate?: DateObject) => void;
    /** Triggered when the "Clear" button is clicked */
    onClear?: (value: string, date: DateObject, endDate?: DateObject) => void;
}
