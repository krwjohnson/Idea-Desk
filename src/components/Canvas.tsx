import React, { useRef, useCallback, useMemo } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { useBoardStore } from '../store/useBoardStore';
import { NoteCard } from './NoteCard';
import { RegionLayer } from './RegionLayer';
import { filterNotes } from '../utils/searchUtils';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { 
    board, 
    canvas, 
    searchFilters,
    updateCanvas, 
    updateNote, 
    findRegionForPoint,
    setSelectedNote,
    setSelectedRegion 
  } = useBoardStore();

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter notes based on search criteria
  const filteredNotes = useMemo(() => {
    const filtered = filterNotes(board.notes, searchFilters);
    console.log('Canvas: Total notes:', board.notes.length, 'Filtered notes:', filtered.length);
    return filtered;
  }, [board.notes, searchFilters]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    updateCanvas({ isDragging: true });
    
    if (active.data.current?.type === 'note') {
      setSelectedNote(active.id as string);
    } else if (active.data.current?.type === 'region') {
      setSelectedRegion(active.id as string);
    }
  }, [updateCanvas, setSelectedNote, setSelectedRegion]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    updateCanvas({ isDragging: false });

    if (active.data.current?.type === 'note') {
      const noteId = active.id as string;
      const note = board.notes.find(n => n.id === noteId);
      
      if (note && delta) {
        const zoom = useBoardStore.getState().canvas.zoom;
        const newX = note.x + delta.x / zoom;
        const newY = note.y + delta.y / zoom;
        
        // Check if the note is dropped in a region
        const region = findRegionForPoint(newX, newY);
        
        updateNote(noteId, {
          x: newX,
          y: newY,
          regionId: region?.id
        });
      }
    }
    
    setSelectedNote(undefined);
    setSelectedRegion(undefined);
  }, [board.notes, updateCanvas, updateNote, findRegionForPoint, setSelectedNote, setSelectedRegion]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Only handle clicks on the canvas background, not on notes or regions
    if (event.target === canvasRef.current) {
      setSelectedNote(undefined);
      setSelectedRegion(undefined);
    }
  }, [setSelectedNote, setSelectedRegion]);

  const handleCanvasDoubleClick = useCallback((event: React.MouseEvent) => {
    // Only handle double-clicks on the canvas background
    if (event.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { canvas: { zoom } } = useBoardStore.getState();
      const x = (event.clientX - rect.left) / zoom;
      const y = (event.clientY - rect.top) / zoom;

      // Create a new note at the double-click position
      useBoardStore.getState().addNote({
        title: 'New Idea',
        x,
        y,
        width: 200,
        color: 'yellow',
        mood: []
      });
    }
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={canvasRef}
        className="relative"
        style={{
          width: '10000px',
          height: '8000px',
          cursor: canvas.isPanning ? 'grabbing' : 'default'
        }}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
      >
        {/* Regions layer (behind notes) */}
        <RegionLayer />

        {/* Notes layer */}
        {filteredNotes.map(note => (
          <NoteCard key={note.id} note={note} />
        ))}
        
        {/* Drag overlay */}
        <DragOverlay>
          {canvas.selectedNoteId ? (
            <NoteCard 
              note={filteredNotes.find(n => n.id === canvas.selectedNoteId)!} 
              isDragging 
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
