import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Note } from '../types';
import { useBoardStore } from '../store/useBoardStore';
import { Play, Pause, Volume2 } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  isDragging?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, isDragging = false }) => {
  const { setSelectedNote, updateUI } = useBoardStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDndDragging,
  } = useDraggable({
    id: note.id,
    data: {
      type: 'note',
      note,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only open modal if not dragging
    if (!isDndDragging) {
      setSelectedNote(note.id);
      updateUI({ showNoteModal: true });
    }
  };

  const primaryAudio = note.audio.find(a => a.id === note.primaryAudioId);
  const hasAudio = note.audio.length > 0;

  return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          position: 'absolute',
          left: note.x,
          top: note.y,
          width: note.width,
          zIndex: isDragging || isDndDragging ? 1000 : 1,
          opacity: isDragging || isDndDragging ? 0.8 : 1,
        }}
        className={`sticky-note ${note.color} p-3 select-none`}
        onClick={handleClick}
      >
        {/* Drag handle */}
        <div
          className="absolute top-1 left-1 w-4 h-4 cursor-grab active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <div className="w-full h-full bg-gray-400 bg-opacity-30 rounded"></div>
        </div>
      {/* Note header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-gray-800 truncate">
          {note.title}
        </h3>
        {hasAudio && (
          <div className="flex items-center space-x-1">
            <Volume2 className="w-3 h-3 text-gray-600" />
            {primaryAudio && (
              <span className="text-xs text-gray-600">
                {Math.round(primaryAudio.durationSec)}s
              </span>
            )}
          </div>
        )}
      </div>

      {/* Waveform preview */}
      {note.waveformData && note.waveformData.length > 0 && (
        <div className="waveform mb-2">
          {note.waveformData.map((height, index) => (
            <div
              key={index}
              className="waveform-bar"
              style={{
                left: `${(index / note.waveformData!.length) * 100}%`,
                width: `${100 / note.waveformData!.length}%`,
                height: `${Math.max(height, 5)}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Metadata chips */}
      <div className="flex flex-wrap gap-1 mb-2">
        {note.bpm && (
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
            {note.bpm} BPM
          </span>
        )}
        {note.tuning && (
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
            {note.tuning}
          </span>
        )}
        {note.mood.slice(0, 2).map(mood => (
          <span key={mood} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
            {mood}
          </span>
        ))}
        {note.mood.length > 2 && (
          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
            +{note.mood.length - 2}
          </span>
        )}
      </div>

      {/* Region indicator */}
      {note.regionId && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border border-white"></div>
      )}

      {/* Audio takes indicator */}
      {note.audio.length > 1 && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent2 rounded-full border border-white flex items-center justify-center">
          <span className="text-xs text-black font-bold">{note.audio.length}</span>
        </div>
      )}
    </div>
  );
};
