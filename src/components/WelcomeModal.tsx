import React, { useState } from 'react';
import { X, Music2, Layers, Mic, Search, Download, Keyboard } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';
import { version } from '../../package.json';

const DISMISSED_KEY = 'idea-desk-welcome-dismissed';

const features = [
  {
    icon: <Music2 className="w-4 h-4" />,
    label: 'Sticky Notes',
    desc: 'Capture song ideas as coloured notes anywhere on the infinite canvas.',
  },
  {
    icon: <Layers className="w-4 h-4" />,
    label: 'Regions',
    desc: 'Group notes into labelled zones — Demo, Recorded, Finished, whatever works.',
  },
  {
    icon: <Mic className="w-4 h-4" />,
    label: 'Audio Takes',
    desc: 'Record multiple takes directly on a note with waveform previews.',
  },
  {
    icon: <Search className="w-4 h-4" />,
    label: 'Smart Search',
    desc: 'Filter by mood:, bpm:, region:, has:audio, or plain text instantly.',
  },
  {
    icon: <Download className="w-4 h-4" />,
    label: 'Export / Import',
    desc: 'Save your desk as JSON or a ZIP with all audio included.',
  },
  {
    icon: <Keyboard className="w-4 h-4" />,
    label: 'Keyboard-first',
    desc: 'N · R · G · S · M · C and Shift+drag lasso for power users.',
  },
];

const shortcuts = [
  ['N', 'New note'],
  ['R', 'New region'],
  ['G', 'Toggle grid'],
  ['S', 'Toggle snap'],
  ['M', 'Toggle minimap'],
  ['C', 'Reset view'],
  ['⌘D', 'Duplicate note'],
  ['⌫', 'Delete selected'],
  ['Shift+drag', 'Lasso select'],
  ['Double-click', 'New note here'],
];

export const WelcomeModal: React.FC = () => {
  const { updateUI } = useBoardStore();
  const [dontShow, setDontShow] = useState(false);

  const handleClose = () => {
    if (dontShow) {
      localStorage.setItem(DISMISSED_KEY, 'true');
    }
    updateUI({ showWelcomeModal: false });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full mx-4 overflow-hidden"
        style={{
          maxWidth: 680,
          background: 'linear-gradient(160deg, #1b1e22 0%, #141618 100%)',
          border: '1px solid #2a2f35',
          borderRadius: 14,
          boxShadow: '0 0 0 1px #00ff9c18, 0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Scanline overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
            pointerEvents: 'none',
            borderRadius: 14,
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div
            style={{
              padding: '20px 24px 18px',
              borderBottom: '1px solid #2a2f35',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#00ff9c',
                    fontFamily: 'inherit',
                  }}
                >
                  IDEA DESK
                </h1>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#4a5060',
                    letterSpacing: '0.04em',
                    fontFamily: 'monospace',
                  }}
                >
                  v{version}
                </span>
              </div>
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 13,
                  color: '#8a9099',
                  lineHeight: 1.5,
                }}
              >
                An infinite canvas for capturing, organising, and reviewing song ideas —
                right in your browser, no account needed.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="console-button"
              style={{ padding: '6px 8px', flexShrink: 0 }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px', display: 'flex', gap: 20 }}>
            {/* Features */}
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#4a5060',
                }}
              >
                What's included
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {features.map((f) => (
                  <div key={f.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: 'rgba(0,255,156,0.08)',
                        border: '1px solid rgba(0,255,156,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#00ff9c',
                        flexShrink: 0,
                      }}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#e0e4ea',
                          lineHeight: 1.3,
                        }}
                      >
                        {f.label}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5a6070', lineHeight: 1.4 }}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: 1,
                background: '#2a2f35',
                flexShrink: 0,
                alignSelf: 'stretch',
              }}
            />

            {/* Shortcuts */}
            <div style={{ width: 180, flexShrink: 0 }}>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#4a5060',
                }}
              >
                Shortcuts
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {shortcuts.map(([key, label]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'monospace',
                        background: '#0e1012',
                        border: '1px solid #2a2f35',
                        borderRadius: 4,
                        padding: '2px 6px',
                        color: '#00ff9c',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {key}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#5a6070',
                        flex: 1,
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid #2a2f35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                style={{
                  width: 14,
                  height: 14,
                  accentColor: '#00ff9c',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: 12, color: '#5a6070' }}>Don't show this again</span>
            </label>

            <button
              onClick={handleClose}
              className="console-button"
              style={{
                background: '#00ff9c',
                color: '#0a0c0e',
                fontWeight: 700,
                border: 'none',
                letterSpacing: '0.08em',
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
