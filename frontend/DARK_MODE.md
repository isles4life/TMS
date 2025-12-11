# Dark Mode Implementation

## Overview
The TMS application now includes a comprehensive dark mode feature that allows users to switch between light and dark themes. The preference is automatically saved to browser localStorage and persects across sessions.

## Features

### 🌓 Theme Toggle
- Click the moon/sun icon in the navbar to toggle between light and dark modes
- Icon changes dynamically: **moon icon** (🌙) = dark mode available, **sun icon** (☀️) = light mode available
- Smooth hover animation with 180° rotation effect

### 💾 Persistent Storage
- User's theme preference is automatically saved to localStorage
- Preference is loaded on app startup
- Falls back to system preference if no saved preference exists

### 🎨 Automatic System Detection
- On first visit, app detects system preference using `prefers-color-scheme` media query
- Respects user's operating system dark mode setting
- Automatically applies theme on app initialization

### 🎯 Comprehensive Coverage
- All global styles update with CSS variables
- Angular Material components use dark palette
- Custom components styled for both light and dark modes
- Smooth transitions between themes

## Dark Mode Colors

### Light Mode (Default)
```
Primary: #d71920 (Truckstop Red)
Text: #0f1115 (Dark Ink)
Surface: #f7f8fa (Light Gray)
Background: #f2f3f5 (Page Gray)
Border: #e0e2e8 (Light Border)
```

### Dark Mode
```
Primary: #ff4444 (Bright Red)
Text: #e0e0e0 (Light Gray)
Surface: #2a2f39 (Dark Surface)
Background: #1a1f28 (Deep Dark)
Border: #3a3f48 (Dark Border)
Accent: #ffb84d (Warm Amber)
```

## Implementation Details

### Theme Service (`theme.service.ts`)
Located in: `libs/core/src/lib/services/theme.service.ts`

The `ThemeService` manages all theme-related operations:

```typescript
// Inject the service
private themeService = inject(ThemeService);

// Toggle theme
themeService.toggleTheme();

// Get current theme
const current = themeService.getTheme(); // 'light' | 'dark'

// Set specific theme
themeService.setTheme('dark');

// Get readable label
const label = themeService.getThemeLabel(); // 'Dark Mode' | 'Light Mode'
```

**Features:**
- Signal-based reactive state management
- Automatic localStorage persistence
- System preference detection on first load
- Effect-driven DOM updates

### CSS Variables
All colors are defined as CSS custom properties in `styles.scss`:

**Light Mode** (`:root`):
```scss
--ts-ink: #0f1115;
--ts-surface: #f7f8fa;
--ts-page-bg: #f2f3f5;
```

**Dark Mode** (`:root.dark-mode`):
```scss
--ts-ink: #e0e0e0;
--ts-surface: #2a2f39;
--ts-page-bg: #1a1f28;
```

Components automatically respond to these variables when the `.dark-mode` class is applied.

### Navbar Integration
The theme toggle button is integrated into the navbar:

```typescript
<button mat-icon-button (click)="toggleTheme()" 
        [attr.aria-label]="'Toggle ' + (themeService.getTheme() === 'light' ? 'dark' : 'light') + ' mode'"
        title="Toggle dark mode" 
        class="theme-toggle-btn">
  <mat-icon>
    {{ themeService.getTheme() === 'light' ? 'dark_mode' : 'light_mode' }}
  </mat-icon>
</button>
```

### App Component Initialization
The theme service is initialized when the app starts:

```typescript
export class AppComponent {
  private themeService = inject(ThemeService);
  
  constructor() {
    // Initialize theme service on app startup
    this.themeService;
    // ... rest of component
  }
}
```

## Usage in Components

### Using Theme Service
```typescript
import { ThemeService } from './services/theme.service';

export class MyComponent {
  private themeService = inject(ThemeService);
  
  toggleDarkMode() {
    this.themeService.toggleTheme();
  }
  
  getCurrentTheme() {
    return this.themeService.getTheme();
  }
}
```

### Using CSS Variables
All components automatically use the correct colors via CSS variables:

```scss
.my-component {
  color: var(--ts-ink);
  background: var(--ts-surface);
  border: 1px solid var(--ts-border);
}
```

No additional work needed - switching themes updates all components automatically!

## Browser Compatibility

✅ **Supported:**
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Features Used:**
- CSS Custom Properties (Variables)
- LocalStorage API
- Media Queries (`prefers-color-scheme`)
- Angular Signals (Angular 17+)
- Angular Material themes

## Accessibility

### Keyboard Navigation
- Theme toggle button is fully keyboard accessible
- ARIA labels update dynamically based on current theme
- Tab order preserved in navbar

### Reduced Motion
The theme toggle icon has a rotation animation on hover. Users with reduced motion preference will see it disabled automatically via OS settings.

### Color Contrast
- Dark mode text: #e0e0e0 on dark backgrounds meets WCAG AA standards
- Light mode text: #0f1115 on light backgrounds meets WCAG AAA standards

## Future Enhancements

Possible improvements:
- [ ] Theme selection modal with preview
- [ ] Additional themes (Blue theme, Green theme, etc.)
- [ ] Custom color picker for power users
- [ ] Auto-switching based on time of day
- [ ] Per-component theme overrides
- [ ] Export/import theme preferences

## Troubleshooting

### Theme not persisting
- Clear browser localStorage and reload
- Check browser storage quota
- Verify localStorage is not disabled in privacy settings

### Inconsistent styling
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Check console for CSS variable errors

### Material components not themed
- Ensure `ThemeService` is injected in `AppComponent`
- Verify `:root.dark-mode` selector in `styles.scss`
- Check that Material modules are imported

## Files Modified

1. **New Files:**
   - `libs/core/src/lib/services/theme.service.ts`

2. **Updated Files:**
   - `apps/web/src/styles.scss` - Added CSS variables and Material dark theme
   - `apps/web/src/app.component.ts` - Initialize ThemeService
   - `apps/web/src/app/layout/navbar.component.ts` - Added theme toggle button

## Related Services

- `AuthService` - User authentication
- `NotificationService` - Notifications
- `BreakpointObserver` - Responsive design
