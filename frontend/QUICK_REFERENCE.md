# Dark Mode Quick Reference

## 🚀 Quick Start

### For Users:
- Click the **moon/sun icon** in the top-right navbar to toggle dark mode
- Your preference is automatically saved
- Loads automatically on next visit

### For Developers:

**Use theme service:**
```typescript
import { ThemeService } from './services/theme.service';

export class MyComponent {
  themeService = inject(ThemeService);
  
  // Toggle
  this.themeService.toggleTheme();
  
  // Get current
  const theme = this.themeService.getTheme(); // 'light' | 'dark'
  
  // Set explicit
  this.themeService.setTheme('dark');
}
```

**Use CSS variables:**
```scss
.element {
  color: var(--ts-ink);           // Text
  background: var(--ts-surface);   // Background  
  border: 1px solid var(--ts-border); // Border
}
// Automatically updates when theme changes!
```

## 🎨 CSS Variables

| Variable | Light | Dark |
|----------|-------|------|
| `--ts-ink` | #0f1115 | #e0e0e0 |
| `--ts-surface` | #f7f8fa | #2a2f39 |
| `--ts-page-bg` | #f2f3f5 | #1a1f28 |
| `--ts-border` | #e0e2e8 | #3a3f48 |
| `--ts-red` | #d71920 | #ff4444 |
| `--ts-green` | #1ea672 | #26d48e |
| `--ts-amber` | #f5a300 | #ffb84d |

## 📂 Files

- **Service:** `apps/web/src/app/services/theme.service.ts`
- **Styles:** `apps/web/src/styles.scss`
- **Navbar Toggle:** `apps/web/src/app/layout/navbar.component.ts`
- **App Init:** `apps/web/src/app.component.ts`
- **Docs:** `frontend/DARK_MODE.md`

## 🔧 API

```typescript
// ThemeService methods
toggleTheme(): void           // Switch between light/dark
setTheme(theme: Theme): void  // Set specific theme
getTheme(): Theme             // Get current ('light' | 'dark')
getThemeLabel(): string       // Get readable label

// Properties
currentTheme: Signal<Theme>   // Current theme signal
```

## 💾 Storage

- **Key:** `tms-theme-preference`
- **Location:** Browser LocalStorage
- **Values:** `'light'` | `'dark'`

## 🌐 System Integration

- Detects OS dark mode preference on first load
- Respects `prefers-color-scheme` media query
- Fallback to light mode if no preference

## ✅ Build Status

Frontend builds successfully with dark mode fully integrated.

---

**See full docs:** `frontend/DARK_MODE.md`
