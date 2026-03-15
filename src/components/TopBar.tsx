import React, { useState } from 'react';
import { version } from '../../package.json';
import {
  Plus,
  Search,
  Grid3X3,
  Download,
  Upload,
  Save
} from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';
import { parseSearchQuery } from '../utils/searchUtils';
import { exportBoardAsJSON, exportBoardAsZip, importBoardFromJSON, importBoardFromZip } from '../utils/exportUtils';

export const TopBar: React.FC = () => {
  const {
    board,
    canvas,
    ui,
    updateBoard,
    updateUI,
    addNote,
    addRegion,
    setSearchFilters
  } = useBoardStore();
  
  const [searchQuery, setSearchQuery] = useState('');

  const getViewportCenter = () => {
    const { zoom, panX, panY } = canvas;
    const topbarHeight = 72;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight - topbarHeight;
    return {
      x: (-panX + viewportW / 2) / zoom,
      y: (-panY + viewportH / 2) / zoom,
    };
  };

  const handleAddNote = () => {
    const { x, y } = getViewportCenter();
    addNote({
      title: 'New Idea',
      x: x - 100,
      y: y - 60,
      width: 200,
      color: 'yellow',
      mood: []
    });
  };

  const handleAddRegion = () => {
    const { x, y } = getViewportCenter();
    addRegion({
      name: 'New Region',
      color: '#00ff9c',
      rect: { x: x - 150, y: y - 100, w: 300, h: 200 },
      zIndex: 0
    });
  };

  const handleToggleGrid = () => {
    updateBoard({
      settings: {
        ...board.settings,
        grid: {
          ...board.settings.grid,
          enabled: !board.settings.grid.enabled
        }
      }
    });
  };

  const handleToggleSnap = () => {
    updateBoard({
      settings: {
        ...board.settings,
        grid: {
          ...board.settings.grid,
          snap: !board.settings.grid.snap
        }
      }
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filters = parseSearchQuery(query);
    setSearchFilters(filters);
  };

  const handleExport = async () => {
    try {
      await exportBoardAsJSON(board);
    } catch (error) {
      alert('Failed to export board. Please try again.');
    }
  };

  const handleExportZip = async () => {
    try {
      await exportBoardAsZip(board);
    } catch (error) {
      alert('Failed to export board as zip. Please try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let importedBoard;
      
      if (file.name.endsWith('.zip')) {
        importedBoard = await importBoardFromZip(file);
      } else if (file.name.endsWith('.json')) {
        importedBoard = await importBoardFromJSON(file);
      } else {
        throw new Error('Unsupported file format. Please use .json or .zip files.');
      }
      
      updateBoard(importedBoard);
    } catch (error) {
      console.error('Failed to import board:', error);
      alert(`Failed to import board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="console-panel p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => updateUI({ showWelcomeModal: true })}
            className="text-left group"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            title="About Idea Desk"
          >
            <h1 className="text-xl font-bold text-accent group-hover:opacity-80 transition-opacity">IDEA DESK</h1>
            <p className="text-xs text-gray-500">v{version}</p>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddNote}
              className="console-button flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Note</span>
            </button>
            
            <button
              onClick={handleAddRegion}
              className="console-button flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Region</span>
            </button>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notes, mood:aggressive, bpm:140, region:Demo, has:audio..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="console-input w-full pl-12 pr-4"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Grid controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleGrid}
              className={`console-button ${board.settings.grid.enabled ? 'active' : ''}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleToggleSnap}
              className={`console-button ${board.settings.grid.snap ? 'active' : ''}`}
            >
              Snap
            </button>
          </div>

          {/* Save indicator */}
          {ui.lastSaved && (
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Save className="w-4 h-4" />
              <span>Saved {new Date(ui.lastSaved).toLocaleTimeString()}</span>
            </div>
          )}

          {/* Export/Import */}
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <button className="console-button flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-panel border border-gray-600 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 rounded-t"
                >
                  Export as JSON
                </button>
                <button
                  onClick={handleExportZip}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 rounded-b"
                >
                  Export as ZIP
                </button>
              </div>
            </div>
            
            <label className="console-button flex items-center space-x-2 cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json,.zip"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

        </div>
      </div>
    </div>
  );
};
