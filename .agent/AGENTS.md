# Workspace Rules & Customizations for NgLaydate

## Apple Design Guidelines & Aesthetics
All user interfaces, landing pages, component styles, and demo applications in this project must strictly comply with Apple Design principles:

1. **Typography**: SF Pro / Inter font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif`), tight heading letter spacing (`-0.03em`), uppercase section labels (`0.05em`).
2. **Glassmorphism & Depth**: Multi-layered backdrop blurs (`backdrop-filter: blur(20px) saturate(180%)`), subtle semi-transparent borders (`1px solid rgba(255, 255, 255, 0.8)`), soft layered drop shadows.
3. **Control Aesthetics**: 12px/20px border-radii, translucent inputs, soft glow focus states (`box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15)`).
4. **Motion & Feedback**: Apple signature animation curve `cubic-bezier(0.16, 1, 0.3, 1)`, active state press scale, 60fps performance via `requestAnimationFrame`.
5. **Skill Reference**: Detailed guidelines available in `.agent/skills/apple-design/SKILL.md`.

## Quality Assurance & Non-Regression Rules
1. **Shortcut & State Synchronization**: When fixing or enhancing shortcut bars (`shortcuts`), date parsing (`parse`), or input value sync, NEVER break existing shortcut types:
   - Handle all value formats: `Date`, string, relative numbers (`-1`, `1`), Unix timestamps (`Date.now()`), array of `[Date]` (single value unwrapping), and 2-element arrays `[start, end]`.
   - Always run comprehensive regression verification on ALL demo sections (Preset Dates, Year, Month, Time, DateTime, Ranges) after making core logic edits.

