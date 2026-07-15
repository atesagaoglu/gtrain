import { useState, useMemo } from 'react';
import { Note, NOTES } from '../../utils/musicTheory';
import { useSettings } from '../../contexts/SettingsContext';
import { useGuitarSound } from '../../hooks/useGuitarSound';
import ChordDiagram from '../../components/ChordDiagram/ChordDiagram';
import chordDb from '../../data/chordDb.json';
import './ChordLibrary.css';

export default function ChordLibrary() {
  const { accidentalPref, chordTypeFilter, setChordTypeFilter } = useSettings();
  const { playChord, initAudio } = useGuitarSound();

  // Root note state
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedVoicing, setSelectedVoicing] = useState(null);

  // We group chord types by category for the filter UI
  const categories = ['major', 'minor', 'other'];
  const allTypeIds = chordDb.chordTypes.map(t => t.id);

  // If filter is empty, we show all (default behavior requested by user)
  const activeTypes = chordTypeFilter.length === 0 ? allTypeIds : chordTypeFilter;

  const toggleTypeFilter = (e, typeId) => {
    const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
    
    setChordTypeFilter((prev) => {
      if (isMulti) {
        // Multi-select toggle
        if (prev.includes(typeId)) {
          return prev.filter(t => t !== typeId);
        } else {
          return [...prev, typeId];
        }
      } else {
        // Single-select
        if (prev.length === 1 && prev[0] === typeId) {
          return []; // toggle off if it's the only one
        } else {
          return [typeId];
        }
      }
    });
  };

  const handleDiagramClick = (voicing, type) => {
    initAudio();
    // Simulate a strum by logging or playing if supported
    if (playChord) {
      // ... play logic
    }
    setSelectedVoicing({ ...voicing, typeName: type.name });
  };

  // Filter the voicings based on the selected root and active types
  const rootVoicings = chordDb.voicings[selectedRoot] || {};

  return (
    <div className="page-container animate-fade-in">
      <header className="library-header">
        <h1 className="library-title">Chord Library</h1>
        <p className="library-subtitle">Explore every playable voicing across the fretboard</p>
      </header>

      {/* ── Root Selector ── */}
      <section className="library-section">
        <div className="root-selector">
          {NOTES.map(noteName => {
            const display = Note.from(noteName).formatName(accidentalPref);
            return (
              <button
                key={noteName}
                className={`root-btn ${selectedRoot === noteName ? 'active' : ''}`}
                onClick={() => setSelectedRoot(noteName)}
              >
                {display}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Type Filters ── */}
      <section className="library-section">
        <div className="filter-group">
          {categories.map(category => {
            const typesInCategory = chordDb.chordTypes.filter(t => t.category === category);
            if (typesInCategory.length === 0) return null;
            return (
              <div key={category} className="filter-category">
                <div className="filter-category-label">{category}</div>
                <div className="filter-buttons">
                  {typesInCategory.map(type => {
                    const isActive = activeTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        className={`filter-btn ${isActive ? 'active' : ''}`}
                        onClick={(e) => toggleTypeFilter(e, type.id)}
                      >
                        {type.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Results Gallery ── */}
      <section className="library-gallery">
        {chordDb.chordTypes.map(type => {
          if (!activeTypes.includes(type.id)) return null;

          const voicings = rootVoicings[type.id] || [];
          if (voicings.length === 0) return null;

          return (
            <div key={type.id} className="chord-type-section">
              <div className="chord-type-header">
                <h2>{Note.from(selectedRoot).formatName(accidentalPref)} {type.name}</h2>
                <span className="chord-formula">{type.formula}</span>
              </div>
              
              <div className="diagram-grid">
                {voicings.map(v => (
                  <div 
                    key={v.id} 
                    className="diagram-clickable-wrapper"
                    onClick={() => handleDiagramClick(v, type)}
                  >
                    <ChordDiagram
                      frets={v.frets}
                      fingers={v.fingers}
                      notes={v.notes}
                      minFret={v.minFret}
                      barFret={v.barFret}
                      title={v.frets.map(f => f === -1 ? 'X' : f).join(' ')}
                      highlightRoot={true}
                      rootNote={selectedRoot}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Fullscreen Modal ── */}
      {selectedVoicing && (
        <div className="chord-modal-overlay" onClick={() => setSelectedVoicing(null)}>
          <div className="chord-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="chord-modal-close" onClick={() => setSelectedVoicing(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="chord-modal-header">
              <h2>{Note.from(selectedRoot).formatName(accidentalPref)} {selectedVoicing.typeName}</h2>
            </div>
            <div className="chord-modal-diagram-container">
              <ChordDiagram
                frets={selectedVoicing.frets}
                fingers={selectedVoicing.fingers}
                notes={selectedVoicing.notes}
                minFret={selectedVoicing.minFret}
                barFret={selectedVoicing.barFret}
                title={selectedVoicing.frets.map(f => f === -1 ? 'X' : f).join(' ')}
                highlightRoot={true}
                rootNote={selectedRoot}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
