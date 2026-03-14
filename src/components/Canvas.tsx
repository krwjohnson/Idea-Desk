import React, { useRef, useCallback, useMemo, useState } from 'react';
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
  const dragStartRef = useRef<Record<string, { x: number; y: number }> | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const {
    board,
    canvas,
    searchFilters,
    updateCanvas,
    updateNote,
    findRegionForPoint,
    setSelectedNote,
    setSelectedRegion,
    setSelectedNotes,
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
      const draggedNoteId = active.id as string;
      const { canvas: { selectedNoteIds }, board: b } = useBoardStore.getState();

      // If the dragged note is in the multi-selection, move all selected notes together
      const noteIdsToMove = selectedNoteIds.includes(draggedNoteId)
        ? selectedNoteIds
        : [draggedNoteId];

      const startPositions: Record<string, { x: number; y: number }> = {};
      for (const id of noteIdsToMove) {
        const note = b.notes.find(n => n.id === id);
        if (note) startPositions[id] = { x: note.x, y: note.y };
      }
      dragStartRef.current = startPositions;
      setSelectedNote(draggedNoteId);
    } else if (active.data.current?.type === 'region') {
      setSelectedRegion(active.id as string);
    }
  }, [updateCanvas, setSelectedNote, setSelectedRegion]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { active, delta } = event;
    if (active.data.current?.type === 'note' && dragStartRef.current) {
      const zoom = useBoardStore.getState().canvas.zoom;
      for (const [id, start] of Object.entries(dragStartRef.current)) {
        updateNote(id, {
          x: start.x + delta.x / zoom,
          y: start.y + delta.y / zoom,
        });
      }
    }
  }, [updateNote]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    updateCanvas({ isDragging: false });

    if (active.data.current?.type === 'note' && dragStartRef.current) {
      const zoom = useBoardStore.getState().canvas.zoom;
      for (const [id, start] of Object.entries(dragStartRef.current)) {
        const newX = start.x + delta.x / zoom;
        const newY = start.y + delta.y / zoom;
        const region = findRegionForPoint(newX, newY);
        updateNote(id, { x: newX, y: newY, regionId: region?.id });
      }
      dragStartRef.current = null;
    }

    setSelectedNote(undefined);
    setSelectedRegion(undefined);
  }, [updateCanvas, updateNote, findRegionForPoint, setSelectedNote, setSelectedRegion]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === canvasRef.current) {
      setSelectedNote(undefined);
      setSelectedRegion(undefined);
      if (!event.shiftKey) {
        setSelectedNotes([]);
      }
    }
  }, [setSelectedNote, setSelectedRegion, setSelectedNotes]);

  // Shift+drag on empty canvas draws a rubber-band selection box.
  // Uses pointer events (not mouse events) and setPointerCapture so tracking
  // continues reliably even when the pointer leaves the canvas element.
  const handleCanvasPointerDown = useCallback((event: React.PointerEvent) => {
    if (event.target !== canvasRef.current) return;
    if (!event.shiftKey) return;

    event.stopPropagation();
    event.preventDefault();
    canvasRef.current.setPointerCapture(event.pointerId);

    const { zoom, panX, panY } = useBoardStore.getState().canvas;
    const wrapper = canvasRef.current!.parentElement?.parentElement;
    const containerRect = wrapper?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const startX = (event.clientX - containerRect.left - panX) / zoom;
    const startY = (event.clientY - containerRect.top - panY) / zoom;

    let box = { x1: startX, y1: startY, x2: startX, y2: startY };
    setSelectionBox({ ...box });

    const handlePointerMove = (e: PointerEvent) => {
      const { zoom: z, panX: px, panY: py } = useBoardStore.getState().canvas;
      const endX = (e.clientX - containerRect.left - px) / z;
      const endY = (e.clientY - containerRect.top - py) / z;
      box = { x1: startX, y1: startY, x2: endX, y2: endY };
      setSelectionBox({ ...box });
    };

    const handlePointerUp = () => {
      const minX = Math.min(box.x1, box.x2);
      const maxX = Math.max(box.x1, box.x2);
      const minY = Math.min(box.y1, box.y2);
      const maxY = Math.max(box.y1, box.y2);

      if (maxX - minX > 5 || maxY - minY > 5) {
        const NOTE_HEIGHT = 160;
        const { board: b } = useBoardStore.getState();
        const ids = b.notes
          .filter(n =>
            n.x < maxX && n.x + n.width > minX &&
            n.y < maxY && n.y + NOTE_HEIGHT > minY
          )
          .map(n => n.id);
        useBoardStore.getState().setSelectedNotes(ids);
      }

      setSelectionBox(null);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, []);

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
        onPointerDown={handleCanvasPointerDown}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
      >
        {/* Regions layer (behind notes) */}
        <RegionLayer />

        {/* Notes layer */}
        {filteredNotes.map(note => (
          <NoteCard key={note.id} note={note} />
        ))}

        {/* Rubber-band selection box */}
        {selectionBox && (() => {
          const minX = Math.min(selectionBox.x1, selectionBox.x2);
          const minY = Math.min(selectionBox.y1, selectionBox.y2);
          const w = Math.abs(selectionBox.x2 - selectionBox.x1);
          const h = Math.abs(selectionBox.y2 - selectionBox.y1);
          return (
            <div
              style={{
                position: 'absolute',
                left: minX,
                top: minY,
                width: w,
                height: h,
                border: '1px dashed #00ff9c',
                backgroundColor: 'rgba(0, 255, 156, 0.05)',
                pointerEvents: 'none',
                zIndex: 999,
              }}
            />
          );
        })()}
      </div>
    </DndContext>
  );
};
