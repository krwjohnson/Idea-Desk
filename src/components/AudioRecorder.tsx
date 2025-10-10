import React, { useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Star,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { AudioTake } from '../types';

interface AudioRecorderProps {
  noteId: string;
  audioTakes: AudioTake[];
  primaryAudioId?: string;
  onSaveAudio: (audioTake: AudioTake, waveformData?: number[]) => void;
  onSetPrimary: (audioId: string) => void;
  onDeleteAudio: (audioId: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  noteId,
  audioTakes,
  primaryAudioId,
  onSaveAudio,
  onSetPrimary,
  onDeleteAudio,
}) => {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    pauseRecording,
    stopRecording,
    saveRecording,
    clearRecording,
    cleanup,
  } = useAudioRecorder();

  const {
    isPlaying,
    currentTime,
    volume,
    play,
    pause,
    stop,
    seek,
    setVolume,
    formatTime,
  } = useAudioPlayer();

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handlePauseRecording = () => {
    pauseRecording();
  };

  const handleSaveRecording = async () => {
    if (audioBlob) {
      const result = await saveRecording(noteId, audioTakes.length === 0);
      if (result) {
        onSaveAudio(result.audioTake, result.waveformData);
      }
    }
  };

  const handleClearRecording = () => {
    clearRecording();
  };

  const handlePlayTake = async (audioTake: AudioTake) => {
    await play(audioTake);
  };

  const handlePauseTake = () => {
    pause();
  };

  const handleStopTake = () => {
    stop();
  };

  const handleSetPrimary = (audioId: string) => {
    onSetPrimary(audioId);
  };

  const handleDeleteTake = (audioId: string) => {
    onDeleteAudio(audioId);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="console-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Audio Recording</h3>
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center space-x-4 mb-4">
            <div className="led recording"></div>
            <span className="text-sm">
              {isPaused ? 'Paused' : 'Recording'} - {formatDuration(duration)}
            </span>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="console-button active flex items-center space-x-2"
            >
              <Mic className="w-4 h-4" />
              <span>Record</span>
            </button>
          ) : (
            <>
              <button
                onClick={isPaused ? handleStartRecording : handlePauseRecording}
                className="console-button flex items-center space-x-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              
              <button
                onClick={handleStopRecording}
                className="console-button flex items-center space-x-2"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>

        {/* Recording Preview */}
        {audioBlob && audioUrl && (
          <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Recording Preview</span>
              <span className="text-sm text-gray-400">{formatDuration(duration)}</span>
            </div>
            
            <audio
              src={audioUrl}
              controls
              className="w-full mb-3"
            />
            
            <div className="flex space-x-2">
              <button
                onClick={handleSaveRecording}
                className="console-button active flex-1"
              >
                Save Recording
              </button>
              <button
                onClick={handleClearRecording}
                className="console-button flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audio Takes */}
      {audioTakes.length > 0 && (
        <div className="console-panel p-4">
          <h3 className="text-lg font-semibold mb-4">Audio Takes ({audioTakes.length}/3)</h3>
          
          <div className="space-y-3">
            {audioTakes.map((take) => (
              <div
                key={take.id}
                className={`p-3 rounded border ${
                  take.id === primaryAudioId 
                    ? 'border-accent bg-accent bg-opacity-10' 
                    : 'border-gray-600 bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      Take {audioTakes.indexOf(take) + 1}
                    </span>
                    {take.id === primaryAudioId && (
                      <Star className="w-4 h-4 text-accent fill-current" />
                    )}
                    <span className="text-xs text-gray-400">
                      {formatTime(take.durationSec)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSetPrimary(take.id)}
                      className={`p-1 rounded ${
                        take.id === primaryAudioId
                          ? 'text-accent'
                          : 'text-gray-400 hover:text-accent'
                      }`}
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTake(take.id)}
                      className="p-1 text-gray-400 hover:text-red-400 rounded"
                      title="Delete take"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => isPlaying ? handlePauseTake() : handlePlayTake(take)}
                    className="console-button flex items-center space-x-2"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  
                  <button
                    onClick={handleStopTake}
                    className="console-button"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                  
                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-accent h-1 rounded-full transition-all duration-100"
                      style={{ width: `${(currentTime / take.durationSec) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
