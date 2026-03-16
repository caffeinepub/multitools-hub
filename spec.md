# MultiTools Hub Pro

## Current State
- 9 client-side tools: Subtitle Converter, Text Case Converter, Word Counter, JSON Formatter, Base64, URL Encoder, Hash Generator, Timestamp Converter, Color Converter
- Simple backend with only `getGreeting()` (no auth)
- React + TypeScript + Tailwind frontend
- EN/FR i18n support
- Dark/light mode toggle
- Basic sidebar navigation

## Requested Changes (Diff)

### Add
- Backend auth system: register/login with username + password, session tokens, admin role
- Admin panel: accessible only to admin users; shows user list, tool usage stats
- 3 new file tools (all client-side processing):
  - PDF Tool: view PDF pages, merge multiple PDFs, download result
  - Word Tool: DOCX file viewer (render content), plain text extraction, download as TXT
  - Excel Tool: XLSX/CSV viewer (table display), basic stats, download as CSV
- Redesigned UI:
  - Glassmorphism sticky header with logo, search bar (fuzzy), dark/light toggle, login/user button
  - Collapsible sidebar with category grouping and smooth animation
  - Tool cards grid on home (1 col mobile, 2 tablet, 3 desktop) with hover lift effect
  - Breadcrumb navigation
  - Mobile FAB for sidebar toggle
- Login/Register modal (username + password, no email)
- Search functionality: fuzzy search across tool names and descriptions
- Toast notifications for copy/download/auth feedback

### Modify
- Backend: replace stub with full auth canister (register, login, logout, getProfile, isAdmin)
- App.tsx: full redesign with glassmorphism header, collapsible sidebar, search, auth state
- Tool categories: reorganize into Text Tools, Developer Tools, Security/Utility, File Tools, Subtitle
- Sidebar: collapsible per category, collapse/expand animation

### Remove
- Language toggle button (simplify; keep EN only for now, can re-add later)
- `getGreeting` backend function

## Implementation Plan
1. Write spec.md (this file)
2. Select `authorization` component for backend auth
3. Generate Motoko backend with user auth (register, login, logout, getProfile, isAdmin)
4. Build frontend:
   a. New App.tsx with glassmorphism header, collapsible sidebar, search bar, auth modal
   b. AuthModal component (login/register with username+password)
   c. AdminPanel component (user list, basic stats)
   d. PdfTool component (client-side: PDF.js for viewing, pdf-lib for merge)
   e. WordTool component (client-side: mammoth.js for DOCX rendering)
   f. ExcelTool component (client-side: SheetJS/xlsx for XLSX/CSV viewing)
   g. Wire all tools with new category structure
   h. Add deterministic data-ocid markers throughout
