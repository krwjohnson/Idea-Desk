import { useState, useRef, useCallback } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { AudioTake, AudioId } from '../types';

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export const useAudioRecorder = () => {
  const { updateRecording } = useBoardStore();
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate waveform data from audio blob
  const generateWaveformData = useCallback(async (audioBlob: Blob): Promise<number[]> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Downsample to ~500 samples for performance
          const channelData = audioBuffer.getChannelData(0);
          const samplesPerMinute = 500;
          const totalSamples = Math.min(samplesPerMinute, channelData.length);
          const step = Math.floor(channelData.length / totalSamples);
          
          const waveformData: number[] = [];
          for (let i = 0; i < totalSamples; i++) {
            const start = i * step;
            const end = Math.min(start + step, channelData.length);
            let max = 0;
            
            for (let j = start; j < end; j++) {
              max = Math.max(max, Math.abs(channelData[j]));
            }
            
            waveformData.push(Math.round(max * 100));
          }
          
          resolve(waveformData);
        } catch (error) {
          console.error('Error generating waveform:', error);
          resolve([]);
        }
      };
      
      fileReader.readAsArrayBuffer(audioBlob);
    });
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
        }));
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();
      
      setState(prev => ({ ...prev, isRecording: true, duration: 0 }));
      updateRecording({ isRecording: true, duration: 0 });
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, duration }));
        updateRecording({ duration });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to access microphone. Please check permissions.',
        isRecording: false 
      }));
    }
  }, [updateRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      if (state.isPaused) {
        mediaRecorderRef.current.resume();
        startTimeRef.current = Date.now() - (state.duration * 1000);
        setState(prev => ({ ...prev, isPaused: false }));
        updateRecording({ isPaused: false });
      } else {
        mediaRecorderRef.current.pause();
        setState(prev => ({ ...prev, isPaused: true }));
        updateRecording({ isPaused: true });
      }
    }
  }, [state.isRecording, state.isPaused, state.duration, updateRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isPaused: false 
      }));
      updateRecording({ isRecording: false, isPaused: false });
    }
  }, [state.isRecording, updateRecording]);

  const saveRecording = useCallback(async (noteId: string, isPrimary: boolean = false): Promise<{ audioTake: AudioTake; waveformData: number[] } | null> => {
    if (!state.audioBlob) return null;
    
    try {
      const audioId: AudioId = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const durationSec = state.duration;
      
      // Generate waveform data
      const waveformData = await generateWaveformData(state.audioBlob);
      
      // Store audio blob in IndexedDB
      const { set } = await import('idb-keyval');
      await set(`audio-${audioId}`, state.audioBlob);
      
      const audioTake: AudioTake = {
        id: audioId,
        noteId,
        blobRef: `audio-${audioId}`,
        durationSec,
        sampleRate: 44100,
        createdAt: new Date().toISOString(),
        isPrimary
      };
      
      // Clear the current recording
      setState(prev => ({
        ...prev,
        audioBlob: null,
        audioUrl: null,
        duration: 0,
      }));
      
      return { audioTake, waveformData };
    } catch (error) {
      console.error('Error saving recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to save recording' 
      }));
      return null;
    }
  }, [state.audioBlob, state.duration, generateWaveformData]);

  const clearRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      error: null,
    });
    
    updateRecording({
      isRecording: false,
      isPaused: false,
      duration: 0
    });
  }, [state.audioUrl, updateRecording]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
  }, [state.audioUrl]);

  return {
    ...state,
    startRecording,
    pauseRecording,
    stopRecording,
    saveRecording,
    clearRecording,
    cleanup,
  };
};
