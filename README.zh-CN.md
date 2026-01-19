<div align="center">

# NgLaydate

**极简、强大、高颜值**的 Angular 日期时间选择器组件。基于 Angular Signals 全新打造，完美兼容 Angular 18+。

[![NPM package](https://img.shields.io/npm/v/ng-laydate.svg?style=flat-square)](https://npmjs.org/package/ng-laydate)
[![GitHub Release Date](https://img.shields.io/github/release-date/lanxuexing/ng-laydate.svg?style=flat-square)](https://github.com/lanxuexing/ng-laydate/releases)
[![GitHub repo size](https://img.shields.io/github/repo-size/lanxuexing/ng-laydate.svg?style=flat-square)](https://github.com/lanxuexing/ng-laydate)
[![GitHub Stars](https://img.shields.io/github/stars/lanxuexing/ng-laydate.svg?style=flat-square)](https://github.com/lanxuexing/ng-laydate/stargazers)
[![NPM downloads](http://img.shields.io/npm/dm/ng-laydate.svg?style=flat-square)](https://npmjs.org/package/ng-laydate)
[![CI/CD](https://github.com/lanxuexing/ng-laydate/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/lanxuexing/ng-laydate/actions)
[![GitHub license](https://img.shields.io/github/license/lanxuexing/ng-laydate.svg?style=flat-square)](https://github.com/lanxuexing/ng-laydate/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=flat-square&logo=angular&logoColor=white)](https://angular.dev)
[![Signals](https://img.shields.io/badge/Signals-优化-blue.svg?style=flat-square&logo=dynamic-365&logoColor=white)](https://angular.cn/guide/signals)
[![Code style: prettier](https://img.shields.io/badge/代码风格-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![PRs Welcome](https://img.shields.io/badge/PRs-欢迎-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

中文版 | [English](./README.md)

## 🔗 在线演示
查看组件实时效果： **[https://lanxuexing.github.io/ng-laydate/](https://lanxuexing.github.io/ng-laydate/)**

</div>

---

## ✨ 特性

- 🚀 **基于 Signals**: 原生响应式设计，性能卓越。
- 📅 **模式全覆盖**: 支持 `year` (年)、`month` (月)、`date` (日)、`time` (时分秒) 和 `datetime` (日期时间)。
- 🔗 **范围选择**: 支持普通范围选择或面板联动 (`rangeLinked`) 选择。
- ⚡ **快捷选项**: 可自定义快捷选择按钮，支持侧边栏或页脚展示。
- 🎨 **丰富主题**: 内置 `default`、`molv` (墨绿)、`grid` (格子)、`circle` (圆形)、`dark` (深色) 以及特色 `fullpanel` (左右联动全面板) 主题。
- 🕒 **精准控制**: 智能时分秒列显隐控制，支持自动滚动定位。
- 🌏 **国际化**: 完美支持中文 (`cn`) 和英文 (`en`)。
- 🚩 **节日与假勤**: 内置公历节日显示，支持自定义节假日/加班标记。
- 🖋️ **自定义渲染**: 提供灵活的 `cellRender` 或 `mark` 函数，支持在单元格内插入自定义 HTML。
- ⚡ **极致性能**: 深度优化的渲染引擎，配合 `requestAnimationFrame` 实现丝滑的 60fps 交互体验。
- 🖥️ **SSR 支持**: 完美兼容 Angular Universal / 服务端渲染 (SSR) 场景。
- 🌓 **深色模式**: 高质量的深色主题支持。
- 📝 **表单支持**: 完美支持模板驱动表单 (Template-driven) 和响应式表单 (Reactive Forms) 的**双向绑定** (`ControlValueAccessor`)。

## 📦 安装

该组件通过 Angular Library 形式分发。

```bash
npm install ng-laydate
```

## 🚀 快速上手

### 1. 引入指令

在您的独立组件（Standalone Component）或模块中引入 `NgLaydateDirective`。

```typescript
import { NgLaydateDirective } from 'ng-laydate';

@Component({
  standalone: true,
  imports: [NgLaydateDirective, ...]
})
export class MyComponent {}
```

### 1. 指令方式 (推荐)

直接在任何 `input` 元素上使用 `[laydate]` 指令。

```html
<!-- 基础日期选择 -->
<input type="text" laydate placeholder="请选择日期">

<!-- 日期时间范围选择 -->
<input type="text" [laydate]="{
  type: 'datetime',
  range: true,
}" placeholder="请选择时间范围">
```

### 2. 表单支持 (双向绑定)

组件完整实现了 `ControlValueAccessor` 接口，可以像使用原生 `input` 一样配合 `ngModel` 或 `formControlName` 使用。

#### 模板驱动表单 (Template-driven)
```html
<input type="text" laydate [(ngModel)]="dateValue">
```

#### 响应式表单 (Reactive)
```html
<form [formGroup]="myForm">
  <input type="text" laydate formControlName="date">
</form>
```

### 3. 组件直接使用

如果您需要静态展示或嵌入式选择器，可以直接使用组件。

```html
<ng-laydate
  [config]="{position: 'static', theme: 'molv'}"
  (done)="onDateSelected($event)"
/>
```

## ⚙️ 配置参数 (LaydateConfig)

| 属性 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `string` | - | 选择器实例的自定义 ID。 |
| `type` | `'year'\|'month'\|'date'\|'time'\|'datetime'` | `'date'` | 选择器类型。支持年、月、日、时分秒以及日期时间。 |
| `range` | `boolean\|string` | `false` | 开启范围选择。可指定 `true`（分隔符 `-`）或自定义字符串。 |
| `rangeLinked` | `boolean` | `false` | 是否开启面板联动（左右面板月份连续）。 |
| `format` | `string` | `'yyyy-MM-dd'` | 日期输出格式（如 `yyyy-MM-dd HH:mm:ss`）。 |
| `value` | `string \| Date` | - | 初始值。可以传入符合格式的字符串或 Date 对象。 |
| `isInitValue` | `boolean` | `true` | 是否自动向元素填充初始值。 |
| `min` / `max` | `string \| Date \| number` | - | 最小/最大可选日期。支持字符串、Date 对象或数值偏移。 |
| `trigger` | `string` | `'click'` | 呼出选择器的事件（如 `focus`, `click`）。 |
| `theme` | `string \| string[]` | `'default'` | 主题名称（`molv`, `grid`, `circle`, `fullpanel`, `dark`）或颜色的十六进制值。 |
| `shortcuts` | `Array` | - | 高级快捷选项 (如 `[{text: '今天', value: new Date()}]`)。 |
| `shorthand` | `Record<string, string>` | - | 简单快捷键 (如 `{'yesterday': '2024-01-01'}`)。 |
| `btns` | `string[]` | `['clear', 'now', 'confirm']` | 页脚显示的按钮及其顺序。 |
| `lang` | `'cn' \| 'en'` | `'cn'` | 语言设置。 |
| `weekStart` | `number` | `0` | 星期起始日（0-6，0 代表周日）。 |
| `darkMode` | `boolean` | `false` | 是否强制开启深色模式。 |
| `show` | `boolean` | `false` | 是否在初始化完成后立即显示选择器。 |
| `showBottom` | `boolean` | `true` | 是否显示页脚。 |
| `isPreview` | `boolean` | `true` | 是否在页脚显示实时选择结果的预览。 |
| `autoConfirm` | `boolean` | `true` | 是否在选择完成后自动确认并关闭（仅单选）。 |
| `calendar` | `boolean` | `false` | 是否显示公历节日（如：清明、情人节等）。 |
| `mark` | `Record \| Function` | - | 标注日期 (如 `{'0-0-15': '月中'}`)。 |
| `disabledDate` | `Function` | - | 禁用日期的回调。返回 `true` 代表禁用。 |
| `disabledTime` | `Function` | - | 禁用时分秒的回调。 |
| `cellRender` | `Function` | - | 单元格自定义渲染回调。 |
| `formatToDisplay` | `Function` | - | 仅用于输入框展示格式化的回调，不影响实际值。 |
| `holidays` | `[string[], string[]]` | - | 标注节假日/加班日。格式为 `[[节假日], [加班日]]`。 |
| `shade` | `boolean \| number` | - | 遮罩层配置，可指定透明度。 |
| `zIndex` | `number` | `66666666` | 选择器的 CSS z-index 值。 |
| `position` | `'absolute'\|'fixed'\|'static'` | `'absolute'` | 组件的定位策略。 |

## 🔔 回调事件

- `ready`: 控件渲染完成时触发。
- `change`: 值发生改变时触发。
- `done`: 点击确认或选择完成时触发。
- `close`: 选择器关闭时触发。
- `onConfirm` / `onNow` / `onClear`: 点击页脚对应按钮时触发。

## 🌈 主题与视觉

本组件支持多种视觉风格，完美契合您的应用界面：

- **FullPanel (全面板)**: 高端的大宽度布局，日期和时间选择器并排显示，交互更直接。
- **Molv (墨绿)**: 经典的 Layui 墨绿风格，现代感十足。
- **Dark (深色)**: 精心调校的暗黑模式，适合弱光环境使用。
- **自定义颜色**: 向 `theme` 传入任何十六进制颜色（如 `{theme: '#722ed1'}`），组件主色调将即刻改变。

- **Circle**: 极简圆形化风格。
- **Dark**: 专业的暗黑模式。

> [!TIP]
> **自定义配色**: 您可以向 `theme` 传递任何十六进制颜色值（例如 `{theme: '#722ed1'}`），让组件瞬间适配您的应用品牌色。

## 🛠 开发指南

本项目采用 Angular Workspace 标准架构：

- **核心库路径**: `projects/ng-laydate`
- **演示应用路径**: `projects/laydate-demo`

### 常用命令
- `npm start`: 启动演示应用进行本地调试。
- `npm run build:lib`: 构建生产环境的库文件。
- `npm run build:demo`: 构建生产环境的演示应用。
- `npm run build:all`: 一键构建库和演示应用。

---

如需查看更多复杂示例和高级用法，请参考仓库中的 [演示代码](https://github.com/lanxuexing/ng-laydate/blob/main/projects/laydate-demo/src/app/app.html)。

用 ❤️ 为 Angular 社区打造。
