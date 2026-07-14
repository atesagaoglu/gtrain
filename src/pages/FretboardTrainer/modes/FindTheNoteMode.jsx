import { useState, useCallback, useEffect } from 'react';
import Fretboard from '../../../components/Fretboard/Fretboard';
import {
  DEFAULT_NUM_FRETS,
  getNoteAtFret,
  findNoteOnString,
  Note,
  getRandomString,
} from '../../../utils/musicTheory';
import { useSettings } from '../../../contexts/SettingsContext';
import { useGuitarSound } from '../../../hooks/useGuitarSound';

export default function FindTheNoteMode({ numFrets = DEFAULT_NUM_FRETS }) {
  const { tuning, accidentalPref, hideInstructions, setHideInstructions } = useSettings();
  const { playNote, initAudio } = useGuitarSound();

  const [targetNoteObj, setTargetNoteObj] = useState(null);
  const [targetString, setTargetString] = useState(0);
  const [correctFrets, setCorrectFrets] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const newQuestion = useCallback(() => {
    const stringIdx = getRandomString(tuning.length);
    const note = Note.randomPitchClass();
    const frets = findNoteOnString(note.name, stringIdx, tuning, numFrets);

    setTargetNoteObj(note);
    setTargetString(stringIdx);
    setCorrectFrets(frets);
    setHighlights([]);
    setFeedback(null);
  }, [numFrets, tuning]);

  useEffect(() => {
    newQuestion();
  }, [newQuestion]);

  const handleFretClick = useCallback(
    (stringIdx, fret) => {
      initAudio();
      if (stringIdx !== targetString) return;
      if (highlights.some((h) => h.fret === fret && h.string === stringIdx)) return;

      const clickedNote = getNoteAtFret(tuning[stringIdx], fret);
      playNote(clickedNote.fullName);
      
      const isCorrect = clickedNote.isSamePitchClass(targetNoteObj);
      setAttempts((a) => a + 1);

      if (isCorrect) {
        const newHighlights = [
          ...highlights,
          {
            string: stringIdx,
            fret,
            label: clickedNote.formatName(accidentalPref),
            color: 'var(--success)',
          },
        ];
        setHighlights(newHighlights);

        const foundCount = newHighlights.filter((h) => h.color === 'var(--success)').length;

        if (foundCount >= correctFrets.length) {
          setScore((s) => s + 1);
          setStreak((s) => s + 1);
          setFeedback({
            type: 'success',
            message: `Found all ${correctFrets.length} position${correctFrets.length > 1 ? 's' : ''}!`,
          });
          setTimeout(() => newQuestion(), 1200);
        } else {
          setFeedback({
            type: 'success',
            message: `Correct! ${correctFrets.length - foundCount} more to find.`,
          });
        }
      } else {
        setStreak(0);
        setHighlights((prev) => [
          ...prev,
          {
            string: stringIdx,
            fret,
            label: clickedNote.formatName(accidentalPref),
            color: 'var(--error)',
          },
        ]);
        setFeedback({
          type: 'error',
          message: `Incorrect. That is ${clickedNote.formatName(accidentalPref)}, not ${targetNoteObj.formatName(accidentalPref)}.`,
        });

        setTimeout(() => {
          setHighlights((prev) => prev.filter((h) => h.color !== 'var(--error)'));
        }, 800);
      }
    },
    [targetNoteObj, targetString, correctFrets, highlights, newQuestion, tuning, accidentalPref, playNote, initAudio],
  );

  const activeStrings = new Set([targetString]);

  if (!targetNoteObj) return null;

  // Format the string label (e.g. standard 6th string -> 'e', others default name)
  const stringOpenNote = Note.from(tuning[targetString]);
  let displayStringName = stringOpenNote.formatName(accidentalPref);
  if (targetString === tuning.length - 1 && stringOpenNote.index === 4) {
    displayStringName = displayStringName.toLowerCase();
  }

  return (
    <div>
      <div className="prompt-card">
        <div>
          <div className="prompt-label">Find this note</div>
          <div className="prompt-note">{targetNoteObj.formatName(accidentalPref)}</div>
        </div>
        <div className="prompt-divider" />
        <div>
          <div className="prompt-label">On string</div>
          <div className="prompt-string">
            {targetString + 1} ({displayStringName})
          </div>
        </div>

        <div className="score-display">
          <div className="score-item">
            <span className="score-value">{score}</span>
            <span className="score-label">Score</span>
          </div>
          <div className="score-item">
            <span className={`score-value ${streak > 0 ? 'streak' : ''}`}>
              {streak}
            </span>
            <span className="score-label">Streak</span>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--space-md)' }}>
        <Fretboard
          onFretClick={handleFretClick}
          highlightedFrets={highlights}
          activeStrings={activeStrings}
          numFrets={numFrets}
        />
      </div>

      {feedback && (
        <div className={`feedback-banner ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div style={{ marginTop: 'var(--space-md)', textAlign: 'center' }}>
        <button className="btn btn-ghost" onClick={newQuestion} id="btn-skip">
          Skip →
        </button>
      </div>
    </div>
  );
}
