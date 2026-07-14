import { useState, useCallback, useEffect } from 'react';
import Fretboard from '../../../components/Fretboard/Fretboard';
import { getNoteAtFret, DEFAULT_NUM_FRETS } from '../../../utils/musicTheory';
import { useSettings } from '../../../contexts/SettingsContext';
import { useGuitarSound } from '../../../hooks/useGuitarSound';

/**
 * Learning Mode: Click any fret to reveal its note.
 * Notes stay visible until cleared. Option to show all.
 */
export default function LearningMode({ numFrets = DEFAULT_NUM_FRETS }) {
  const [revealedNotes, setRevealedNotes] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const { tuning, accidentalPref, hideInstructions, setHideInstructions } = useSettings();
  const { playNote, initAudio } = useGuitarSound();

  const handleFretClick = useCallback((stringIdx, fret) => {
    initAudio(); // Required to start AudioContext on user gesture
    
    const note = getNoteAtFret(tuning[stringIdx], fret);
    playNote(note.fullName);

    // Toggle: if already revealed, remove it
    const key = `${stringIdx}-${fret}`;
    setRevealedNotes((prev) => {
      const existing = prev.find((n) => n.key === key);
      if (existing) return prev.filter((n) => n.key !== key);

      return [
        ...prev,
        {
          key,
          string: stringIdx,
          fret,
          label: note.formatName(accidentalPref),
          color: note.isAccidental
            ? 'rgba(168, 144, 96, 0.9)'   // muted gold for sharps/flats
            : 'var(--accent)',              // bright amber for naturals
        },
      ];
    });
  }, [tuning, accidentalPref, playNote, initAudio]);

  const handleShowAll = () => {
    if (showAll) {
      setRevealedNotes([]);
      setShowAll(false);
      return;
    }

    const all = [];
    tuning.forEach((openNoteStr, stringIdx) => {
      for (let fret = 0; fret <= numFrets; fret++) {
        const note = getNoteAtFret(openNoteStr, fret);
        all.push({
          key: `${stringIdx}-${fret}`,
          string: stringIdx,
          fret,
          label: note.formatName(accidentalPref),
          color: note.isAccidental
            ? 'rgba(168, 144, 96, 0.85)'
            : 'var(--accent)',
        });
      }
    });
    setRevealedNotes(all);
    setShowAll(true);
  };

  const handleClear = () => {
    setRevealedNotes([]);
    setShowAll(false);
  };

  return (
    <div>
      {!hideInstructions && (
        <div className="mode-instructions" style={{ position: 'relative' }}>
          <button 
            onClick={() => setHideInstructions(true)}
            style={{ position: 'absolute', top: 4, right: 8, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
            title="Dismiss"
          >
            ✕
          </button>
          <span className="mode-instructions-text">
            Click any position on the fretboard (or the string labels) to reveal its note and hear its pitch.
            Click again to hide it. Natural notes are shown in <strong>amber</strong>, accidentals in <strong>gold</strong>.
          </span>
        </div>
      )}

      <div className="mode-toolbar">
        <button className="btn btn-ghost" onClick={handleShowAll} id="btn-show-all">
          {showAll ? 'Hide All' : 'Show All Notes'}
        </button>
        <button className="btn btn-ghost" onClick={handleClear} id="btn-clear">
          Clear
        </button>
        {revealedNotes.length > 0 && !showAll && (
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
            {revealedNotes.length} note{revealedNotes.length !== 1 ? 's' : ''} revealed
          </span>
        )}
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-md)' }}>
        <Fretboard
          onFretClick={handleFretClick}
          highlightedFrets={revealedNotes}
          numFrets={numFrets}
        />
      </div>
    </div>
  );
}
