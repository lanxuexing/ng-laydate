<div align="center">

# NgLaydate

A minimalist, powerful, and beautifully designed Date & Time Picker for Angular 18+, built with Signals.

[![NPM package](https://img.shields.io/npm/v/ng-laydate.svg?style=flat-square)](https://npmjs.org/package/ng-laydate)
[![GitHub Release Date](https://img.shields.io/github/release-date/lanxuexing/ng-laydate.svg?style=flat-square)](https://github.com/lanxuexing/ng-laydate/releases)
[![GitHub repo size](https://img.shields.io/github/repo-size/lanxuexing/ng-laydate.svg?style=flat-square)](https://github.com/lanxuexing/ng-laydate)
[![GitHub Stars](https://img.shields.io/github/stars/lanxuexing/ng-laydate.svg?style=flat-square)](https://github.com/lanxuexing/ng-laydate/stargazers)
[![NPM downloads](http://img.shields.io/npm/dm/ng-laydate.svg?style=flat-square)](https://npmjs.org/package/ng-laydate)
[![CI/CD](https://github.com/lanxuexing/ng-laydate/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/lanxuexing/ng-laydate/actions)
[![GitHub license](https://img.shields.io/github/license/lanxuexing/ng-laydate.svg?style=flat-square)](https://github.com/lanxuexing/ng-laydate/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=flat-square&logo=angular&logoColor=white)](https://angular.dev)
[![Signals](https://img.shields.io/badge/Signals-optimized-blue.svg?style=flat-square&logo=dynamic-365&logoColor=white)](https://angular.dev/guide/signals)
[![Code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

[中文版](./README.zh-CN.md) | English

## 🔗 Live Demo
Check out the component in action: **[https://lanxuexing.github.io/ng-laydate/](https://lanxuexing.github.io/ng-laydate/)**

</div>

---

## ✨ Features

- 🚀 **Signals-Based**: High performance and reactive by design.
- 📅 **Comprehensive Modes**: Supports `year`, `month`, `date`, `time`, and `datetime`.
- 🔗 **Range Selection**: Simple or linked range selection (consecutive months).
- ⚡ **Shortcuts**: Customizable quick-selection buttons (sidebar or footer).
- 🎨 **Rich Themes**: Includes `default`, `molv` (teal), `grid`, `circle`, `dark`, and a special `fullpanel` (side-by-side) theme.
- 🕒 **Precision Control**: Intelligent H:M:S column visibility and auto-scrolling.
- 🌏 **Internationalization**: Full support for Chinese (`cn`) and English (`en`).
- 🚩 **Special Days**: Built-in Gregorian festivals and customizable Holiday/Workday markers.
- 🖋️ **Custom Content**: Flexible cell rendering via `cellRender` or `mark` functions.
- ⚡ **Performance**: Optimized rendering engine with smart diffing and `requestAnimationFrame` for smooth 60fps interactions.
- 🖥️ **SSR Ready**: Fully compatible with Angular Universal / Server-Side Rendering (SSR).
- 🌓 **Dark Mode**: Premium dark theme support.
- 📝 **Form Support**: Full two-way binding support for Template-driven and Reactive Forms (`ControlValueAccessor`).

## 📦 Installation

This component is available as an Angular Library.

```bash
npm install ng-laydate
```

## 🚀 Quick Start

### 1. Import Directive

Register `NgLaydateDirective` in your standalone component or module.

```typescript
import { NgLaydateDirective } from 'ng-laydate';

@Component({
  standalone: true,
  imports: [NgLaydateDirective, ...]
})
export class MyComponent {}
```

### 1. Directive Usage (Recommended)

Just add the `[laydate]` directive to any input element.

```html
<!-- Simple Date Picker -->
<input type="text" laydate placeholder="Select Date">

<!-- Datetime Range with FullPanel Theme -->
<input type="text" [laydate]="{
  type: 'datetime',
  range: true,
}" placeholder="Select DateTime Range">
```

### 2. Forms Support (Two-way Binding)

The component fully implements `ControlValueAccessor`, allowing you to use `ngModel` or `formControlName` seamlessly.

#### Template-driven Form
```html
<input type="text" laydate [(ngModel)]="dateValue">
```

#### Reactive Form
```html
<form [formGroup]="myForm">
  <input type="text" laydate formControlName="date">
</form>
```

### 3. Component Usage

Use the component directly for static or embedded pickers.

```html
<ng-laydate
  [config]="{position: 'static', theme: 'molv'}"
  (done)="onDateSelected($event)"
/>
```

## ⚙️ Configuration (LaydateConfig)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | - | Custom ID for the picker instance. |
| `type` | `'year'\|'month'\|'date'\|'time'\|'datetime'` | `'date'` | The type of selector to display. |
| `range` | `boolean\|string` | `false` | Enable range selection. Can be `true` (separator `-`) or a customized string (e.g. `' ~ '`). |
| `rangeLinked` | `boolean` | `false` | When `true`, left and right panels are linked (consecutive months). |
| `format` | `string` | `'yyyy-MM-dd'` | The date output format (e.g., `yyyy-MM-dd HH:mm:ss`). |
| `value` | `string \| Date` | - | Initial value of the picker. |
| `isInitValue` | `boolean` | `true` | Whether to automatically populate the initial value to the element. |
| `min` / `max` | `string \| Date \| number` | - | Min/Max selectable date. Supports string, Date, or numeric offset (`-7` is 7 days ago). |
| `trigger` | `string` | `'click'` | Event that triggers the picker (e.g., `focus`, `click`). |
| `theme` | `string \| string[]` | `'default'` | Theme name (`molv`, `grid`, `circle`, `fullpanel`, `dark`) or Hex color. |
| `shortcuts` | `Array` | - | Adv shortcuts (e.g., `[{text: 'Today', value: new Date()}]`). |
| `shorthand` | `Record<string, string>` | - | Simple shortcuts (e.g., `{'yesterday': '2024-01-01'}`). |
| `btns` | `string[]` | `['clear', 'now', 'confirm']` | Footer buttons to display and their order. |
| `lang` | `'cn' \| 'en'` | `'cn'` | Language toggle. |
| `weekStart` | `number` | `0` | Start of the week (0-6, 0 is Sunday). |
| `darkMode` | `boolean` | `false` | Force enable dark mode regardless of theme. |
| `show` | `boolean` | `false` | Whether to show the picker immediately on render. |
| `showBottom` | `boolean` | `true` | Whether to display the footer. |
| `isPreview` | `boolean` | `true` | Show the live selection preview in the footer. |
| `autoConfirm` | `boolean` | `true` | Automatically confirm and close on selection (single mode only). |
| `calendar` | `boolean` | `false` | Show ISO calendar (festivals/solar terms). |
| `mark` | `Record \| Function` | - | Mark days (e.g., `{'0-0-15': 'Mid'}`). |
| `disabledDate` | `Function` | - | Callback for disabling specific dates. Returns `true` to disable. |
| `disabledTime` | `Function` | - | Callback for disabling specific hours/minutes/seconds. |
| `cellRender` | `Function` | - | Custom renderer for date cells (inserting HTML). |
| `formatToDisplay` | `Function` | - | Formats the value for input box display only. |
| `holidays` | `[string[], string[]]` | - | Highlight holidays/workdays. Format: `[[holidys], [workdays]]`. |
| `shade` | `boolean \| number` | - | Show background overlay or set its opacity. |
| `zIndex` | `number` | `66666666` | The CSS z-index of the picker. |
| `position` | `'absolute'\|'fixed'\|'static'` | `'absolute'` | The positioning strategy. |

## 🔔 Callbacks

- `ready`: Triggered when the picker is rendered.
- `change`: Triggered whenever a value changes.
- `done`: Triggered when selection is confirmed.
- `close`: Triggered when the picker is closed.
- `onConfirm` / `onNow` / `onClear`: Triggered on footer button clicks.

## 🌈 Themes & Aesthetics

The component supports a variety of visual styles to match your application:

- **Dark**: Deep dark mode for professional dashboards.

> [!TIP]
> **Custom Colors**: Pass any hex color to `theme` (e.g., `{theme: '#722ed1'}`) to instantly brand the component to match your application.

## 🛠 Development

This repository is structured as an Angular Workspace.

- **Library Path**: `projects/ng-laydate`
- **Demo Path**: `projects/laydate-demo`

### Scripts
- `npm start`: Run the demo application.
- `npm run build:lib`: Build the library for production.
- `npm run build:demo`: Build the demo application.
- `npm run build:all`: Build everything in one go.

---

For more complex examples and advanced usage, please refer to the [demo source code](https://github.com/lanxuexing/ng-laydate/blob/main/projects/laydate-demo/src/app/app.html).

Built with ❤️ for the Angular Community.
