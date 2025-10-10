import JSZip from 'jszip';
import { get } from 'idb-keyval';
import { Board, ExportData, AudioTake } from '../types';

export const exportBoardAsJSON = async (board: Board): Promise<void> => {
  try {
    // Convert audio blobs to base64 for JSON export
    const boardWithAudioData = await convertAudioBlobsToBase64(board);
    
    const exportData: ExportData = {
      board: boardWithAudioData,
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idea-desk-board-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export board:', error);
    throw new Error('Failed to export board. Please try again.');
  }
};

export const exportBoardAsZip = async (board: Board): Promise<void> => {
  try {
    const zip = new JSZip();
    
    // Add board data as JSON
    zip.file('board.json', JSON.stringify({
      board: {
        ...board,
        notes: board.notes.map(note => ({
          ...note,
          audio: note.audio.map(audio => ({
            ...audio,
            blobRef: `audio/${audio.id}.webm` // Update path for zip structure
          }))
        }))
      },
      version: '1.0.0'
    }, null, 2));
    
    // Add audio files
    const audioFolder = zip.folder('audio');
    if (audioFolder) {
      for (const note of board.notes) {
        for (const audioTake of note.audio) {
          try {
            const audioBlob = await get<Blob>(audioTake.blobRef);
            if (audioBlob) {
              audioFolder.file(`${audioTake.id}.webm`, audioBlob);
            }
          } catch (error) {
            console.warn(`Failed to include audio ${audioTake.id}:`, error);
          }
        }
      }
    }
    
    // Generate and download zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idea-desk-board-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export board as zip:', error);
    throw new Error('Failed to export board as zip. Please try again.');
  }
};

export const importBoardFromJSON = async (file: File): Promise<Board> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as ExportData;
    
    if (!data.version || !data.board) {
      throw new Error('Invalid file format');
    }
    
    // Convert base64 audio data back to blobs
    const board = await convertBase64ToAudioBlobs(data.board);
    
    return board;
  } catch (error) {
    console.error('Failed to import board:', error);
    throw new Error('Failed to import board. Please check the file format.');
  }
};

export const importBoardFromZip = async (file: File): Promise<Board> => {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    // Read board data
    const boardFile = zipContent.file('board.json');
    if (!boardFile) {
      throw new Error('No board.json found in zip file');
    }
    
    const boardText = await boardFile.async('text');
    const data = JSON.parse(boardText) as ExportData;
    
    if (!data.version || !data.board) {
      throw new Error('Invalid board data in zip file');
    }
    
    // Import audio files
    const audioFolder = zipContent.folder('audio');
    if (audioFolder) {
      for (const note of data.board.notes) {
        for (const audioTake of note.audio) {
          try {
            const audioFile = audioFolder.file(`${audioTake.id}.webm`);
            if (audioFile) {
              const audioBlob = await audioFile.async('blob');
              // Store in IndexedDB
              const { set } = await import('idb-keyval');
              await set(audioTake.blobRef, audioBlob);
            }
          } catch (error) {
            console.warn(`Failed to import audio ${audioTake.id}:`, error);
          }
        }
      }
    }
    
    return data.board;
  } catch (error) {
    console.error('Failed to import board from zip:', error);
    throw new Error('Failed to import board from zip. Please check the file format.');
  }
};

// Helper function to convert audio blobs to base64 for JSON export
const convertAudioBlobsToBase64 = async (board: Board): Promise<Board> => {
  const { get } = await import('idb-keyval');
  
  const boardWithAudioData = {
    ...board,
    notes: await Promise.all(
      board.notes.map(async (note) => ({
        ...note,
        audio: await Promise.all(
          note.audio.map(async (audioTake) => {
            try {
              const audioBlob = await get<Blob>(audioTake.blobRef);
              if (audioBlob) {
                const base64 = await blobToBase64(audioBlob);
                return {
                  ...audioTake,
                  blobRef: base64
                };
              }
            } catch (error) {
              console.warn(`Failed to convert audio ${audioTake.id} to base64:`, error);
            }
            return audioTake;
          })
        )
      }))
    )
  };
  
  return boardWithAudioData;
};

// Helper function to convert base64 back to audio blobs for import
const convertBase64ToAudioBlobs = async (board: Board): Promise<Board> => {
  const { set } = await import('idb-keyval');
  
  const boardWithAudioBlobs = {
    ...board,
    notes: await Promise.all(
      board.notes.map(async (note) => ({
        ...note,
        audio: await Promise.all(
          note.audio.map(async (audioTake) => {
            try {
              // Check if blobRef is base64 data
              if (audioTake.blobRef.startsWith('data:')) {
                const audioBlob = base64ToBlob(audioTake.blobRef);
                const newBlobRef = `audio-${audioTake.id}`;
                await set(newBlobRef, audioBlob);
                return {
                  ...audioTake,
                  blobRef: newBlobRef
                };
              }
            } catch (error) {
              console.warn(`Failed to convert base64 audio ${audioTake.id} to blob:`, error);
            }
            return audioTake;
          })
        )
      }))
    )
  };
  
  return boardWithAudioBlobs;
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper function to convert base64 to blob
const base64ToBlob = (base64: string): Blob => {
  const [header, data] = base64.split(',');
  const mimeType = header.match(/data:([^;]+)/)?.[1] || 'audio/webm';
  const binaryString = atob(data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: mimeType });
};
