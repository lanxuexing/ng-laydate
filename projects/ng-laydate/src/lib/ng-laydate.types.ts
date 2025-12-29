export interface DateObject {
    year: number;
    month: number;
    date: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export interface CalendarDay {
    type: 'prev' | 'current' | 'next';
    day: number;
    month: number;
    year: number;
    disabled: boolean;
    mark: string;
    holiday?: '休' | '班'; // Holiday marker
    customContent?: string;
}

export interface LaydateConfig {
    elem?: any; // Selector or element
    id?: string; // Custom ID for hint/api
    type?: 'year' | 'month' | 'date' | 'time' | 'datetime';
    range?: boolean | string; // true or separator '-'
    rangeLinked?: boolean; // If true, left and right panels are linked (always consecutive months)
    format?: string;
    value?: string | Date;
    isInitValue?: boolean;
    min?: string | Date | number; // '1900-1-1' or -7 (7 days ago)
    max?: string | Date | number; // '2099-12-31' or 7 (7 days later)
    trigger?: string; // 'click'
    darkMode?: boolean | number; // Dark mode switch
    show?: boolean;
    position?: 'absolute' | 'fixed' | 'static';
    zIndex?: number;
    showBottom?: boolean;
    btns?: string[]; // ['clear', 'now', 'confirm']
    lang?: 'cn' | 'en';
    theme?: string | string[]; // 'default', 'molv', 'grid', 'fullpanel', '#color', or ['grid', '#color']
    calendar?: boolean;
    mark?: Record<string, string> | ((ymd: { year: number; month: number; date: number }, render: (input: string | Record<string, string>) => string) => string | void);
    shorthand?: Record<string, string>; // shortcuts (e.g., {'yesterday': '2024-01-01'})
    holidays?: [string[], string[]]; // [[holidays], [workdays]] e.g. [['2023-1-1','2023-1-2'],['2023-1-28']]
    shade?: boolean | number; // true or opacity (0.5 default)
    shortcuts?: { text: string; value: any | (() => any) }[];
    autoConfirm?: boolean; // Default true
    isPreview?: boolean; // Default true, false for datetime
    weekStart?: number; // 0-6, default 0
    disabledDate?: (date: Date, type?: string) => boolean;
    disabledTime?: (date: Date, type?: string) => { hours?: () => number[]; minutes?: (h: number) => number[]; seconds?: (h: number, m: number) => number[] };
    cellRender?: (ymd: { year: number; month: number; date: number }, render: (content: string) => void, info: { type: string }) => void;
    formatToDisplay?: (value: string) => string;

    // Callbacks
    // Callbacks
    ready?: (date: DateObject) => void;
    change?: (value: string, date: DateObject, endDate?: DateObject) => void;
    done?: (value: string, date: DateObject, endDate?: DateObject) => void;
    close?: () => void;
    onConfirm?: (value: string, date: DateObject, endDate?: DateObject) => void;
    onNow?: (value: string, date: DateObject, endDate?: DateObject) => void;
    onClear?: (value: string, date: DateObject, endDate?: DateObject) => void;
}
