import { useEffect } from 'react';
import { get, set, del, clear } from 'idb-keyval';
import { useBoardStore } from '../store/useBoardStore';
import { Board } from '../types';

const BOARD_KEY = 'idea-desk-board';
const SNAPSHOTS_KEY = 'idea-desk-snapshots';

export const usePersistence = () => {
  const { board, updateBoard, updateUI } = useBoardStore();

  // Load board from IndexedDB on mount
  useEffect(() => {
    const loadBoard = async () => {
      try {
        const savedBoard = await get<Board>(BOARD_KEY);
        console.log('Loading board from IndexedDB:', savedBoard);
        if (savedBoard) {
          updateBoard(savedBoard);
        } else {
          console.log('No saved board found, using default');
        }
      } catch (error) {
        console.error('Failed to load board from IndexedDB:', error);
      }
    };

    loadBoard();
  }, [updateBoard]);

  // Auto-save board changes
  useEffect(() => {
    const saveBoard = async () => {
      try {
        await set(BOARD_KEY, board);
        updateUI({ lastSaved: new Date().toISOString() });
      } catch (error) {
        console.error('Failed to save board to IndexedDB:', error);
      }
    };

    // Debounce saves to avoid too frequent writes
    const timeoutId = setTimeout(saveBoard, 1000);
    return () => clearTimeout(timeoutId);
  }, [board, updateUI]);

  // Save snapshot with timestamp
  const saveSnapshot = async () => {
    try {
      const snapshots = await get<Array<{ board: Board; timestamp: string }>>(SNAPSHOTS_KEY) || [];
      
      // Add new snapshot
      snapshots.unshift({
        board: { ...board },
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 10 snapshots
      if (snapshots.length > 10) {
        snapshots.splice(10);
      }
      
      await set(SNAPSHOTS_KEY, snapshots);
      updateUI({ lastSaved: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to save snapshot:', error);
    }
  };

  // Load snapshot
  const loadSnapshot = async (timestamp: string) => {
    try {
      const snapshots = await get<Array<{ board: Board; timestamp: string }>>(SNAPSHOTS_KEY) || [];
      const snapshot = snapshots.find(s => s.timestamp === timestamp);
      
      if (snapshot) {
        updateBoard(snapshot.board);
      }
    } catch (error) {
      console.error('Failed to load snapshot:', error);
    }
  };

  // Clear all data
  const clearAllData = async () => {
    try {
      await clear();
      updateBoard({
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
      });
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  return {
    saveSnapshot,
    loadSnapshot,
    clearAllData
  };
};
