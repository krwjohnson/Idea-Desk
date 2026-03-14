# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Type-check + production build (tsc && vite build)
npm run lint      # ESLint with zero warnings allowed
npm run preview   # Preview production build
```

There are no tests in this project.

## Architecture

**Idea Desk** is a React/TypeScript PWA — an infinite canvas for capturing song ideas as draggable sticky notes with audio recording, regions, search, and IndexedDB persistence.

### Data Flow

```
App.tsx
  └─ TransformWrapper (react-zoom-pan-pinch)  ← syncs zoom/pan to Zustand
       └─ Canvas.tsx
            └─ DndContext (dnd-kit)           ← drag-and-drop for notes
                 ├─ NoteCard.tsx              ← opens NoteModal on click
                 ├─ RegionLayer.tsx           ← drag/resize regions; opens RegionEditor
                 ├─ GridBackdrop.tsx          ← infinite grid with pan/zoom offset math
                 └─ DragOverlay
TopBar.tsx        ← create, search, export/import, toggles
Minimap.tsx       ← overview; click calls transformRef.setTransform()
```

### State (Zustand — `src/store/useBoardStore.ts`)

Single store with four slices:
- `board` — notes, regions, tags, settings (persisted to IndexedDB)
- `canvas` — zoom, pan, selection, drag state
- `ui` — modal visibility, minimap/search toggles
- `recording` — active recording state

### Persistence (`src/hooks/usePersistence.ts`)

- Auto-saves `board` to IndexedDB key `idea-desk-board` with 1s debounce on any board change
- Snapshots (max 10) stored under `idea-desk-snapshots`
- Audio blobs stored as data URLs inside the board JSON

### Key Interaction Details

- **Drag suppression on notes:** NoteCard distinguishes click vs. drag to avoid opening the modal on drag. There is careful coordinate-tracking logic — touch this carefully.
- **Zoom-offset positioning:** When placing notes or handling region drag/resize, canvas transform (zoom + pan) must be applied. Bugs here caused many of the fixes in the last commit.
- **Keyboard shortcuts** (`src/hooks/useKeyboardShortcuts.ts`): Suppressed when focus is inside `<input>`, `<textarea>`, or `[contenteditable]`.

### Audio

Web Audio API + MediaRecorder (WebM/Opus). Multiple takes per note with waveform peak data stored alongside the audio blob. Handled in `src/hooks/useAudioRecorder.ts` and `src/hooks/useAudioPlayer.ts`, rendered in `AudioRecorder.tsx`.

### Search

`src/utils/searchUtils.ts` — `parseSearchQuery()` supports special tokens: `mood:`, `bpm:`, `region:`, `has:audio`. All other terms match note title/text.

### Export/Import

`src/utils/exportUtils.ts` — JSON export or ZIP (with audio files extracted from data URLs). Import handles both formats and merges/replaces board state.

### Styling

Tailwind CSS with a custom 90s studio console palette (dark bg `#121416`, neon green accent `#00ff9c`). Theme defined in `tailwind.config.js`. No component library — all UI is custom.
