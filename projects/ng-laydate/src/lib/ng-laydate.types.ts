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
    /** 节假日或加班标记 ('休' | '班') */
    holiday?: '休' | '班';
    /** 单元格自定义 HTML 内容 */
    customContent?: string;
}

/** 支持的国际化语言标识 */
export type SupportedLang = 'cn' | 'en' | 'tw' | 'ja' | 'ko' | 'es' | 'de' | 'fr';

/**
 * NgLaydate 配置参数接口
 */
export interface LaydateConfig {
    /** 绑定目标的选择器或 DOM 元素 */
    elem?: any;
    /** 选择器实例的自定义 ID */
    id?: string;
    /** 选择器类型 ('year' | 'month' | 'date' | 'time' | 'datetime')，默认 'date' */
    type?: 'year' | 'month' | 'date' | 'time' | 'datetime';
    /** 开启范围选择。指定 true（默认分隔符 '-'）或自定义分隔符字符串（如 ' ~ '） */
    range?: boolean | string;
    /** 是否开启左右面板月份连续联动，默认 false */
    rangeLinked?: boolean;
    /** 日期输出格式（如 'yyyy-MM-dd HH:mm:ss'） */
    format?: string;
    /** 初始值，支持符合格式的字符串或 Date 对象 */
    value?: string | Date;
    /** 是否自动向输入框填充初始值，默认 true */
    isInitValue?: boolean;
    /** 最小可选日期，支持格式字符串、Date 对象或相对天数偏移 (如 -7) */
    min?: string | Date | number;
    /** 最大可选日期，支持格式字符串、Date 对象或相对天数偏移 (如 7) */
    max?: string | Date | number;
    /** 呼出选择器的事件类型（如 'click', 'focus'） */
    trigger?: string;
    /** 暗黑模式开关。支持 true, false, 'system'/'auto'（自动感知 OS 深色主题），或动态 Getter 函数 */
    darkMode?: boolean | number | 'system' | 'auto' | (() => boolean | number | 'system' | 'auto');
    /** 是否在初始化完成后立即显示选择器面板 */
    show?: boolean;
    /** 组件定位策略 ('absolute' | 'fixed' | 'static') */
    position?: 'absolute' | 'fixed' | 'static';
    /** 选择器面板的 CSS z-index 值 */
    zIndex?: number;
    /** 是否显示底部操作栏，默认 true */
    showBottom?: boolean;
    /** 底部工具按钮组及其显示顺序，默认 ['clear', 'now', 'confirm'] */
    btns?: string[];
    /** 国际化语言设定，支持传入动态 Reactive Getter 函数及浏览器语言自动感知 */
    lang?: SupportedLang | (() => SupportedLang);
    /** 主题风格（'default', 'molv', 'grid', 'circle', 'fullpanel', 'dark'）或十六进制主色调（如 '#16b777' / ['grid', '#9C27B0']） */
    theme?: string | string[];
    /** 是否显示公历节日（如：清明、情人节等） */
    calendar?: boolean;
    /** 标注特定日期及其文本（如 {'0-0-15': '月中'}）或函数 */
    mark?: Record<string, string> | ((ymd: { year: number; month: number; date: number }, render: (input: string | Record<string, string>) => string) => string | void);
    /** 简单快捷键键值对 (如 {'yesterday': '2024-01-01'}) */
    shorthand?: Record<string, string>;
    /** 节假日与加班标记配置 [[节假日数组], [加班日数组]] */
    holidays?: [string[], string[]];
    /** 遮罩层配置，支持指定遮罩透明度数值或 true/false */
    shade?: boolean | number;
    /** 高级快捷选项组配置，支持侧边栏/页脚联动 */
    shortcuts?: { text: string; value: any | (() => any) }[];
    /** 单选模式下选择完成后是否自动确认并关闭面板，默认 true */
    autoConfirm?: boolean;
    /** 是否在底部栏显示实时选择结果的预览文本 */
    isPreview?: boolean;
    /** 星期起始日（0-6，0 代表周日，1 代表周一），默认 0 */
    weekStart?: number;
    /** 禁用特定日期的回调函数，返回 true 表示禁用该日期 */
    disabledDate?: (date: Date, type?: string) => boolean;
    /** 禁用特定时分秒的回调函数 */
    disabledTime?: (date: Date, type?: string) => { hours?: () => number[]; minutes?: (h: number) => number[]; seconds?: (h: number, m: number) => number[] };
    /** 单元格自定义 HTML 渲染回调函数 */
    cellRender?: (ymd: { year: number; month: number; date: number }, render: (content: string) => void, info: { type: string }) => void;
    /** 仅用于输入框展示文本的格式化回调函数，不影响实际控件绑定值 */
    formatToDisplay?: (value: string) => string;

    // 回调事件
    /** 控件渲染完成时触发 */
    ready?: (date: DateObject) => void;
    /** 值改变时触发 */
    change?: (value: string, date: DateObject, endDate?: DateObject) => void;
    /** 点击确认或完成选择时触发 */
    done?: (value: string, date: DateObject, endDate?: DateObject) => void;
    /** 选择器面板关闭时触发 */
    close?: () => void;
    /** 点击确认按钮时触发 */
    onConfirm?: (value: string, date: DateObject, endDate?: DateObject) => void;
    /** 点击“现在”按钮时触发 */
    onNow?: (value: string, date: DateObject, endDate?: DateObject) => void;
    /** 点击“清空”按钮时触发 */
    onClear?: (value: string, date: DateObject, endDate?: DateObject) => void;
}
