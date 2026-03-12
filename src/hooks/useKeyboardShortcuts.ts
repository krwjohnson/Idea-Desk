import { useEffect } from 'react';
import { useBoardStore } from '../store/useBoardStore';

export const useKeyboardShortcuts = () => {
  const { 
    ui, 
    canvas, 
    board,
    updateUI, 
    updateCanvas, 
    addNote,
    addRegion,
    duplicateNote, 
    deleteNote,
    setSelectedNote,
    setSelectedRegion,
    updateBoard
  } = useBoardStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't fire shortcuts when typing in an input
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isTyping && event.key !== 'Escape') return;

      // Prevent default for our shortcuts
      const isModifierPressed = event.metaKey || event.ctrlKey;
      
      // Space bar for panning
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        updateUI({ isSpacePressed: true });
        updateCanvas({ isPanning: true });
      }
      
      // Search (Cmd/Ctrl + F)
      if (isModifierPressed && event.key === 'f') {
        event.preventDefault();
        updateUI({ showSearch: !ui.showSearch });
      }
      
      // Duplicate note (Cmd/Ctrl + D)
      if (isModifierPressed && event.key === 'd' && canvas.selectedNoteId) {
        event.preventDefault();
        duplicateNote(canvas.selectedNoteId);
      }
      
      // Delete selected note
      if (event.key === 'Delete' && canvas.selectedNoteId) {
        event.preventDefault();
        deleteNote(canvas.selectedNoteId);
        setSelectedNote(undefined);
      }
      
      // Escape to close modals
      if (event.key === 'Escape') {
        updateUI({ 
          showNoteModal: false, 
          showRegionEditor: false,
          showSearch: false 
        });
        setSelectedNote(undefined);
      }
      
      // Minimap toggle (M)
      if (event.key === 'm' && !isModifierPressed) {
        updateUI({ showMinimap: !ui.showMinimap });
      }
      
      // New note (N)
      if (event.key === 'n' && !isModifierPressed) {
        event.preventDefault();
        addNote({
          title: 'New Idea',
          x: 100,
          y: 100,
          width: 200,
          color: 'yellow',
          mood: []
        });
      }
      
      // New region (R)
      if (event.key === 'r' && !isModifierPressed) {
        event.preventDefault();
        addRegion({
          name: 'New Region',
          color: '#00ff9c',
          rect: { x: 200, y: 200, w: 300, h: 200 },
          zIndex: 0
        });
      }
      
      // Toggle grid (G)
      if (event.key === 'g' && !isModifierPressed) {
        event.preventDefault();
        updateBoard({
          settings: {
            ...board.settings,
            grid: {
              ...board.settings.grid,
              enabled: !board.settings.grid.enabled
            }
          }
        });
      }
      
      // Toggle grid snap (S)
      if (event.key === 's' && !isModifierPressed) {
        event.preventDefault();
        updateBoard({
          settings: {
            ...board.settings,
            grid: {
              ...board.settings.grid,
              snap: !board.settings.grid.snap
            }
          }
        });
      }
      
      // Center canvas (C)
      if (event.key === 'c' && !isModifierPressed) {
        event.preventDefault();
        updateCanvas({ panX: 0, panY: 0, zoom: 1 });
      }
      
      // Help (H or ?)
      if ((event.key === 'h' || event.key === '?') && !isModifierPressed) {
        event.preventDefault();
        // Could show a help modal here
        console.log('Keyboard Shortcuts:');
        console.log('Space - Pan canvas');
        console.log('Cmd/Ctrl+F - Search');
        console.log('Cmd/Ctrl+D - Duplicate note');
        console.log('Delete - Delete selected');
        console.log('Escape - Close modals');
        console.log('M - Toggle minimap');
        console.log('N - New note');
        console.log('R - New region');
        console.log('G - Toggle grid');
        console.log('S - Toggle snap');
        console.log('C - Center canvas');
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Release space bar panning
      if (event.code === 'Space') {
        updateUI({ isSpacePressed: false });
        updateCanvas({ isPanning: false });
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [ui, canvas, board, updateUI, updateCanvas, addNote, addRegion, duplicateNote, deleteNote, setSelectedNote, setSelectedRegion, updateBoard]);
};
