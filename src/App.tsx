import React, { useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useBoardStore } from './store/useBoardStore';
import { TopBar } from './components/TopBar';
import { Canvas } from './components/Canvas';
import { NoteModal } from './components/NoteModal';
import { RegionEditor } from './components/RegionEditor';
import { WelcomeModal } from './components/WelcomeModal';
import { Minimap } from './components/Minimap';
import { GridBackdrop } from './components/GridBackdrop';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePersistence } from './hooks/usePersistence';

const DISMISSED_KEY = 'idea-desk-welcome-dismissed';

function App() {
  const { ui, updateCanvas, updateUI } = useBoardStore();

  // Show welcome modal on first visit (unless previously dismissed)
  useEffect(() => {
    if (!localStorage.getItem(DISMISSED_KEY)) {
      updateUI({ showWelcomeModal: true });
    }
  }, [updateUI]);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize persistence
  usePersistence();

  const handleNavigate = (positionX: number, positionY: number, scale: number) => {
    transformRef.current?.setTransform(positionX, positionY, scale);
  };

  return (
    <div className="w-full h-screen bg-bg text-white overflow-hidden flex flex-col">
      <TopBar />

      <div className="relative flex-1 overflow-hidden">
        <GridBackdrop />
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.1}
          maxScale={3}
          limitToBounds={false}
          centerOnInit={false}
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: true }}
          panning={{ excluded: ['sticky-note', 'region', 'console-button', 'resize-handle'] }}
          onTransformed={(_ref, state) => {
            updateCanvas({
              zoom: state.scale,
              panX: state.positionX,
              panY: state.positionY,
            });
          }}
        >
          <TransformComponent
            wrapperClass="w-full h-full"
            contentClass="w-full h-full"
          >
            <Canvas />
          </TransformComponent>
        </TransformWrapper>

        {ui.showMinimap && <Minimap onNavigate={handleNavigate} />}
      </div>

      {ui.showNoteModal && <NoteModal />}
      {ui.showRegionEditor && <RegionEditor />}
      {ui.showWelcomeModal && <WelcomeModal />}
    </div>
  );
}

export default App;
