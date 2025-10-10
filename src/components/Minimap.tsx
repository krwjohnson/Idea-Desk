import React from 'react';
import { useBoardStore } from '../store/useBoardStore';

export const Minimap: React.FC = () => {
  const { board, canvas, updateCanvas } = useBoardStore();

  const handleMinimapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2000 - 1000; // Scale to canvas coordinates
    const y = ((event.clientY - rect.top) / rect.height) * 2000 - 1000;
    
    updateCanvas({
      panX: -x,
      panY: -y
    });
  };

  return (
    <div className="minimap absolute bottom-4 right-4 w-48 h-32 p-2">
      <div className="w-full h-full relative bg-gray-800 rounded border border-gray-600">
        {/* Canvas representation */}
        <div 
          className="w-full h-full relative cursor-pointer"
          onClick={handleMinimapClick}
        >
          {/* Regions */}
          {board.regions.map(region => (
            <div
              key={region.id}
              className="absolute border border-accent bg-accent bg-opacity-20"
              style={{
                left: `${(region.rect.x + 1000) / 20}%`,
                top: `${(region.rect.y + 1000) / 20}%`,
                width: `${region.rect.w / 20}%`,
                height: `${region.rect.h / 20}%`,
              }}
            />
          ))}
          
          {/* Notes */}
          {board.notes.map(note => (
            <div
              key={note.id}
              className={`absolute w-2 h-2 rounded-sm ${
                note.color === 'yellow' ? 'bg-yellow-400' :
                note.color === 'pink' ? 'bg-pink-400' :
                note.color === 'blue' ? 'bg-blue-400' : 'bg-gray-400'
              }`}
              style={{
                left: `${(note.x + 1000) / 20}%`,
                top: `${(note.y + 1000) / 20}%`,
              }}
            />
          ))}
          
          {/* Viewport indicator */}
          <div
            className="absolute border-2 border-white bg-white bg-opacity-20"
            style={{
              left: `${(-canvas.panX + 1000) / 20}%`,
              top: `${(-canvas.panY + 1000) / 20}%`,
              width: `${(window.innerWidth / canvas.zoom) / 20}%`,
              height: `${(window.innerHeight / canvas.zoom) / 20}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
