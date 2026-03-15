# MultiTools Hub

## Current State
A 9-tool multi-tool website with sidebar navigation, dark mode toggle, and client-side processing. Tools: Subtitle Converter, Text Case Converter, Word Counter, JSON Formatter, Base64, URL Encoder, Hash Generator, Timestamp Converter, Color Converter. The app has basic responsive layout but several mobile UX issues and no multi-language support.

## Requested Changes (Diff)

### Add
- i18n system with English (EN) and French (FR) support — context-based, lightweight, no external library
- Language switcher button in header (EN/FR toggle)
- French translations for: all navigation labels, tool labels/descriptions, tool UI strings (buttons, placeholders, error messages, headers), home page text, category names
- Mobile-first improvements: collapsible sidebar already works, but improve tool UI layouts for small screens

### Modify
- `App.tsx`: add LanguageContext provider, language toggle button in header, translate all static text (Home, category names, tool labels, descriptions, header breadcrumb)
- `SubtitleConverter.tsx`: translate UI strings; fix toolbar layout on mobile (wrap into grid); make the editor table stack or scroll properly on mobile
- `TextCaseConverter.tsx`: translate labels, placeholder, button labels
- `WordCounter.tsx`: translate stat labels, placeholder
- `JsonFormatter.tsx`: translate button labels, placeholders, status messages
- `Base64Tool.tsx`: translate labels, buttons, placeholders
- `UrlEncoderTool.tsx`: translate labels, buttons, placeholder
- `HashGenerator.tsx`: translate button labels, placeholder
- `TimestampConverter.tsx`: translate labels, buttons
- `ColorConverter.tsx`: fix mobile layout for RGB inputs (stack them vertically on small screens); translate labels
- `TOOL_COMPONENTS` in App.tsx: render tool components lazily (only render active tool, not all at once)

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/lib/i18n.tsx` — LanguageContext, useTranslation hook, EN+FR translation object covering all strings in the app
2. Wrap app in LanguageProvider in `main.tsx` or `App.tsx`
3. Add FR/EN language toggle button in header (next to dark mode toggle)
4. Update `App.tsx` to use translations for all static text; render TOOL_COMPONENTS lazily (switch-case in JSX)
5. Update each tool file to use `useTranslation` for all user-facing strings
6. Fix `ColorConverter.tsx` mobile layout: wrap RGB inputs in responsive grid
7. Fix `SubtitleConverter.tsx` mobile: use flex-col for toolbar on mobile, ensure table has proper horizontal scroll container
8. Validate and build
