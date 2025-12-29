import { Directive, ElementRef, ComponentRef, OnDestroy, inject, input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgLaydateComponent } from './ng-laydate.component';
import { LaydateConfig } from './ng-laydate.types';
import { NgLaydateService } from './ng-laydate.service';

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
    // Input alias 'laydate'
    configInput = input<LaydateConfig | '' | undefined | null>('', { alias: 'laydate' });

    // Outputs corresponding to Laydate callbacks
    @Output() change = new EventEmitter<string>();
    @Output() ready = new EventEmitter<any>();
    @Output() done = new EventEmitter<any>();
    @Output() onConfirm = new EventEmitter<any>();
    @Output() onNow = new EventEmitter<any>();
    @Output() onClear = new EventEmitter<any>();
    @Output() closeEvent = new EventEmitter<void>();

    private componentRef: ComponentRef<NgLaydateComponent> | null = null;
    private el = inject(ElementRef);
    private laydateService = inject(NgLaydateService);

    // Form Control Callbacks
    private onChange = (_: any) => { };
    private onTouched = () => { };
    private _value: any = '';

    // ControlValueAccessor Interface
    writeValue(obj: any): void {
        this._value = obj || '';
        let displayValue = this._value;
        const config = this.configInput();
        if (typeof config === 'object' && config?.formatToDisplay) {
            displayValue = config.formatToDisplay(this._value);
        }
        this.el.nativeElement.value = displayValue;
        if (this.componentRef) {
            // If panel is open, we might need to update it? 
            // Usually panel reads from config or element on init.
            // Ideally we pass value to component instance if possible.
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.el.nativeElement.disabled = isDisabled;
    }

    onInput(event: Event) {
        const val = (event.target as HTMLInputElement).value;
        this._value = val;
        this.onChange(val);
    }

    open() {
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

        // Other output proxies...
        const origReady = config.ready;
        config.ready = (date) => {
            this.ready.emit(date);
            if (origReady) origReady(date);
        };

        const origChange = config.change;
        config.change = (value, date, end) => {
            // Note: change event in laydate might trigger on every selection (if not range/datetime?)
            // Usually 'done' is the final commit. 
            // If user wants real-time updates:
            // this.onChange(value); 
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
            // Clear value
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
