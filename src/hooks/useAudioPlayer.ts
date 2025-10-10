import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioTake } from '../types';

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

export const useAudioPlayer = () => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isLoading: false,
    error: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioTakeRef = useRef<AudioTake | null>(null);

  const loadAudio = useCallback(async (audioTake: AudioTake): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get audio blob from IndexedDB
      const { get } = await import('idb-keyval');
      const audioBlob = await get<Blob>(audioTake.blobRef);
      
      if (!audioBlob) {
        throw new Error('Audio data not found');
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      currentAudioTakeRef.current = audioTake;
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        setState(prev => ({ 
          ...prev, 
          duration: audio.duration,
          isLoading: false 
        }));
      });
      
      audio.addEventListener('timeupdate', () => {
        setState(prev => ({ ...prev, currentTime: audio.currentTime }));
      });
      
      audio.addEventListener('ended', () => {
        setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to play audio',
          isLoading: false,
          isPlaying: false 
        }));
      });
      
      audio.volume = state.volume;
      
      return true;
    } catch (error) {
      console.error('Error loading audio:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load audio',
        isLoading: false 
      }));
      return false;
    }
  }, [state.volume]);

  const play = useCallback(async (audioTake: AudioTake) => {
    if (currentAudioTakeRef.current?.id === audioTake.id && audioRef.current) {
      // Same audio, just play/pause
      if (state.isPlaying) {
        audioRef.current.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    } else {
      // Different audio, load and play
      const loaded = await loadAudio(audioTake);
      if (loaded && audioRef.current) {
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    }
  }, [state.isPlaying, loadAudio]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    setState(prev => ({ ...prev, volume: clampedVolume }));
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
    setVolume,
    formatTime,
    currentAudioTake: currentAudioTakeRef.current,
  };
};
