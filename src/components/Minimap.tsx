import React, { useRef } from 'react';
import { useBoardStore } from '../store/useBoardStore';

// Must match the canvas div dimensions in Canvas.tsx
const WORLD_W = 10000;
const WORLD_H = 8000;

interface MinimapProps {
  onNavigate: (positionX: number, positionY: number, scale: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({ onNavigate }) => {
  const { board, canvas } = useBoardStore();
  const minimapRef = useRef<HTMLDivElement>(null);

  // positionX/positionY from react-zoom-pan-pinch are CSS translate values.
  // World coordinate at viewport top-left = -positionX / scale, -positionY / scale
  const worldLeft = -canvas.panX / canvas.zoom;
  const worldTop = -canvas.panY / canvas.zoom;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  // Convert world coords to minimap percentage
  const toMiniX = (wx: number) => (wx / WORLD_W) * 100;
  const toMiniY = (wy: number) => (wy / WORLD_H) * 100;

  // Viewport indicator in minimap percentage
  const vpLeft = toMiniX(worldLeft);
  const vpTop = toMiniY(worldTop);
  const vpWidth = toMiniX(viewportW / canvas.zoom);
  const vpHeight = toMiniY(viewportH / canvas.zoom);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!minimapRef.current) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;

    // World position the user clicked on
    const worldX = fx * WORLD_W;
    const worldY = fy * WORLD_H;

    // Center that world position in the viewport
    const positionX = viewportW / 2 - worldX * canvas.zoom;
    const positionY = viewportH / 2 - worldY * canvas.zoom;
    onNavigate(positionX, positionY, canvas.zoom);
  };

  return (
    <div className="minimap absolute bottom-4 right-4 w-56 h-40 rounded border border-gray-600 overflow-hidden shadow-lg">
      {/* Clickable map area */}
      <div
        ref={minimapRef}
        className="w-full h-full relative bg-gray-900 cursor-crosshair"
        onClick={handleClick}
      >
        {/* Regions */}
        {board.regions.map(region => (
          <div
            key={region.id}
            className="absolute border rounded-sm"
            style={{
              left: `${toMiniX(region.rect.x)}%`,
              top: `${toMiniY(region.rect.y)}%`,
              width: `${toMiniX(region.rect.w)}%`,
              height: `${toMiniY(region.rect.h)}%`,
              borderColor: region.color,
              backgroundColor: `${region.color}30`,
            }}
          />
        ))}

        {/* Notes */}
        {board.notes.map(note => (
          <div
            key={note.id}
            className={`absolute w-1.5 h-1.5 rounded-sm ${
              note.color === 'yellow' ? 'bg-yellow-400' :
              note.color === 'pink' ? 'bg-pink-400' :
              note.color === 'blue' ? 'bg-blue-400' : 'bg-gray-400'
            }`}
            style={{
              left: `${toMiniX(note.x)}%`,
              top: `${toMiniY(note.y)}%`,
            }}
          />
        ))}

        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-white bg-white bg-opacity-10 pointer-events-none"
          style={{
            left: `${Math.max(0, vpLeft)}%`,
            top: `${Math.max(0, vpTop)}%`,
            width: `${Math.min(100, vpWidth)}%`,
            height: `${Math.min(100, vpHeight)}%`,
          }}
        />

        {/* Label */}
        <div className="absolute bottom-1 left-1 text-gray-500 text-xs pointer-events-none select-none">
          DESK
        </div>
      </div>
    </div>
  );
};
