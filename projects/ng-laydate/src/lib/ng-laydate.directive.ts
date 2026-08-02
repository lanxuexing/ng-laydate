import { Directive, ElementRef, ComponentRef, OnDestroy, inject, input, Output, EventEmitter, forwardRef, effect } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgLaydateComponent } from './ng-laydate.component';
import { LaydateConfig } from './ng-laydate.types';
import { NgLaydateService } from './ng-laydate.service';

/**
 * NgLaydate 指令
 * 
 * 可在任意 input 元素上快捷绑定日期时间选择器，支持模板驱动与响应式表单。
 *
 * @example
 * ```html
 * <!-- 基础日期选择 -->
 * <input type="text" laydate placeholder="请选择日期">
 *
 * <!-- 深度配置与跟随系统暗黑模式 -->
 * <input type="text" [laydate]="{ type: 'datetime', range: true, darkMode: 'system' }">
 *
 * <!-- 双向表单绑定 -->
 * <input type="text" laydate [(ngModel)]="dateValue">
 * ```
 */
@Directive({
    selector: '[laydate]',
    standalone: true,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => NgLaydateDirective),
        multi: true
    }],
    host: {
        '(click)': 'open()',
        '(focus)': 'open()',
        '(input)': 'onInput($event)'
    }
})
export class NgLaydateDirective implements OnDestroy, ControlValueAccessor {
    /**
     * Laydate 配置参数输入信号 (指令别名 `laydate`)
     */
    configInput = input<LaydateConfig | '' | undefined | null>('', { alias: 'laydate' });

    /** 选择器值改变时触发的回调事件 */
    @Output() change = new EventEmitter<string>();
    /** 选择器面板渲染完成时触发的回调事件 */
    @Output() ready = new EventEmitter<any>();
    /** 点击确认或完成选择时触发的回调事件 */
    @Output() done = new EventEmitter<any>();
    /** 点击“确定”按钮时触发的回调事件 */
    @Output() onConfirm = new EventEmitter<any>();
    /** 点击“现在”按钮时触发的回调事件 */
    @Output() onNow = new EventEmitter<any>();
    /** 点击“清空”按钮时触发的回调事件 */
    @Output() onClear = new EventEmitter<any>();
    /** 选择器面板关闭时触发的回调事件 */
    @Output() closeEvent = new EventEmitter<void>();

    private componentRef: ComponentRef<NgLaydateComponent> | null = null;
    private el = inject(ElementRef);
    private laydateService = inject(NgLaydateService);

    // Form Control Callbacks
    private onChange = (_: any) => { };
    private onTouched = () => { };
    private _value: any = '';

    constructor() {
        effect(() => {
            const rawConfig = this.configInput();
            const config: LaydateConfig = (typeof rawConfig === 'object' && rawConfig) ? { ...rawConfig } : {};
            if (!config.elem && this.el?.nativeElement) {
                config.elem = this.el.nativeElement;
            }
            if (config.elem) {
                this.laydateService.updateConfig(config.elem, config);
            }
        });
    }

    /**
     * ControlValueAccessor 接口实现：写入表单初始值
     */
    writeValue(obj: any): void {
        this._value = obj || '';
        let displayValue = this._value;
        const config = this.configInput();
        if (typeof config === 'object' && config?.formatToDisplay) {
            displayValue = config.formatToDisplay(this._value);
        }
        this.el.nativeElement.value = displayValue;
    }

    /**
     * ControlValueAccessor 接口实现：注册值变动回调
     */
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    /**
     * ControlValueAccessor 接口实现：注册 Touch 状态回调
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * ControlValueAccessor 接口实现：设置表单禁用状态
     */
    setDisabledState?(isDisabled: boolean): void {
        this.el.nativeElement.disabled = isDisabled;
    }

    /**
     * 原生 input 事件句柄
     */
    onInput(event: Event) {
        const val = (event.target as HTMLInputElement).value;
        this._value = val;
        this.onChange(val);
    }

    /**
     * 手动呼出并打开日期时间选择器面板
     */
    open() {
        if (this.el.nativeElement) {
            this.el.nativeElement.setAttribute('autocomplete', 'off');
        }

        if (this.componentRef) {
            return;
        }

        const rawConfig = this.configInput();
        const config: LaydateConfig = (typeof rawConfig === 'object' && rawConfig) ? { ...rawConfig } : {};

        // Ensure host element is set
        if (!config.elem) {
            config.elem = this.el.nativeElement;
        }

        // Use current model value if available
        if (!config.value && this._value) {
            config.value = this._value;
        } else if (!config.value && this.el.nativeElement.value) {
            config.value = this.el.nativeElement.value;
        }

        // Hook into callbacks to propogate changes
        const origDone = config.done;
        config.done = (value, date, end) => {
            this._value = value;
            this.onChange(value); // Propagate to Angular Form
            this.onTouched();

            this.done.emit({ value, date, endDate: end });
            if (origDone) origDone(value, date, end);
        };

        const origReady = config.ready;
        config.ready = (date) => {
            this.ready.emit(date);
            if (origReady) origReady(date);
        };

        const origChange = config.change;
        config.change = (value, date, end) => {
            this.change.emit(value);
            if (origChange) origChange(value, date, end);
        };

        const origConfirm = config.onConfirm;
        config.onConfirm = (value, date, end) => {
            this.onConfirm.emit({ value, date, endDate: end });
            if (origConfirm) origConfirm(value, date, end);
        };

        const origNow = config.onNow;
        config.onNow = (value, date, end) => {
            this.onNow.emit({ value, date, endDate: end });
            if (origNow) origNow(value, date, end);
        };

        const origClear = config.onClear;
        config.onClear = (value, date, end) => {
            this._value = '';
            this.onChange('');

            this.onClear.emit({ value, date, endDate: end });
            if (origClear) origClear(value, date, end);
        };

        const origClose = config.close;
        config.close = () => {
            this.onTouched();
            this.closeEvent.emit();
            if (origClose) origClose();
        };

        this.componentRef = this.laydateService.render(config);

        if (this.componentRef) {
            this.componentRef.onDestroy(() => {
                this.componentRef = null;
            });
        }
    }

    /**
     * 手动关闭日期时间选择器面板
     */
    close() {
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = null;
        }
    }

    ngOnDestroy() {
        this.close();
    }
}
