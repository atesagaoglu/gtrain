import { useState, useCallback, useEffect, useRef } from 'react';
import Fretboard from '../../../components/Fretboard/Fretboard';
import {
  DEFAULT_NUM_FRETS,
  getNoteAtFret,
  generateDistractors,
  getRandomString,
  getRandomFret,
  Note
} from '../../../utils/musicTheory';
import { useSettings } from '../../../contexts/SettingsContext';
import { useGuitarSound } from '../../../hooks/useGuitarSound';

export default function GuessTheNoteMode({ numFrets = DEFAULT_NUM_FRETS }) {
  const { tuning, accidentalPref } = useSettings();
  const { playNote, initAudio } = useGuitarSound();

  const [questionFret, setQuestionFret] = useState({ string: 0, fret: 0 });
  const [correctNoteObj, setCorrectNoteObj] = useState(null);
  const [choices, setChoices] = useState([]); // array of pitch class Notes
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);

  const scoreRef = useRef(0);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const newQuestion = useCallback(() => {
    const stringIdx = getRandomString(tuning.length);
    const fret = getRandomFret(numFrets);

    const currentScore = scoreRef.current;
    let distractorCount = 1; // starts with 2 choices
    if (currentScore >= 12) distractorCount = 5;
    else if (currentScore >= 9) distractorCount = 4;
    else if (currentScore >= 6) distractorCount = 3;
    else if (currentScore >= 3) distractorCount = 2;

    const actualNote = getNoteAtFret(tuning[stringIdx], fret);
    const distractors = generateDistractors(actualNote.name, [], distractorCount).map(name => Note.from(name));

    const options = [actualNote, ...distractors];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    setQuestionFret({ string: stringIdx, fret });
    setCorrectNoteObj(actualNote);
    setChoices(options);
    setSelected(null);
    setAnswered(false);
  }, [numFrets, tuning]);

  useEffect(() => {
    // Only generate on first mount to prevent loops if we added dependencies
    if (!choices.length) {
      newQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoice = useCallback(
    (index) => {
      if (answered) return;
      initAudio();

      setSelected(index);
      setAnswered(true);
      setTotal((t) => t + 1);
      
      // Play the actual correct note pitch when they answer
      playNote(correctNoteObj.fullName);

      if (choices[index].isSamePitchClass(correctNoteObj)) {
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        setTimeout(() => newQuestion(), 1000);
      } else {
        setStreak(0);
        setTimeout(() => newQuestion(), 1800);
      }
    },
    [answered, choices, correctNoteObj, newQuestion, playNote, initAudio],
  );

  if (!correctNoteObj) return null;

  const stringOpenNote = Note.from(tuning[questionFret.string]);
  let displayStringName = stringOpenNote.formatName(accidentalPref);
  if (questionFret.string === tuning.length - 1 && stringOpenNote.index === 4) {
    displayStringName = displayStringName.toLowerCase();
  }

  const highlights = [
    {
      string: questionFret.string,
      fret: questionFret.fret,
      color: answered
        ? selected !== null && choices[selected].isSamePitchClass(correctNoteObj)
          ? 'var(--success)'
          : 'var(--error)'
        : 'var(--accent)',
      label: answered ? correctNoteObj.formatName(accidentalPref) : '?',
      pulse: !answered,
    },
  ];

  return (
    <div className="game-wrapper">
      <div className="prompt-card">
        <div className="prompt-question">
          <div>
            <div className="prompt-label">What note is at</div>
            <div className="prompt-string">
              {questionFret.string + 1} ({displayStringName}), Fret {questionFret.fret}
            </div>
          </div>
        </div>

        <div className="score-display">
          <div className="score-item">
            <span className="score-value">
              {total > 0 ? `${Math.round((score / total) * 100)}%` : '—'}
            </span>
            <span className="score-label">Accuracy</span>
          </div>
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

      <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
        <Fretboard
          highlightedFrets={highlights}
          numFrets={numFrets}
        />
      </div>

      <div className="answer-choices">
        {choices.map((noteObj, idx) => {
          let className = 'answer-btn';
          if (answered) {
            if (noteObj.isSamePitchClass(correctNoteObj)) className += ' correct';
            else if (idx === selected) className += ' wrong';
          }

          return (
            <button
              key={`ans-${idx}`}
              id={`answer-${idx}`}
              className={className}
              onClick={() => handleChoice(idx)}
              disabled={answered}
            >
              {noteObj.formatName(accidentalPref)}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}>
        <button className="btn btn-ghost" onClick={newQuestion} id="btn-skip-guess">
          Skip →
        </button>
      </div>
    </div>
  );
}
