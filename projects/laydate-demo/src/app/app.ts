import { Component, AfterViewInit, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgLaydateDirective, NgLaydateComponent, NgLaydateService, SupportedLang } from 'ng-laydate';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';

export type ThemeMode = 'system' | 'light' | 'dark';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgLaydateDirective, NgLaydateComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.component.scss'
})
export class App implements AfterViewInit {
  title = 'ng-laydate';
  private laydate = inject(NgLaydateService);
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  // Theme mode state ('system' | 'light' | 'dark')
  themeMode = signal<ThemeMode>('system');

  // Computed signal for demo pickers: follows site theme mode ('dark' -> true, 'light' -> false, 'system' -> 'system')
  demoDarkMode = computed<boolean | 'system'>(() => {
    const mode = this.themeMode();
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return 'system';
  });

  setThemeMode(mode: ThemeMode) {
    this.themeMode.set(mode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('ng-laydate-theme', mode);
      this.applyTheme(mode);
    }
  }

  private applyTheme(mode: ThemeMode) {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement;

    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', systemDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', mode);
    }
  }

  private initTheme() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('ng-laydate-theme') as ThemeMode;
    const initialMode: ThemeMode = (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'system';
    this.themeMode.set(initialMode);
    this.applyTheme(initialMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.themeMode() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  private detectInitialLang(): SupportedLang {
    if (isPlatformBrowser(this.platformId)) {
      const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
      if (browserLang.startsWith('zh-tw') || browserLang.startsWith('zh-hk')) return 'tw';
      if (browserLang.startsWith('zh')) return 'cn';
      if (browserLang.startsWith('ja')) return 'ja';
      if (browserLang.startsWith('ko')) return 'ko';
      if (browserLang.startsWith('es')) return 'es';
      if (browserLang.startsWith('de')) return 'de';
      if (browserLang.startsWith('fr')) return 'fr';
      return 'en';
    }
    return 'cn';
  }

  // Language state initialized by browser language
  currentLang = signal<SupportedLang>(this.detectInitialLang());

  setLang(lang: SupportedLang) {
    this.currentLang.set(lang);
  }

  // Code toggle, tab & copy state
  showCode = signal<Record<string, boolean>>({});
  copiedState = signal<Record<string, boolean>>({});
  activeTab = signal<Record<string, 'html' | 'ts'>>({});

  toggleCode(secId: string) {
    this.showCode.update(state => ({ ...state, [secId]: !state[secId] }));
  }

  setTab(secId: string, tab: 'html' | 'ts') {
    this.activeTab.update(state => ({ ...state, [secId]: tab }));
  }

  getTab(secId: string): 'html' | 'ts' {
    return this.activeTab()[secId] || 'html';
  }

  async copyCode(secId: string, codeText: string) {
    if (isPlatformBrowser(this.platformId) && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(codeText);
        this.copiedState.update(state => ({ ...state, [secId]: true }));
        setTimeout(() => {
          this.copiedState.update(state => ({ ...state, [secId]: false }));
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code', err);
      }
    }
  }

  // Professional Prism.js Code Syntax Highlighter
  getHighlightedCode(code: string, lang: string = 'markup'): SafeHtml {
    if (!code) return '';
    try {
      const grammar = (lang === 'typescript' || lang === 'ts')
        ? (Prism.languages['typescript'] || Prism.languages['javascript'])
        : Prism.languages['markup'];
      const highlighted = Prism.highlight(code, grammar, lang);
      return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    } catch {
      return this.sanitizer.bypassSecurityTrustHtml(code);
    }
  }

  // Reactive translation dictionary
  t = computed(() => {
    const lang = this.currentLang();
    const isEn = lang === 'en';
    const isZh = lang === 'cn' || lang === 'tw';

    const actionText = {
      cn: { viewCode: '查看代码', hideCode: '收起代码', copyCode: '复制代码', copied: '已复制!' },
      en: { viewCode: 'View Code', hideCode: 'Hide Code', copyCode: 'Copy Code', copied: 'Copied!' },
      tw: { viewCode: '查看程式碼', hideCode: '收起程式碼', copyCode: '複製程式碼', copied: '已複製!' },
      ja: { viewCode: 'コードを表示', hideCode: 'コード非表示', copyCode: 'コードをコピー', copied: 'コピー完了!' },
      ko: { viewCode: '코드 보기', hideCode: '코드 숨기기', copyCode: '코드 복사', copied: '복사됨!' },
      es: { viewCode: 'Ver Código', hideCode: 'Ocultar Código', copyCode: 'Copiar Código', copied: '¡Copiado!' },
      de: { viewCode: 'Code Anzeigen', hideCode: 'Code Ausblenden', copyCode: 'Code Kopieren', copied: 'Kopiert!' },
      fr: { viewCode: 'Voir le Code', hideCode: 'Masquer le Code', copyCode: 'Copier le Code', copied: 'Copié!' }
    }[lang] || { viewCode: 'View Code', hideCode: 'Hide Code', copyCode: 'Copy Code', copied: 'Copied!' };

    if (lang === 'en') {
      return {
        subtitle: 'Minimalist · Powerful · Elegant Date & Time Picker for Angular 17+',
        sec1Title: '1. The Essentials',
        sec1_1: 'Standard Date',
        sec1_2: 'Molv Theme',
        sec1_3: 'DateTime Mode',
        sec1_4: 'English Version',

        sec2Title: '2. Selection Range',
        sec2_1: 'Date Range (-)',
        sec2_2: 'DateTime Range',
        sec2_3: 'Month Range (~)',
        sec2_4: 'Linked Panels',
        sec2_5: 'Manual Confirm',

        sec3Title: '3. Constraints & Logic',
        sec3_1: 'Date Range (2016-2080)',
        sec3_2: 'Relative (-7 to +7 days)',
        sec3_3: 'Time (09:30 - 17:30)',
        sec3_4: 'Custom Disabling',
        sec3_5: 'Disable Future',
        sec3_6: 'Complex Time Rules',

        sec4Title: '4. Aesthetics & Themes',
        sec4_1: 'FullPanel (Side-by-Side)',
        sec4_2: 'Dark Theme',
        sec4_3: 'Dark + Custom Color',
        sec4_4: 'Grid + Purple',
        sec4_5: 'Circle + Blue',
        sec4_6: 'Preview Hidden',

        sec5Title: '5. Smart Features',
        sec5_1: 'Custom Mark Function',
        sec5_2: 'Cell Render (8th Circle)',
        sec5_3: 'Built-in Festivals',
        sec5_4: 'Holidays / Workdays',
        sec5_5: 'Shade Overlay',
        sec5_6: 'Programmatic Hint',

        sec6Title: '6. Shortcuts Gallery',
        sec6Desc: 'Explore various shortcut presets with responsive auto-wrapping layout.',
        sec6_1: 'Preset Dates',
        sec6_2: 'Year Select',
        sec6_3: 'Time Intervals',
        sec6_4: 'Advanced Mixed',
        sec6_5: 'Range Presets',
        sec6_6: 'DateTime Suite',

        sec7Title: '7. Integration & Developer API',
        sec7_1: 'Reactive Form',
        sec7_2: 'Template-driven',
        sec7_3: 'Custom Display Filter',
        sec7_4: 'Service-base Render',

        sec8Title: '8. Static Gallery (Inline Panels)',
        sec8_1: 'Default Panel',
        sec8_2: 'FullPanel Mode',
        sec8_3: 'Grid Theme',
        sec8_4: 'Year Range',
        sec8_5: 'Time Range',
        sec8_6: 'Custom Annotations',

        hintBtn: 'Show Hint',
        hintText: 'This is a hint! <br> 3 seconds to close',
        starGithub: 'Star on GitHub',
        ...actionText
      };
    }
    return {
      subtitle: '极简 · 强大 · 高颜值的 Angular 日期时间选择器',
      sec1Title: '1. The Essentials (核心基础)',
      sec1_1: 'Standard Date (标准日期)',
      sec1_2: 'Molv Theme (墨绿主题)',
      sec1_3: 'DateTime Mode (日期时间)',
      sec1_4: 'English Version (英文语言)',

      sec2Title: '2. Selection Range (选择范围)',
      sec2_1: 'Date Range (日期范围)',
      sec2_2: 'DateTime Range (时间范围)',
      sec2_3: 'Month Range (月份范围)',
      sec2_4: 'Linked Panels (双板联动)',
      sec2_5: 'Manual Confirm (手动确认)',

      sec3Title: '3. Constraints & Logic (约束与逻辑)',
      sec3_1: 'Date Range (指定限定 2016-2080)',
      sec3_2: 'Relative (前后7天限定)',
      sec3_3: 'Time (时间限定 09:30-17:30)',
      sec3_4: 'Custom Disabling (自定义禁用)',
      sec3_5: 'Disable Future (禁用未来日期)',
      sec3_6: 'Complex Time Rules (复杂时分秒约束)',

      sec4Title: '4. Aesthetics & Themes (视觉与主题)',
      sec4_1: 'FullPanel (左右双面板)',
      sec4_2: 'Dark Theme (深色模式)',
      sec4_3: 'Dark + Custom Color (深色定制主题)',
      sec4_4: 'Grid + Purple (网格紫色主题)',
      sec4_5: 'Circle + Blue (圆角蓝色主题)',
      sec4_6: 'Preview Hidden (隐藏预览栏)',

      sec5Title: '5. Smart Features (智慧特性)',
      sec5_1: 'Custom Mark Function (动态标注)',
      sec5_2: 'Cell Render (自定义单元格渲染)',
      sec5_3: 'Built-in Festivals (公历节日显示)',
      sec5_4: 'Holidays / Workdays (节假日与补班标注)',
      sec5_5: 'Shade Overlay (遮罩层 0.8)',
      sec5_6: 'Programmatic Hint (服务式弹出 Hint)',

      sec6Title: '6. Shortcuts Gallery (快捷键展示区)',
      sec6Desc: '预设快捷键展示区，根据屏幕尺寸自适应自动换行。',
      sec6_1: 'Preset Dates (常用日期快捷)',
      sec6_2: 'Year Select (年份快捷)',
      sec6_3: 'Time Intervals (30分钟间隔)',
      sec6_4: 'Advanced Mixed (混合类型快捷)',
      sec6_5: 'Range Presets (范围快捷)',
      sec6_6: 'DateTime Suite (完整日期时间快捷)',

      sec7Title: '7. Integration & Developer API (集成与开发)',
      sec7_1: 'Reactive Form (响应式表单)',
      sec7_2: 'Template-driven (双向绑定)',
      sec7_3: 'Custom Display Filter (显示过滤器)',
      sec7_4: 'Service-base Render (服务式挂载)',

      sec8Title: '8. Static Gallery (内嵌/静态面板展示)',
      sec8_1: 'Default Panel (默认静态面板)',
      sec8_2: 'FullPanel Mode (静态全面板)',
      sec8_3: 'Grid Theme (静态网格主题)',
      sec8_4: 'Year Range (静态年份范围)',
      sec8_5: 'Time Range (静态时间范围)',
      sec8_6: 'Custom Annotations (静态自定义标注)',

      hintBtn: '弹出 Hint',
      hintText: '这是一个 Hint 提示框！<br>3秒后自动关闭',
      starGithub: 'Star on GitHub',
      ...actionText
    };
  });

  // Section 1 Snippets
  sec1CodeHtml = `<!-- Standard Date Picker -->
<input [laydate]="{ lang: 'cn' }">

<!-- Theme: Molv (Ink Green) -->
<input [laydate]="{ value: '2023-10-01', theme: 'molv' }">

<!-- DateTime Mode (yyyy-MM-dd HH:mm:ss) -->
<input [laydate]="{ type: 'datetime', format: 'yyyy-MM-dd HH:mm:ss' }">

<!-- English i18n -->
<input [laydate]="{ lang: 'en' }">

<!-- Chinese Date Format (yyyy年MM月dd日) -->
<input [laydate]="{ format: 'yyyy年MM月dd日', value: '2025年10月01日' }">

<!-- Slash DateTime Format (yyyy/MM/dd HH:mm:ss) -->
<input [laydate]="{ type: 'datetime', format: 'yyyy/MM/dd HH:mm:ss' }">

<!-- Year-Month Format (yyyy-MM) -->
<input [laydate]="{ type: 'month', format: 'yyyy-MM' }">

<!-- Custom Display Formatter Function (formatToDisplay) -->
<input [laydate]="displayFormatConfig">`;

  sec1CodeTs = `import { Component } from '@angular/core';

@Component({...})
export class AppComponent {
  // Essentials & Format Configurations
  standardFormat = { format: 'yyyy-MM-dd' };
  molvTheme = { value: '2023-10-01', theme: 'molv' };
  dateTimeFormat = { type: 'datetime', format: 'yyyy-MM-dd HH:mm:ss' };
  englishLang = { lang: 'en' };

  cnFormat = { format: 'yyyy年MM月dd日' };
  slashDateTimeFormat = { type: 'datetime', format: 'yyyy/MM/dd HH:mm:ss' };
  yearMonthFormat = { type: 'month', format: 'yyyy-MM' };

  // Custom Display Formatter Callback (formatToDisplay)
  displayFormatConfig = {
    lang: 'cn',
    formatToDisplay: (value: string) => {
      if (!value) return '';
      const date = new Date(value);
      const weekday = date.toLocaleDateString('zh-CN', { weekday: 'long' });
      return \`\${value} (\${weekday})\`;
    }
  };
}`;

  // Section 2 Snippets
  sec2CodeHtml = `<!-- Date Range -->
<input [laydate]="{ range: true }">

<!-- DateTime Range -->
<input [laydate]="{ type: 'datetime', range: true }">

<!-- Custom Separator (~ Month Range) -->
<input [laydate]="{ type: 'month', range: '~', format: 'yyyy-MM' }">

<!-- Synchronized Linked Range Panels -->
<input [laydate]="{ range: true, rangeLinked: true }">

<!-- Manual Confirm Button Required -->
<input [laydate]="{ autoConfirm: false }">`;

  sec2CodeTs = `import { Component } from '@angular/core';
import { NgLaydateDirective } from 'ng-laydate';

@Component({
  imports: [NgLaydateDirective],
  template: \`<input [laydate]="{ range: true, rangeLinked: true }">\`
})
export class AppComponent {
  onDateChange(event: any) {
    console.log('Selected Range:', event.target.value);
  }
}`;

  // Section 3 Snippets
  sec3CodeHtml = `<!-- Min/Max Boundary (2016-10-14 to 2080-10-14) -->
<input [laydate]="{ min: '2016-10-14', max: '2080-10-14' }">

<!-- Relative Days Boundary (-7 to +7 days) -->
<input [laydate]="{ min: -7, max: 7 }">

<!-- Restricted Time Range (09:30:00 to 17:30:00) -->
<input [laydate]="{ type: 'time', min: '09:30:00', max: '17:30:00' }">

<!-- Logic-Based Custom Disabling -->
<input [laydate]="{ disabledDate: disabledDateFn }">`;

  sec3CodeTs = `import { Component } from '@angular/core';

@Component({...})
export class AppComponent {
  // Logic-based date disabling (Disable weekends)
  disabledDateFn = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // true to disable
  };

  // Disable future dates
  disabledDateFuture = (date: Date) => {
    return date.getTime() > Date.now();
  };

  // Complex hierarchical time rules (Hours/Minutes/Seconds constraint)
  disabledTimeComplex = (type: 'hours' | 'minutes' | 'seconds', date: Date) => {
    if (type === 'hours') return [0, 1, 2, 3, 4, 5, 6, 22, 23]; // Disable early/late hours
    return [];
  };
}`;

  // Section 4 Snippets
  sec4CodeHtml = `<!-- Follow OS System Theme (Auto Dark/Light Mode) -->
<input [laydate]="{ darkMode: 'system' }">

<!-- FULLPANEL Side-by-Side Date & Time View -->
<input [laydate]="{ type: 'datetime', theme: 'fullpanel' }">

<!-- Explicit Dark Theme -->
<input [laydate]="{ darkMode: true }">

<!-- Custom Hex Accent Color + Dark Mode -->
<input [laydate]="{ darkMode: true, theme: '#FF5722' }">

<!-- Grid Style + Accent Color -->
<input [laydate]="{ theme: ['grid', '#9C27B0'] }">

<!-- Circle Style + Accent Color -->
<input [laydate]="{ theme: ['circle', '#2196F3'] }">`;

  sec4CodeTs = `import { Component } from '@angular/core';

@Component({...})
export class AppComponent {
  // Follow OS System Dark Theme automatically
  systemThemeConfig = {
    darkMode: 'system' // or 'auto'
  };

  // Explicit Dark Mode
  darkModeConfig = {
    type: 'datetime',
    theme: 'fullpanel',
    darkMode: true
  };
}`;

  // Section 5 Snippets
  sec5CodeHtml = `<!-- Dynamic Annotations / Marks -->
<input [laydate]="{ mark: markFunction }">

<!-- Custom Cell Render Callback -->
<input [laydate]="{ cellRender: cellRenderDemo }">

<!-- Gregorian Festivals & Holiday Markers -->
<input [laydate]="{ calendar: true, holidays: [['2025-1-1','2025-1-2'],['2025-1-4']] }">

<!-- Programmatic Service Hint -->
<button (click)="showHint(inputEl)">Show Hint</button>`;

  sec5CodeTs = `import { Component, inject } from '@angular/core';
import { NgLaydateService } from 'ng-laydate';

@Component({...})
export class AppComponent {
  private laydateService = inject(NgLaydateService);

  // Dynamic Annotations Mark Callback
  markFunction = (ymd: { year: number; month: number; date: number }, render: Function) => {
    if (ymd.month === 6 && ymd.date === 1) return render('Children');
    return render({ '0-10-14': 'Birthday', '0-0-15': 'Mid' });
  };

  // Custom Cell HTML Injector
  cellRenderDemo = (ymd: any, render: Function, info: any) => {
    if (info.type === 'date' && ymd.date === 8) {
      render(\`<span style="color:#16b777;font-weight:bold;border:1px solid #16b777;border-radius:50%;padding:2px 6px;">\${ymd.date}</span>\`);
    }
  };

  // Programmatic Hint Call
  showHint(targetEl: HTMLElement) {
    this.laydateService.hint(targetEl, 'Custom Hint Message! <br> Auto close in 3s');
  }
}`;

  // Section 6 Snippets
  sec6CodeHtml = `<!-- Preset Date Shortcuts -->
<input [laydate]="{ shortcuts: shortcutsDate }">

<!-- Year Select Shortcuts -->
<input [laydate]="{ type: 'year', shortcuts: shortcutsYear }">

<!-- 30-Minute Interval Steps Shortcuts -->
<input [laydate]="{ type: 'time', shortcuts: shortcutsTime }">`;

  sec6CodeTs = `import { Component } from '@angular/core';

@Component({...})
export class AppComponent {
  // Preset Date Shortcuts Definition
  shortcutsDate = [
    { text: 'Yesterday', value: () => new Date(Date.now() - 86400000) },
    { text: 'Today', value: () => new Date() },
    { text: 'Tomorrow', value: () => new Date(Date.now() + 86400000) },
    { text: 'Last 7 Days', value: () => [new Date(Date.now() - 7 * 86400000), new Date()] }
  ];

  // 30-Minute Step Shortcuts Definition
  shortcutsTime = Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return { text: \`\${h}:\${m}:00\`, value: \`\${h}:\${m}:00\` };
  });
}`;

  // Section 7 Snippets
  sec7CodeHtml = `<!-- Reactive Form Control -->
<form [formGroup]="myForm">
  <input formControlName="date" [laydate]="{ lang: 'cn' }">
</form>

<!-- Template-driven [(ngModel)] -->
<input [(ngModel)]="templateModel" [laydate]="{ lang: 'cn' }">

<!-- Custom Display Filter Config -->
<input [laydate]="displayFormatConfig">`;

  sec7CodeTs = `import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgLaydateDirective } from 'ng-laydate';

@Component({
  imports: [ReactiveFormsModule, NgLaydateDirective],
  templateUrl: './app.component.html'
})
export class AppComponent {
  // Reactive Form Integration
  myForm = new FormGroup({
    date: new FormControl('2024-05-20')
  });

  templateModel = '2024-06-01';

  // Custom Display Filter Config
  displayFormatConfig = {
    lang: 'cn',
    formatToDisplay: (value: string) => {
      if (!value) return '';
      const date = new Date(value);
      const weekday = date.toLocaleDateString('zh-CN', { weekday: 'long' });
      return \`\${value} (\${weekday})\`;
    }
  };
}`;

  // Section 8 Snippets
  sec8CodeHtml = `<!-- Default Static Inline Panel -->
<ng-laydate [config]="{ position: 'static', lang: 'cn' }"></ng-laydate>

<!-- Static Inline FullPanel Mode -->
<ng-laydate [config]="{ position: 'static', type: 'datetime', theme: 'fullpanel' }"></ng-laydate>

<!-- Static Inline Grid Theme -->
<ng-laydate [config]="{ position: 'static', theme: 'grid' }"></ng-laydate>`;

  sec8CodeTs = `import { Component } from '@angular/core';
import { NgLaydateComponent } from 'ng-laydate';

@Component({
  imports: [NgLaydateComponent],
  template: \`<ng-laydate [config]="{ position: 'static', type: 'datetime', theme: 'fullpanel' }"></ng-laydate>\`
})
export class AppComponent {}`;

  // Responsive Form
  myForm = new FormGroup({
    date: new FormControl('2024-05-01')
  });

  // Template-driven Form
  templateModel = '2024-05-02';

  ngAfterViewInit() {
    this.initTheme();
    // 14. Programmatic Render Demo
    this.laydate.render({
      elem: '#ID-laydate-type-datetime',
      type: 'datetime',
      lang: () => this.currentLang(),
      darkMode: () => this.demoDarkMode(),
      done: (value) => {
        console.log('Programmatic select:', value);
      }
    });
  }

  onDateChange(val: string) {
    console.log('Date selected:', val);
  }

  showHint() {
    this.laydate.hint('test-hint', {
      content: this.t().hintText,
      ms: 3000
    });
  }

  functionalShortcuts = [
    {
      text: '昨天',
      value: () => {
        const now = new Date();
        now.setDate(now.getDate() - 1);
        return now;
      }
    },
    {
      text: '今天',
      value: () => new Date()
    },
    {
      text: '明天',
      value: () => {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        return now;
      }
    },
    {
      text: '上个月',
      value: () => {
        const now = new Date();
        now.setMonth(now.getMonth() - 1);
        return now;
      }
    },
    {
      text: '下个月',
      value: () => {
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        return now;
      }
    },
    {
      text: '某一天',
      value: () => '2018-08-18'
    }
  ];

  advancedShortcuts = [
    { text: 'String (Yesterday)', value: 'yesterday' },
    { text: 'Date (Today)', value: new Date() },
    {
      text: 'Array (Last 5 Days)', value: [
        new Date(new Date().getTime() - 5 * 24 * 3600 * 1000),
        new Date()
      ]
    },
    {
      text: 'Function (Next Week)', value: () => {
        const now = new Date();
        const next = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
        return [now, next];
      }
    }
  ];

  disabledDate = (date: Date, type?: string) => {
    // Disable dates before 2024-02-01
    return date.getTime() < new Date(2024, 1, 1).getTime();
  };

  disabledDateFuture = (date: Date, type?: string) => {
    return date.getTime() > Date.now();
  };

  onLimitReady = () => {
    const isEn = this.currentLang() === 'en';
    const content = isEn
      ? 'Date range limit set to <br> 2016-10-14 - 2080-10-14'
      : '日期可选值设定在 <br> 2016-10-14 到 2080-10-14';
    this.laydate.hint('ins22', {
      content,
      ms: 3000
    });
  };

  disabledTimeComplex = (date: Date, type?: string): any => {
    return {
      hours: () => this.range(0, 10),
      minutes: (hour: number) => hour > 5 ? this.range(0, 20) : [],
      seconds: (hour: number, minute: number) => this.range(0, 2)
    };
  };

  isDisabledTimeDemo = (date: Date) => {
    // Disable time: 0-9 hours, min 0-19 if hour > 5, sec 0-1
    return {
      hours: () => this.range(0, 10),
      minutes: (hour: number) => hour > 5 ? this.range(0, 20) : [],
      seconds: (hour: number, minute: number) => this.range(0, 2)
    };
  };



  // 1. Basic Date Shortcuts
  get shortcutsDate() {
    const isEn = this.currentLang() === 'en';
    return [
      {
        text: isEn ? "Yesterday" : "昨天",
        value: function () {
          var now = new Date();
          now.setDate(now.getDate() - 1);
          return now;
        }
      },
      {
        text: isEn ? "Today" : "今天",
        value: function () {
          return Date.now();
        }
      },
      {
        text: isEn ? "Tomorrow" : "明天",
        value: function () {
          var now = new Date();
          now.setDate(now.getDate() + 1);
          return now;
        }
      },
      {
        text: isEn ? "Last Month" : "上个月",
        value: function () {
          var now = new Date();
          var month = now.getMonth() - 1;
          now.setMonth(month);
          if (now.getMonth() !== month) now.setDate(0);
          return [now];
        }
      },
      {
        text: isEn ? "Next Month" : "下个月",
        value: function () {
          var now = new Date();
          var month = now.getMonth() + 1;
          now.setMonth(month);
          if (now.getMonth() !== month) now.setDate(0);
          return [now];
        }
      },
      {
        text: isEn ? "A Day" : "某一天",
        value: "2016-10-14"
      }
    ];
  }

  // 2. Year Shortcuts
  get shortcutsYear() {
    const isEn = this.currentLang() === 'en';
    return [
      {
        text: isEn ? "Last Year" : "去年",
        value: function () {
          var now = new Date();
          now.setFullYear(now.getFullYear() - 1);
          return now;
        }
      },
      {
        text: isEn ? "Next Year" : "明年",
        value: function () {
          var now = new Date();
          now.setFullYear(now.getFullYear() + 1);
          return now;
        }
      }
    ];
  }

  // 3. Month Shortcuts
  get shortcutsMonth() {
    const isEn = this.currentLang() === 'en';
    return [
      {
        text: isEn ? "Last Month" : "上个月",
        value: function () {
          var now = new Date();
          now.setMonth(now.getMonth() - 1, 1);
          return now;
        }
      },
      {
        text: isEn ? "Next Month" : "下个月",
        value: function () {
          var now = new Date();
          now.setMonth(now.getMonth() + 1, 1);
          return now;
        }
      },
      {
        text: isEn ? "Same Month Last Year" : "去年本月",
        value: function () {
          var now = new Date();
          now.setFullYear(now.getFullYear() - 1);
          return now;
        }
      }
    ];
  }

  // 4. Time Shortcuts (Generated)
  shortcutsTime = (function () {
    var value = [];
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    for (var i = 0; i < 48; i++) {
      var nowTemp = new Date(now.getTime() + i * 30 * 60000);
      var h = nowTemp.getHours().toString().padStart(2, '0');
      var m = nowTemp.getMinutes().toString().padStart(2, '0');
      var s = nowTemp.getSeconds().toString().padStart(2, '0');
      var nowTimeStr = `${h}:${m}:${s}`;
      value.push({
        text: nowTimeStr,
        value: nowTimeStr
      });
    }
    return value;
  })();

  // 5. DateTime Shortcuts
  get shortcutsDateTime() {
    const isEn = this.currentLang() === 'en';
    return [
      {
        text: isEn ? "Yesterday" : "昨天",
        value: function () {
          var now = new Date();
          now.setDate(now.getDate() - 1);
          return now;
        }
      },
      {
        text: isEn ? "Today" : "今天",
        value: function () {
          return Date.now();
        }
      },
      {
        text: isEn ? "Tomorrow" : "明天",
        value: function () {
          var now = new Date();
          now.setDate(now.getDate() + 1);
          return now;
        }
      },
      {
        text: isEn ? "Last Month" : "上个月",
        value: function () {
          var now = new Date();
          var month = now.getMonth() - 1;
          now.setMonth(month);
          if (now.getMonth() !== month) now.setDate(0);
          return [now];
        }
      },
      {
        text: isEn ? "Next Month" : "下个月",
        value: function () {
          var now = new Date();
          var month = now.getMonth() + 1;
          now.setMonth(month);
          if (now.getMonth() !== month) now.setDate(0);
          return [now];
        }
      },
      {
        text: isEn ? "A Day" : "某一天",
        value: "2016-10-14 10:00:00"
      }
    ];
  }

  // 6. DateTime FullPanel Shortcuts
  get shortcutsDateTimeFull() {
    const isEn = this.currentLang() === 'en';
    return [
      { text: isEn ? "Yesterday" : "昨天", value: function () { var now = new Date(); now.setDate(now.getDate() - 1); return now; } },
      { text: isEn ? "Today" : "今天", value: Date.now() },
      { text: isEn ? "Tomorrow" : "明天", value: function () { var now = new Date(); now.setDate(now.getDate() + 1); return now; } },
      { text: isEn ? "Last Month" : "上个月", value: function () { var now = new Date(); var month = now.getMonth() - 1; now.setMonth(month); if (now.getMonth() !== month) now.setDate(0); return [now]; } },
      { text: isEn ? "Next Month" : "下个月", value: function () { var now = new Date(); var month = now.getMonth() + 1; now.setMonth(month); if (now.getMonth() !== month) now.setDate(0); return [now]; } },
      { text: isEn ? "A Day" : "某一天", value: "2016-10-14 09:30:00" }
    ];
  }

  // 7. Range Shortcuts
  get shortcutsRange() {
    const isEn = this.currentLang() === 'en';
    return [
      {
        text: isEn ? "Last Month" : "上个月",
        value: function () {
          var date = new Date();
          var year = date.getFullYear();
          var month = date.getMonth();
          return [
            new Date(year, month - 1, 1),
            new Date(year, month, 0)
          ];
        }
      },
      {
        text: isEn ? "This Month" : "这个月",
        value: function () {
          var date = new Date();
          var year = date.getFullYear();
          var month = date.getMonth();
          return [
            new Date(year, month, 1),
            new Date(year, month + 1, 0)
          ];
        }
      },
      {
        text: isEn ? "Next Month" : "下个月",
        value: function () {
          var date = new Date();
          var year = date.getFullYear();
          var month = date.getMonth();
          return [
            new Date(year, month + 1, 1),
            new Date(year, month + 2, 0)
          ];
        }
      }
    ];
  }

  // 8. Year Range Shortcuts
  shortcutsYearRange = [
    {
      text: "过去一年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() - 1);
        return [now, new Date()];
      }
    },
    {
      text: "未来一年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() + 1);
        return [new Date(), now];
      }
    },
    {
      text: "近三年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() - 3);
        return [now, new Date()];
      }
    }
  ];

  // 9. Month Range Shortcuts
  shortcutsMonthRange = [
    {
      text: "去年",
      value: function () {
        var now = new Date();
        var year = now.getFullYear() - 1;
        return [
          new Date(year, 0),
          new Date(year, 11)
        ];
      }
    },
    {
      text: "明年",
      value: function () {
        var now = new Date();
        var year = now.getFullYear() + 1;
        return [
          new Date(year, 0),
          new Date(year, 11)
        ];
      }
    },
    {
      text: "近三年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() - 3);
        return [now, new Date()];
      }
    }
  ];

  // 10. Time Range Shortcuts
  shortcutsTimeRange = [
    {
      text: '09:30 <p style="text-align: center;">到</p> 11:30',
      value: (function () {
        var date1 = new Date();
        date1.setHours(9, 0, 0, 0);
        var date2 = new Date();
        date2.setHours(11, 30, 0, 0);
        return [date1, date2];
      })
    },
    {
      text: '13:00 <p style="text-align: center;">到</p> 15:00',
      value: (function () {
        var date1 = new Date();
        date1.setHours(13, 0, 0, 0);
        var date2 = new Date();
        date2.setHours(15, 0, 0, 0);
        return [date1, date2];
      })
    }
  ];

  // 11. DateTime Range Shortcuts
  shortcutsDateTimeRange = [
    {
      text: "上个月",
      value: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        return [
          new Date(year, month - 1, 1),
          new Date(year, month, 0, 23, 59, 59)
        ];
      }
    },
    {
      text: "这个月",
      value: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        return [
          new Date(year, month, 1),
          new Date(year, month + 1, 0, 23, 59, 59)
        ];
      }
    },
    {
      text: "下个月",
      value: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        return [
          new Date(year, month + 1, 1),
          new Date(year, month + 2, 0, 23, 59, 59)
        ];
      }
    }
  ];

  range(start: number, end: number) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  markFunction = (ymd: any, render: any) => {
    var y = ymd.year;
    var m = ymd.month;
    var d = ymd.date;
    // String
    if (m === 6 && d === 1) return render('Children');
    // Object
    return render({
      '0-10-14': 'Birthday',
      '0-0-15': 'Mid', // Mid-month
      '2024-3-20': 'v2',
      '2024-3-31': 'End'
    });
  };

  cellRenderDemo = (ymd: any, render: any, info: any) => {
    // Custom render for the 8th of every month
    if (info.type === 'date' && ymd.date === 8) {
      render(`<span style="color: #16b777; font-weight: normal; border: 1px solid #16b777; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;">${ymd.date}</span>`);
    }
  };

  get displayFormatConfig() {
    const isEn = this.currentLang() === 'en';
    return {
      lang: this.currentLang(),
      darkMode: this.demoDarkMode(),
      formatToDisplay: (value: string) => {
        if (!value) return '';
        const date = new Date(value);
        const weekday = date.toLocaleDateString(isEn ? 'en-US' : 'zh-CN', { weekday: 'long' });
        return `${value} (${weekday})`;
      }
    };
  }
}
