---
name: apple-design
description: Design principles and styling guidelines for Apple-inspired minimalist aesthetics, glassmorphism, typography, and micro-interactions. Use whenever designing or updating web UI components, landing pages, or demo sites for ng-laydate.
---

# Apple Design Principles & UI Guidelines

Apply these Apple-inspired design standards when building or updating any user interfaces, demo pages, or components.

## 1. Typography & Hierarchy
- **Font Family**: Use system font stack with fallbacks:
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro Icons", "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  ```
- **Heading Styles**: Use crisp, high-contrast headings with tight letter-spacing (`letter-spacing: -0.03em`) and elegant line-height.
- **Category Labels**: Use subtle uppercase section labels (`font-size: 0.8rem`, `font-weight: 600`, `letter-spacing: 0.05em`, `color: var(--text-muted)`).

## 2. Glassmorphism & Depth
- **Frosted Glass Cards**:
  ```css
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
  ```
- **Layering**: Use multi-layered soft shadows instead of harsh black shadows. Hover states should lift slightly with elevated shadow (`transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08)`).

## 3. Apple-style Form Controls
- **Inputs**:
  ```css
  height: 44px;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  ```
- **Focus States**: Use a soft translucent glow instead of heavy outlines:
  ```css
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  border-color: #10b981;
  ```

## 4. Color System & Accents
- **Base Background**: Subtle radial gradient over neutral light/dark background:
  ```css
  background: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 70%), #f8fafc;
  ```
- **Pill Badges**: Use rounded pill tags (`border-radius: 30px`, `padding: 6px 16px`).
- **Accent Colors**: Apple Blue (`#0071e3`), Emerald Green (`#10b981`), Deep Charcoal (`#1d1d1f`).

## 5. Micro-Interactions & Animation
- **Timing Function**: Always use Apple's signature smooth ease: `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Active State**: Subtle scale or press feedback on click (`transform: translateY(0)` or `scale(0.98)`).
