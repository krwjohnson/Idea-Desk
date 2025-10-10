import React, { useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useBoardStore } from './store/useBoardStore';
import { TopBar } from './components/TopBar';
import { Canvas } from './components/Canvas';
import { NoteModal } from './components/NoteModal';
import { RegionEditor } from './components/RegionEditor';
import { Minimap } from './components/Minimap';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePersistence } from './hooks/usePersistence';

function App() {
  const { ui, updateUI } = useBoardStore();
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();
  
  // Initialize persistence
  usePersistence();

  return (
    <div className="w-full h-full bg-bg text-white overflow-hidden">
      <TopBar />
      
      <div className="relative w-full h-full">
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={3}
          centerOnInit={false}
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: true }}
          panning={{ disabled: !ui.isSpacePressed }}
          onPanning={(ref, event) => {
            if (!ui.isSpacePressed) {
              event.stopPropagation();
            }
          }}
        >
          <TransformComponent
            wrapperClass="w-full h-full"
            contentClass="w-full h-full"
          >
            <Canvas />
          </TransformComponent>
        </TransformWrapper>
        
        {ui.showMinimap && <Minimap />}
      </div>
      
      {ui.showNoteModal && <NoteModal />}
      {ui.showRegionEditor && <RegionEditor />}
    </div>
  );
}

export default App;
