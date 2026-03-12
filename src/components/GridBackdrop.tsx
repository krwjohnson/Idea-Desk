import React from 'react';
import { useBoardStore } from '../store/useBoardStore';

export const GridBackdrop: React.FC = () => {
  const { board, canvas } = useBoardStore();

  if (!board.settings.grid.enabled) return null;

  const cellSize = board.settings.grid.size * canvas.zoom;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(42, 47, 53, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(42, 47, 53, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
        backgroundPosition: `${canvas.panX % cellSize}px ${canvas.panY % cellSize}px`,
      }}
    />
  );
};
