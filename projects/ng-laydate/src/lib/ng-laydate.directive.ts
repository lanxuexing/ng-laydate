import { Directive, ElementRef, ComponentRef, OnDestroy, inject, input, Output, EventEmitter, forwardRef, effect } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgLaydateComponent } from './ng-laydate.component';
import { LaydateConfig } from './ng-laydate.types';
import { NgLaydateService } from './ng-laydate.service';

/**
 * NgLaydate Directive
 *
 * Attaches an elegant date/time picker to any HTML input element with Angular Forms integration.
 *
 * @example
 * ```html
 * <!-- Basic Usage -->
 * <input type="text" laydate placeholder="Select Date">
 *
 * <!-- Custom Configuration & System Dark Mode -->
 * <input type="text" [laydate]="{ type: 'datetime', range: true, darkMode: 'system' }">
 *
 * <!-- Two-Way Form Binding -->
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
     * Laydate configuration input signal (directive alias `laydate`).
     */
    configInput = input<LaydateConfig | '' | undefined | null>('', { alias: 'laydate' });

    /** Emitted whenever a new value is selected */
    @Output() change = new EventEmitter<string>();
    /** Emitted when the picker panel completes rendering */
    @Output() ready = new EventEmitter<any>();
    /** Emitted when selection is confirmed or completed */
    @Output() done = new EventEmitter<any>();
    /** Emitted when the "Confirm" button is clicked */
    @Output() onConfirm = new EventEmitter<any>();
    /** Emitted when the "Now" button is clicked */
    @Output() onNow = new EventEmitter<any>();
    /** Emitted when the "Clear" button is clicked */
    @Output() onClear = new EventEmitter<any>();
    /** Emitted when the picker panel is closed */
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
     * ControlValueAccessor interface: writes initial or updated value to the element.
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
     * ControlValueAccessor interface: registers onChange callback.
     */
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    /**
     * ControlValueAccessor interface: registers onTouched callback.
     */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * ControlValueAccessor interface: sets disabled state.
     */
    setDisabledState?(isDisabled: boolean): void {
        this.el.nativeElement.disabled = isDisabled;
    }

    /**
     * Native input event handler for manual typing.
     */
    onInput(event: Event) {
        const val = (event.target as HTMLInputElement).value;
        this._value = val;
        this.onChange(val);
    }

    /**
     * Programmatically opens the date/time picker panel.
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
     * Programmatically closes the date/time picker panel.
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
