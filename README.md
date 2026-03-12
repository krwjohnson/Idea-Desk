# Idea Desk

A browser app to capture, organize, and review song ideas as draggable sticky notes on an infinite canvas. Built with React, TypeScript, and a sleek 1990s studio console aesthetic.

## Features

- **Infinite Canvas** — Pan freely in any direction with a persistent grid, zoom with the scroll wheel
- **Draggable Sticky Notes** — Create, move, and organize song ideas anywhere on the desk
- **Regions** — Draw labeled areas (Demo, Recorded, Finished, etc.) to categorize notes
- **Audio Recording** — Record multiple takes per note with waveform visualization
- **Metadata** — Track BPM, tuning, chord progressions, mood tags, and freeform text
- **Search & Filter** — Find notes by title, mood, region, BPM, or audio presence
- **Minimap** — Zoomed-out overview of the desk with click-to-navigate
- **Export/Import** — Save and share boards as JSON or ZIP files
- **Offline Support** — PWA with IndexedDB persistence and automatic saving
- **Keyboard Shortcuts** — Quick actions for common operations

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd idea-desk
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

### Creating Notes

- Click the **+ Note** button in the top bar
- Double-click on any empty area of the canvas
- Click and drag the note to reposition it

### Creating Regions

- Click the **+ Region** button in the top bar
- Drag the region to move it; drag the edge handles to resize
- Click the **⚙** icon on the region label to rename it, change its color, or lock it
- Notes dropped inside a region are automatically associated with it

### Recording Audio

- Click a note to open the editor
- Use the record button to capture audio takes
- Multiple takes are supported per note with waveform thumbnails

### Navigating the Canvas

- **Click and drag** on empty canvas space to pan
- **Scroll wheel** to zoom in/out
- **Minimap** (bottom-right) shows all notes and regions — click anywhere on it to jump there

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Drag empty canvas | Pan the desk |
| Scroll wheel | Zoom in / out |
| `N` | New note at (100, 100) |
| `R` | New region |
| `G` | Toggle grid |
| `S` | Toggle grid snap |
| `M` | Toggle minimap |
| `C` | Reset pan and zoom |
| `Cmd/Ctrl + F` | Focus search |
| `Cmd/Ctrl + D` | Duplicate selected note |
| `Delete` | Remove selected note |
| `Escape` | Close open modals |

### Search Syntax

Type in the search bar to filter notes in real time. Supported filters:

- `mood:aggressive` — filter by mood tag
- `bpm:140` — filter by exact BPM
- `region:Demo` — filter by region name
- `has:audio` — show only notes with audio recordings
- Any plain text matches note titles

### Export / Import

- **Export as JSON** — downloads the board state
- **Export as ZIP** — includes audio recordings
- **Import** — loads a previously exported `.json` or `.zip` file

## Technical Details

### Architecture

- **Frontend**: React 18 with TypeScript
- **State Management**: Zustand
- **Canvas / Pan-Zoom**: react-zoom-pan-pinch
- **Drag and Drop**: @dnd-kit/core
- **Persistence**: IndexedDB via idb-keyval
- **Audio**: MediaRecorder API + WebAudio
- **Styling**: Tailwind CSS with custom 90s console theme

### Project Structure

```text
src/
├── components/     # React components (Canvas, NoteCard, RegionLayer, Minimap, …)
├── hooks/          # Custom hooks (useKeyboardShortcuts, usePersistence, …)
├── store/          # Zustand store (useBoardStore)
├── types/          # TypeScript type definitions
└── utils/          # Search, export, and other utilities
```

### Data Storage

- All data stored locally in IndexedDB — no server required
- Automatic saves on every change
- Fully offline capable (PWA)

### Audio Format

- Records in WebM format with Opus codec
- Waveform peak data generated for visual thumbnails

## Bug Fixes (Session — 2026-03-12)

The following bugs were identified and fixed during a focused debugging session:

### Note Interaction

- **Notes could not be moved after placing** — drag listeners were only attached to a tiny 16×16 handle; moved them to the full note card
- **Modal opened after every drag** — `click` fires after `pointerup` so `isDragging` was already `false`; added a `didDragRef` to suppress the spurious click
- **Duplicate ghost note during drag** — the `DragOverlay` rendered a second `NoteCard` with the same `useDraggable` id, causing a double-transform offset; suppressed `style`, `listeners`, and `attributes` on the overlay copy
- **Note position offset on drop at non-1× zoom** — drag delta was not divided by the current zoom scale; fixed in `handleDragEnd`

### Keyboard Shortcuts

- **Shortcuts fired while typing in inputs** — `useKeyboardShortcuts` had no guard for `INPUT`/`TEXTAREA`/`contentEditable` targets; letters like `n`, `g`, `s` created notes or toggled settings mid-sentence

### Regions

- **Regions could not be dragged** — no `mousedown` → `mousemove` → `mouseup` handler existed on the region body; added one to `RegionLayer`
- **Region rename did not work** — `RegionEditor` inputs had no `onChange` handlers; all fields now call `updateRegion` live
- **Region drag/resize incorrect at non-1× zoom** — mouse deltas were not divided by zoom scale

### Canvas & Navigation

- **Canvas panning required holding Space** — removed the Space requirement; panning now works by dragging any empty area, using `react-zoom-pan-pinch`'s `excluded` class list to protect notes and regions
- **Grid disappeared when panning outside the initial viewport** — replaced the finite `background-image` on the canvas div with a `GridBackdrop` component that sits outside the transform and uses `background-position` math (`panX % cellSize`, `panY % cellSize`) to render an infinite, always-aligned grid at any pan/zoom position
- **Notes could not be placed outside the original viewport** — canvas div was viewport-sized; expanded it to 10 000 × 8 000 px so empty canvas is always present under the pointer
- **Double-click note placement at wrong position when zoomed** — click coordinates were not divided by zoom scale; fixed in `handleCanvasDoubleClick`

### Minimap

- **Minimap was clipped / half-visible** — outer layout used `h-full` which overflowed behind the TopBar; changed to `flex flex-col` + `flex-1` so the canvas area fills only the remaining height
- **Minimap viewport indicator was always at (0, 0)** — `canvas.panX/panY/zoom` were never updated; added an `onTransformed` callback to the TransformWrapper to sync state into the Zustand store
- **Clicking the minimap did not navigate** — wired up a `transformRef` and `handleNavigate` callback so minimap clicks call `setTransform` on the TransformWrapper

## Roadmap

### MVP Features (Current)

- ✅ Infinite canvas with zoom/pan
- ✅ Draggable sticky notes
- ✅ Region creation, dragging, resizing, and renaming
- ✅ Note metadata editing (BPM, tuning, mood, chord, text)
- ✅ Search and filtering
- ✅ Export/import (JSON and ZIP)
- ✅ Keyboard shortcuts
- ✅ Minimap with click-to-navigate
- ✅ 90s console styling

### Future Features

- Audio recording and playback
- Waveform visualization
- Multi-select and bulk operations
- Freehand region drawing
- Real-time collaboration
- Cloud sync
- Mobile responsive design
- Advanced audio analysis (key detection, tempo matching)

## Browser Support

- **Chrome / Edge** — full support (recommended)
- **Firefox** — full support
- **Safari** — basic support with some limitations

## License

MIT License — see LICENSE file for details.
