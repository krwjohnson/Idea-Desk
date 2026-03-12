import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  Board, 
  Note, 
  Region, 
  NoteId, 
  RegionId, 
  CanvasState, 
  UIState, 
  SearchFilters,
  RecordingState 
} from '../types';

interface BoardStore {
  // Board data
  board: Board;
  
  // UI state
  canvas: CanvasState;
  ui: UIState;
  searchFilters: SearchFilters;
  recording: RecordingState;
  
  // Actions
  updateBoard: (updates: Partial<Board>) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'audio'> & { audio?: Note['audio'] }) => void;
  updateNote: (id: NoteId, updates: Partial<Note>) => void;
  deleteNote: (id: NoteId) => void;
  duplicateNote: (id: NoteId) => void;
  
  addRegion: (region: Omit<Region, 'id'>) => void;
  updateRegion: (id: RegionId, updates: Partial<Region>) => void;
  deleteRegion: (id: RegionId) => void;
  
  // Canvas actions
  updateCanvas: (updates: Partial<CanvasState>) => void;
  setSelectedNote: (id?: NoteId) => void;
  setSelectedRegion: (id?: RegionId) => void;
  
  // UI actions
  updateUI: (updates: Partial<UIState>) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  
  // Recording actions
  updateRecording: (updates: Partial<RecordingState>) => void;
  
  // Utility
  getNoteById: (id: NoteId) => Note | undefined;
  getRegionById: (id: RegionId) => Region | undefined;
  getNotesInRegion: (regionId: RegionId) => Note[];
  findRegionForPoint: (x: number, y: number) => Region | undefined;
}

const defaultBoard: Board = {
  id: 'default-board',
  name: 'My Idea Desk',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  regions: [],
  notes: [],
  tags: ['aggressive', 'melancholic', 'energetic', 'dark', 'melodic'],
  settings: {
    grid: { enabled: true, size: 24, snap: true },
    theme: 'console90s-dark'
  }
};

const defaultCanvas: CanvasState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  isPanning: false,
  isDragging: false
};

const defaultUI: UIState = {
  showNoteModal: false,
  showRegionEditor: false,
  showSearch: false,
  showMinimap: true,
  isSpacePressed: false
};

const defaultRecording: RecordingState = {
  isRecording: false,
  isPaused: false,
  duration: 0
};

export const useBoardStore = create<BoardStore>()(
  subscribeWithSelector((set, get) => ({
    board: defaultBoard,
    canvas: defaultCanvas,
    ui: defaultUI,
    searchFilters: {},
    recording: defaultRecording,
    
    updateBoard: (updates) => set((state) => ({
      board: { ...state.board, ...updates, updatedAt: new Date().toISOString() }
    })),
    
    addNote: (noteData) => {
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        audio: [],
        mood: noteData.mood || []
      };
      
      console.log('Store: Adding note:', newNote);
      
      set((state) => {
        const newState = {
          board: {
            ...state.board,
            notes: [...state.board.notes, newNote],
            updatedAt: new Date().toISOString()
          }
        };
        console.log('Store: New state notes count:', newState.board.notes.length);
        return newState;
      });
    },
    
    updateNote: (id, updates) => set((state) => ({
      board: {
        ...state.board,
        notes: state.board.notes.map(note => 
          note.id === id 
            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
            : note
        ),
        updatedAt: new Date().toISOString()
      }
    })),
    
    deleteNote: (id) => set((state) => ({
      board: {
        ...state.board,
        notes: state.board.notes.filter(note => note.id !== id),
        updatedAt: new Date().toISOString()
      }
    })),
    
    duplicateNote: (id) => {
      const note = get().getNoteById(id);
      if (!note) return;
      
      const duplicatedNote: Note = {
        ...note,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${note.title} (Copy)`,
        x: note.x + 20,
        y: note.y + 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        audio: [], // Don't duplicate audio
        primaryAudioId: undefined
      };
      
      set((state) => ({
        board: {
          ...state.board,
          notes: [...state.board.notes, duplicatedNote],
          updatedAt: new Date().toISOString()
        }
      }));
    },
    
    addRegion: (regionData) => {
      const newRegion: Region = {
        ...regionData,
        id: `region-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        zIndex: 0
      };
      
      set((state) => ({
        board: {
          ...state.board,
          regions: [...state.board.regions, newRegion],
          updatedAt: new Date().toISOString()
        }
      }));
    },
    
    updateRegion: (id, updates) => set((state) => ({
      board: {
        ...state.board,
        regions: state.board.regions.map(region => 
          region.id === id ? { ...region, ...updates } : region
        ),
        updatedAt: new Date().toISOString()
      }
    })),
    
    deleteRegion: (id) => set((state) => ({
      board: {
        ...state.board,
        notes: state.board.notes.map(note => 
          note.regionId === id ? { ...note, regionId: undefined } : note
        ),
        regions: state.board.regions.filter(region => region.id !== id),
        updatedAt: new Date().toISOString()
      }
    })),
    
    updateCanvas: (updates) => set((state) => ({
      canvas: { ...state.canvas, ...updates }
    })),
    
    setSelectedNote: (id) => set((state) => ({
      canvas: { ...state.canvas, selectedNoteId: id, selectedRegionId: undefined }
    })),
    
    setSelectedRegion: (id) => set((state) => ({
      canvas: { ...state.canvas, selectedRegionId: id, selectedNoteId: undefined }
    })),
    
    updateUI: (updates) => set((state) => ({
      ui: { ...state.ui, ...updates }
    })),
    
    setSearchFilters: (filters) => set({ searchFilters: filters }),
    
    updateRecording: (updates) => set((state) => ({
      recording: { ...state.recording, ...updates }
    })),
    
    getNoteById: (id) => {
      const state = get();
      return state.board.notes.find(note => note.id === id);
    },
    
    getRegionById: (id) => {
      const state = get();
      return state.board.regions.find(region => region.id === id);
    },
    
    getNotesInRegion: (regionId) => {
      const state = get();
      return state.board.notes.filter(note => note.regionId === regionId);
    },
    
    findRegionForPoint: (x, y) => {
      const state = get();
      return state.board.regions.find(region => {
        const { rect } = region;
        return x >= rect.x && x <= rect.x + rect.w && 
               y >= rect.y && y <= rect.y + rect.h;
      });
    }
  }))
);
