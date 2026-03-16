# MultiTools Hub

## Current State

MultiTools Hub is a React + TypeScript multi-tool web app with 12 tools across 5 categories (Subtitle, Text, Dev, Security, File). The File category currently has 3 tools: PdfTool (basic), WordTool, ExcelTool. The app has a collapsible sidebar, dark/light mode, multi-language support (EN/FR/ES/NL/FI), and a Motoko backend for auth. All tool processing is 100% client-side.

## Requested Changes (Diff)

### Add
- **PDF Merger** (`pdf-merger`) tool: Upload multiple PDF files, drag & drop to reorder, merge into single downloadable PDF. Uses pdf-lib.
- **PDF Splitter** (`pdf-splitter`) tool: Upload one PDF, specify page ranges (e.g. 1-5, 6-10), extract as separate downloadable files. Uses pdf-lib.
- **PDF Compressor** (`pdf-compressor`) tool: Upload PDF, compress by reducing image quality/resolution within the PDF, show before/after file size comparison. Uses pdf-lib.
- New ToolIds: `pdf-merger`, `pdf-splitter`, `pdf-compressor`
- i18n keys for all 3 tools in all 5 languages (EN, FR, ES, NL, FI)
- New icons for each tool in the sidebar (FileStack, Scissors, Minimize2 from lucide-react)

### Modify
- `App.tsx`: Add 3 new ToolIds, import and render new tool components, add tools to TOOLS array under File category
- `i18n.tsx`: Add translation keys for new tools in all 5 languages

### Remove
- Nothing removed

## Implementation Plan

1. Install pdf-lib as a dependency
2. Create `src/frontend/src/tools/PdfMerger.tsx` - drag & drop reorderable file list, merge with pdf-lib, download result
3. Create `src/frontend/src/tools/PdfSplitter.tsx` - file upload, page range input (comma-separated ranges), split and download each part
4. Create `src/frontend/src/tools/PdfCompressor.tsx` - file upload, compress images in PDF using pdf-lib, show size comparison, download
5. Update `App.tsx` to include new tools
6. Update `i18n.tsx` with all translation keys for all 5 languages
