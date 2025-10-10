# Idea Desk

A browser app to capture, organize, and review song ideas as draggable sticky notes on a canvas. Built with React, TypeScript, and a sleek 1990s studio console aesthetic.

## Features

- **Infinite Canvas**: Pan and zoom with grid snap functionality
- **Draggable Sticky Notes**: Create, edit, and organize song ideas
- **Regions**: Draw labeled areas (Demo, Recorded, Finished) to categorize notes
- **Audio Recording**: Record multiple takes per note with waveform visualization
- **Metadata**: Track BPM, tuning, chord progressions, mood tags, and notes
- **Search & Filter**: Find notes by title, mood, region, BPM, or audio presence
- **Export/Import**: Save and share your boards as JSON files
- **Offline Support**: PWA with IndexedDB persistence
- **Keyboard Shortcuts**: Space to pan, Cmd/Ctrl+F to search, Cmd/Ctrl+D to duplicate

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
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## Usage

### Creating Notes
- Click the "+ Note" button in the top bar
- Double-click on empty canvas space
- Drag notes around the canvas

### Recording Audio
- Click on a note to open the editor
- Use the record button to capture audio
- Multiple takes supported per note

### Creating Regions
- Click the "+ Region" button
- Draw rectangular areas to organize notes
- Notes automatically snap to regions when dropped inside

### Keyboard Shortcuts
- **Space**: Hold to pan the canvas
- **Cmd/Ctrl + F**: Focus search
- **Cmd/Ctrl + D**: Duplicate selected note
- **Delete**: Remove selected note
- **Escape**: Close modals
- **M**: Toggle minimap

### Export/Import
- Use the Export button to download your board as JSON
- Use the Import button to load a previously exported board

## Browser Support

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Basic support with some limitations

## Technical Details

### Architecture
- **Frontend**: React 18 with TypeScript
- **State Management**: Zustand
- **Canvas**: react-zoom-pan-pinch + @dnd-kit
- **Persistence**: IndexedDB via idb-keyval
- **Audio**: MediaRecorder API + WebAudio
- **Styling**: Tailwind CSS with custom 90s console theme

### Data Storage
- All data is stored locally in IndexedDB
- No server required - fully offline capable
- Automatic saves on every change
- Manual snapshot system (keeps last 10)

### Audio Format
- Records in WebM format with Opus codec
- Supports up to 3 takes per note
- Waveform data generated for visual thumbnails

## Development

### Project Structure
```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── store/         # Zustand store
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Key Components
- `Canvas`: Main canvas with zoom/pan and drag-drop
- `NoteCard`: Individual sticky note component
- `RegionLayer`: Region drawing and management
- `NoteModal`: Note editing interface
- `TopBar`: Main navigation and controls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

### MVP Features (Current)
- ✅ Basic canvas with zoom/pan
- ✅ Draggable sticky notes
- ✅ Region creation and management
- ✅ Note metadata editing
- ✅ Search and filtering
- ✅ Export/import functionality
- ✅ Keyboard shortcuts
- ✅ 90s console styling

### Future Features
- Audio recording and playback
- Waveform visualization
- Multi-select and bulk operations
- Freehand region drawing
- Real-time collaboration
- Cloud sync
- Mobile responsive design
- Advanced audio analysis

## Support

For issues and questions, please open a GitHub issue or contact the development team.
