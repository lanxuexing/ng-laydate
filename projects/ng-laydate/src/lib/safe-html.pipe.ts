import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'safeHtml',
    standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(value: string | SafeHtml | null | undefined): SafeHtml {
        if (!value) return '';
        if (typeof value === 'object') return value;
        return this.sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
    }
}
