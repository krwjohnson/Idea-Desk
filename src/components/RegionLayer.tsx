import React, { useState, useRef, useCallback } from 'react';
import { useBoardStore } from '../store/useBoardStore';

interface ResizeHandleProps {
  position: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  onResize: (deltaX: number, deltaY: number, position: string) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ position, onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      onResize(deltaX, deltaY, position);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, onResize]);

  const getCursor = () => {
    switch (position) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      default:
        return 'default';
    }
  };

  const getPosition = () => {
    switch (position) {
      case 'n':
        return { top: -4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8 };
      case 's':
        return { bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8 };
      case 'e':
        return { right: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8 };
      case 'w':
        return { left: -4, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8 };
      case 'ne':
        return { top: -4, right: -4, width: 8, height: 8 };
      case 'nw':
        return { top: -4, left: -4, width: 8, height: 8 };
      case 'se':
        return { bottom: -4, right: -4, width: 8, height: 8 };
      case 'sw':
        return { bottom: -4, left: -4, width: 8, height: 8 };
      default:
        return {};
    }
  };

  return (
    <div
      className="absolute bg-accent border border-white rounded-sm opacity-80 hover:opacity-100"
      style={{
        ...getPosition(),
        cursor: getCursor(),
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export const RegionLayer: React.FC = () => {
  const { board, canvas, setSelectedRegion, updateRegion } = useBoardStore();

  const handleRegionClick = (regionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRegion(regionId);
  };

  const handleResize = useCallback((regionId: string, deltaX: number, deltaY: number, position: string) => {
    const region = board.regions.find(r => r.id === regionId);
    if (!region) return;

    let newRect = { ...region.rect };

    switch (position) {
      case 'n':
        newRect.y += deltaY;
        newRect.h -= deltaY;
        break;
      case 's':
        newRect.h += deltaY;
        break;
      case 'e':
        newRect.w += deltaX;
        break;
      case 'w':
        newRect.x += deltaX;
        newRect.w -= deltaX;
        break;
      case 'ne':
        newRect.y += deltaY;
        newRect.h -= deltaY;
        newRect.w += deltaX;
        break;
      case 'nw':
        newRect.x += deltaX;
        newRect.y += deltaY;
        newRect.w -= deltaX;
        newRect.h -= deltaY;
        break;
      case 'se':
        newRect.w += deltaX;
        newRect.h += deltaY;
        break;
      case 'sw':
        newRect.x += deltaX;
        newRect.w -= deltaX;
        newRect.h += deltaY;
        break;
    }

    // Ensure minimum size
    if (newRect.w < 50) newRect.w = 50;
    if (newRect.h < 50) newRect.h = 50;

    updateRegion(regionId, { rect: newRect });
  }, [board.regions, updateRegion]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {board.regions.map(region => (
        <div
          key={region.id}
          className={`region ${canvas.selectedRegionId === region.id ? 'selected' : ''} ${region.locked ? 'locked' : ''}`}
          style={{
            left: region.rect.x,
            top: region.rect.y,
            width: region.rect.w,
            height: region.rect.h,
            borderColor: region.color,
            backgroundColor: `${region.color}10`,
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
          onClick={(e) => handleRegionClick(region.id, e)}
        >
          {/* Region label */}
          <div 
            className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded"
            style={{
              backgroundColor: region.color,
              color: '#000000',
            }}
          >
            {region.name}
          </div>
          
          {/* Lock indicator */}
          {region.locked && (
            <div className="absolute top-2 right-2 w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-sm"></div>
            </div>
          )}

          {/* Resize handles - only show when selected and not locked */}
          {canvas.selectedRegionId === region.id && !region.locked && (
            <>
              <ResizeHandle position="n" onResize={(dx, dy, pos) => handleResize(region.id, dx, dy, pos)} />
              <ResizeHandle position="s" onResize={(dx, dy, pos) => handleResize(region.id, dx, dy, pos)} />
              <ResizeHandle position="e" onResize={(dx, dy, pos) => handleResize(region.id, dx, dy, pos)} />
              <ResizeHandle position="w" onResize={(dx, dy, pos) => handleResize(region.id, dx, dy, pos)} />
              <ResizeHandle position="ne" onResize={(dx, dy, pos) => handleResize(region.id, dx, dy, pos)} />
              <ResizeHandle position="nw" onResize={(dx, dy, pos) => handleResize(region.id, dx, dy, pos)} />
              <ResizeHandle position="se" onResize={(dx, dy, pos) => handleResize(region.id, dx, dy, pos)} />
              <ResizeHandle position="sw" onResize={(dx, dy, pos) => handleResize(region.id, dx, dy, pos)} />
            </>
          )}
        </div>
      ))}
    </div>
  );
};
