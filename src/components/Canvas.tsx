import React, { useRef, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useBoardStore } from '../store/useBoardStore';
import { NoteCard } from './NoteCard';
import { RegionLayer } from './RegionLayer';
import { filterNotes } from '../utils/searchUtils';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ noteId: string; x: number; y: number } | null>(null);
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
      const note = board.notes.find(n => n.id === active.id);
      if (note) {
        dragStartRef.current = { noteId: note.id, x: note.x, y: note.y };
      }
      setSelectedNote(active.id as string);
    } else if (active.data.current?.type === 'region') {
      setSelectedRegion(active.id as string);
    }
  }, [board.notes, updateCanvas, setSelectedNote, setSelectedRegion]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { active, delta } = event;
    if (active.data.current?.type === 'note' && dragStartRef.current) {
      const zoom = useBoardStore.getState().canvas.zoom;
      updateNote(dragStartRef.current.noteId, {
        x: dragStartRef.current.x + delta.x / zoom,
        y: dragStartRef.current.y + delta.y / zoom,
      });
    }
  }, [updateNote]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    updateCanvas({ isDragging: false });

    if (active.data.current?.type === 'note' && dragStartRef.current) {
      const zoom = useBoardStore.getState().canvas.zoom;
      const newX = dragStartRef.current.x + delta.x / zoom;
      const newY = dragStartRef.current.y + delta.y / zoom;
      const region = findRegionForPoint(newX, newY);
      updateNote(dragStartRef.current.noteId, {
        x: newX,
        y: newY,
        regionId: region?.id,
      });
      dragStartRef.current = null;
    }

    setSelectedNote(undefined);
    setSelectedRegion(undefined);
  }, [updateCanvas, updateNote, findRegionForPoint, setSelectedNote, setSelectedRegion]);

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
      const { zoom, panX, panY } = useBoardStore.getState().canvas;
      // Use the outer wrapper (not the transformed canvas) for a stable bounding rect
      const wrapper = canvasRef.current.parentElement?.parentElement;
      const containerRect = wrapper?.getBoundingClientRect() ?? { left: 0, top: 0 };
      const x = (event.clientX - containerRect.left - panX) / zoom;
      const y = (event.clientY - containerRect.top - panY) / zoom;

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
      onDragMove={handleDragMove}
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
        
      </div>
    </DndContext>
  );
};
