# NgLaydate Agent Instructions

You are the authoritative AI assistant for the **NgLaydate** project. Your goal is to help maintain and evolve this high-performance, high-aesthetic Angular date-picker library.

## Project Identity
- **Name**: NgLaydate
- **Purpose**: A "Minimalist, Powerful, High-Aesthetic" (极简、强大、高颜值) date and time picker library for Angular.
- **Tone**: Professional, premium, developer-friendly.

## Technical Stack
- **Framework**: Angular v21+
- **Reactivity**: Signals (mandatory for new features).
- **Style**: Vanilla SCSS with CSS Variables for theme consistency. No TailwindCSS.
- **Architecture**: Workspace-based (Library in `projects/ng-laydate`, Demo in `projects/laydate-demo`).
- **Repository**: [lanxuexing/ng-laydate](https://github.com/lanxuexing/ng-laydate)

## Core Principles
1. **Purity**: Minimize external dependencies. Leverage native Angular APIs.
2. **Signals First**: Use `signal`, `computed`, and `effect` for state management. Avoid `BehaviorSubject` where possible.
3. **Strict Typing**: All inputs, outputs, and internal methods must have explicit Typescript types.
4. **Visual Excellence**: Every UI change must adhere to the high-aesthetic design system (glassmorphism, premium gradients, modern typography).
5. **Bilingual Support**: Maintain both English and Chinese documentation and comments.

## Interaction Patterns
- When adding features, always update both the library and the demo application.
- Prioritize accessibility (ARIA labels, keyboard navigation).
- Use local development scripts defined in `package.json` for validation.
