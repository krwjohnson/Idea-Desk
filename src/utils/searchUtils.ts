import { Note, SearchFilters } from '../types';

export const filterNotes = (notes: Note[], filters: SearchFilters): Note[] => {
  if (!filters || Object.keys(filters).length === 0) {
    return notes;
  }

  return notes.filter(note => {
    // Title filter
    if (filters.title) {
      const titleMatch = note.title.toLowerCase().includes(filters.title.toLowerCase());
      if (!titleMatch) return false;
    }

    // Mood filter
    if (filters.mood && filters.mood.length > 0) {
      const moodMatch = filters.mood.some(mood => 
        note.mood.some(noteMood => 
          noteMood.toLowerCase().includes(mood.toLowerCase())
        )
      );
      if (!moodMatch) return false;
    }

    // Region filter
    if (filters.region) {
      const regionMatch = note.regionId === filters.region;
      if (!regionMatch) return false;
    }

    // Has audio filter
    if (filters.hasAudio !== undefined) {
      const hasAudio = note.audio.length > 0;
      if (hasAudio !== filters.hasAudio) return false;
    }

    // BPM range filter
    if (filters.bpmMin !== undefined && note.bpm) {
      if (note.bpm < filters.bpmMin) return false;
    }

    if (filters.bpmMax !== undefined && note.bpm) {
      if (note.bpm > filters.bpmMax) return false;
    }

    return true;
  });
};

export const parseSearchQuery = (query: string): SearchFilters => {
  const filters: SearchFilters = {};
  
  if (!query.trim()) {
    return filters;
  }

  // Parse special syntax like "mood:aggressive bpm:140 region:Recorded"
  const parts = query.split(/\s+/);
  
  for (const part of parts) {
    if (part.includes(':')) {
      const [key, value] = part.split(':', 2);
      
      switch (key.toLowerCase()) {
        case 'mood':
          if (!filters.mood) filters.mood = [];
          filters.mood.push(value);
          break;
        case 'bpm':
          const bpm = parseInt(value);
          if (!isNaN(bpm)) {
            if (value.startsWith('>=')) {
              filters.bpmMin = bpm;
            } else if (value.startsWith('<=')) {
              filters.bpmMax = bpm;
            } else if (value.startsWith('>')) {
              filters.bpmMin = bpm + 1;
            } else if (value.startsWith('<')) {
              filters.bpmMax = bpm - 1;
            } else {
              // Exact BPM match (within ±5)
              filters.bpmMin = bpm - 5;
              filters.bpmMax = bpm + 5;
            }
          }
          break;
        case 'region':
          filters.region = value;
          break;
        case 'has':
          if (value === 'audio') {
            filters.hasAudio = true;
          }
          break;
        case 'no':
          if (value === 'audio') {
            filters.hasAudio = false;
          }
          break;
      }
    } else {
      // Regular text search in title
      if (!filters.title) {
        filters.title = part;
      } else {
        filters.title += ` ${part}`;
      }
    }
  }

  return filters;
};

export const highlightSearchTerms = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
};
