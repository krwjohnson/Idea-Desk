import React from 'react';
import { X } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';

export const RegionEditor: React.FC = () => {
  const { updateUI, canvas, getRegionById, updateRegion } = useBoardStore();

  const region = canvas.selectedRegionId ? getRegionById(canvas.selectedRegionId) : null;

  const handleClose = () => {
    updateUI({ showRegionEditor: false });
  };

  const update = (changes: Parameters<typeof updateRegion>[1]) => {
    if (region) updateRegion(region.id, changes);
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal-content w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-accent">Region Editor</h2>
            <button
              onClick={handleClose}
              className="console-button p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {region ? (
              <>
                {/* Region Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={region.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className="console-input w-full"
                    placeholder="Region name..."
                  />
                </div>

                {/* Region Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={region.color}
                      onChange={(e) => update({ color: e.target.value })}
                      className="w-12 h-8 rounded border border-gray-600"
                    />
                    <input
                      type="text"
                      value={region.color}
                      onChange={(e) => update({ color: e.target.value })}
                      className="console-input flex-1"
                      placeholder="#00ff9c"
                    />
                  </div>
                </div>

                {/* Position & Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">X Position</label>
                    <input
                      type="number"
                      value={region.rect.x}
                      onChange={(e) => update({ rect: { ...region.rect, x: Number(e.target.value) } })}
                      className="console-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Y Position</label>
                    <input
                      type="number"
                      value={region.rect.y}
                      onChange={(e) => update({ rect: { ...region.rect, y: Number(e.target.value) } })}
                      className="console-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Width</label>
                    <input
                      type="number"
                      value={region.rect.w}
                      onChange={(e) => update({ rect: { ...region.rect, w: Number(e.target.value) } })}
                      className="console-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Height</label>
                    <input
                      type="number"
                      value={region.rect.h}
                      onChange={(e) => update({ rect: { ...region.rect, h: Number(e.target.value) } })}
                      className="console-input w-full"
                    />
                  </div>
                </div>

                {/* Lock Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Lock Region</label>
                  <div
                    className={`console-toggle ${region.locked ? 'active' : ''}`}
                    onClick={() => update({ locked: !region.locked })}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No region selected</p>
                <p className="text-sm text-gray-500">
                  Click on a region in the canvas to edit its properties
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handleClose}
              className="console-button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
