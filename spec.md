# MultiTools Hub

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Multi-tool website with a clean dashboard/home listing all available tools
- Subtitle Converter Tool (primary tool):
  - Support all major subtitle formats: SRT, VTT, ASS/SSA, SUB, SBV, LRC, DFXP/TTML, STL
  - Convert between any two formats
  - Upload subtitle file or paste text directly
  - Inline subtitle editor: edit timing, text, add/remove lines
  - Preview parsed subtitles in a table view
  - Download converted file
  - Batch-style: process all entries
- Additional tools (stubs with UI):
  - Text Case Converter (UPPER, lower, Title, camelCase, snake_case, kebab-case)
  - JSON Formatter & Validator
  - Base64 Encoder/Decoder
  - URL Encoder/Decoder
  - Word & Character Counter
  - Color Converter (HEX, RGB, HSL)
  - Hash Generator (MD5, SHA-1, SHA-256)
  - Timestamp Converter
- Navigation sidebar/header with tool categories
- All processing done client-side (no backend needed for tools)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Create main App with sidebar navigation and routing between tools
2. Implement subtitle parser/serializer for SRT, VTT, ASS, SUB, SBV, LRC, DFXP, STL formats
3. Build SubtitleConverter component with upload, format select, editor table, download
4. Implement all other text/utility tools as standalone components
5. Create home/dashboard page with tool cards grid
6. Wire routing and navigation
