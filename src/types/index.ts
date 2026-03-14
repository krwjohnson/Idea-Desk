export type RegionId = string;
export type NoteId = string;
export type AudioId = string;

export interface Board {
  id: string;
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  regions: Region[];
  notes: Note[];
  tags: string[]; // global
  settings: BoardSettings;
}

export interface Region {
  id: RegionId;
  name: string; // e.g. "Demo"
  color: string; // hex
  rect: { x: number; y: number; w: number; h: number }; // canvas coords
  zIndex: number; // always below notes
  locked?: boolean;
}

export interface Note {
  id: NoteId;
  title: string;
  x: number; // canvas coords (top-left)
  y: number;
  width: number; // for layout
  color: string; // sticky color
  bpm?: number;
  tuning?: string; // e.g. "E Standard", "Drop D", "C#"
  chordProgression?: string; // free text
  mood: string[]; // e.g. ["aggressive","melancholic"]
  text?: string; // freeform notes
  regionId?: RegionId; // if inside a region
  audio: AudioTake[];
  primaryAudioId?: AudioId;
  createdAt: string;
  updatedAt: string;
  waveformData?: number[]; // peak data for thumbnail
}

export interface AudioTake {
  id: AudioId;
  noteId: NoteId;
  blobRef: string; // IndexedDB key or data URL
  durationSec: number;
  sampleRate?: number;
  createdAt: string;
  isPrimary?: boolean;
}

export interface BoardSettings {
  grid: { enabled: boolean; size: number; snap: boolean };
  theme: "console90s-dark" | "console90s-light";
}

export interface ExportData {
  board: Board;
  version: "1.0.0";
}

export interface SearchFilters {
  title?: string;
  mood?: string[];
  region?: string;
  hasAudio?: boolean;
  bpmMin?: number;
  bpmMax?: number;
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedNoteId?: NoteId;
  selectedRegionId?: RegionId;
  selectedNoteIds: NoteId[];
  isPanning: boolean;
  isDragging: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob?: Blob;
  audioUrl?: string;
}

// UI State
export interface UIState {
  showNoteModal: boolean;
  showRegionEditor: boolean;
  showSearch: boolean;
  showMinimap: boolean;
  isSpacePressed: boolean;
  lastSaved?: string;
}
