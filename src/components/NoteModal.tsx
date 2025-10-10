import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';
import { AudioRecorder } from './AudioRecorder';
import { AudioTake, AudioId } from '../types';

export const NoteModal: React.FC = () => {
  const { ui, updateUI, canvas, getNoteById, updateNote, deleteNote } = useBoardStore();
  
  const note = canvas.selectedNoteId ? getNoteById(canvas.selectedNoteId) : null;
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    bpm: '',
    tuning: '',
    chordProgression: '',
    mood: [] as string[],
    text: '',
  });

  // Initialize form data when note changes
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        bpm: note.bpm?.toString() || '',
        tuning: note.tuning || '',
        chordProgression: note.chordProgression || '',
        mood: note.mood || [],
        text: note.text || '',
      });
    }
  }, [note]);

  if (!note) return null;

  const handleClose = () => {
    updateUI({ showNoteModal: false });
  };

  const handleSave = () => {
    updateNote(note.id, {
      title: formData.title,
      bpm: formData.bpm ? parseInt(formData.bpm) : undefined,
      tuning: formData.tuning || undefined,
      chordProgression: formData.chordProgression || undefined,
      mood: formData.mood,
      text: formData.text || undefined,
    });
    handleClose();
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMoodToggle = (mood: string) => {
    setFormData(prev => ({
      ...prev,
      mood: prev.mood.includes(mood)
        ? prev.mood.filter(m => m !== mood)
        : [...prev.mood, mood]
    }));
  };

  const handleSaveAudio = (audioTake: AudioTake, waveformData?: number[]) => {
    const updatedAudio = [...note.audio, audioTake];
    updateNote(note.id, { 
      audio: updatedAudio,
      primaryAudioId: note.primaryAudioId || audioTake.id,
      waveformData: waveformData || note.waveformData
    });
  };

  const handleSetPrimary = (audioId: AudioId) => {
    updateNote(note.id, { primaryAudioId: audioId });
  };

  const handleDeleteAudio = (audioId: AudioId) => {
    const updatedAudio = note.audio.filter(a => a.id !== audioId);
    const newPrimaryId = note.primaryAudioId === audioId 
      ? updatedAudio[0]?.id 
      : note.primaryAudioId;
    
    updateNote(note.id, { 
      audio: updatedAudio,
      primaryAudioId: newPrimaryId
    });
  };

  const handleDeleteNote = () => {
    if (note && window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteNote(note.id);
      handleClose();
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal-content w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-accent">Note Editor</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDeleteNote}
                className="console-button p-2 text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
                title="Delete note"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="console-button p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="console-input w-full"
                placeholder="Enter note title..."
              />
            </div>

            {/* Audio Recorder */}
            <AudioRecorder
              noteId={note.id}
              audioTakes={note.audio}
              primaryAudioId={note.primaryAudioId}
              onSaveAudio={handleSaveAudio}
              onSetPrimary={handleSetPrimary}
              onDeleteAudio={handleDeleteAudio}
            />

            {/* Metadata Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">BPM</label>
                <input
                  type="number"
                  value={formData.bpm}
                  onChange={(e) => handleInputChange('bpm', e.target.value)}
                  className="console-input w-full"
                  placeholder="120"
                  min="60"
                  max="300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tuning</label>
                <select 
                  value={formData.tuning}
                  onChange={(e) => handleInputChange('tuning', e.target.value)}
                  className="console-input w-full"
                >
                  <option value="">Select tuning...</option>
                  <option value="E Standard">E Standard</option>
                  <option value="Eb">Eb</option>
                  <option value="Drop D">Drop D</option>
                  <option value="Drop C#">Drop C#</option>
                  <option value="Drop A (7-string)">Drop A (7-string)</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Chord Progression</label>
              <textarea
                value={formData.chordProgression}
                onChange={(e) => handleInputChange('chordProgression', e.target.value)}
                className="console-input w-full h-20 resize-none"
                placeholder="e.g., Am - F - C - G"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mood Tags</label>
              <div className="flex flex-wrap gap-2">
                {['aggressive', 'melancholic', 'energetic', 'dark', 'melodic'].map(mood => (
                  <button
                    key={mood}
                    onClick={() => handleMoodToggle(mood)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      formData.mood.includes(mood)
                        ? 'bg-accent text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.text}
                onChange={(e) => handleInputChange('text', e.target.value)}
                className="console-input w-full h-24 resize-none"
                placeholder="Additional notes about this idea..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={handleClose}
              className="console-button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="console-button active"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
