import { useState, useCallback, useEffect, useRef } from 'react';
import { generateDistractors, Note, INTERVAL_NAMES } from '../../utils/musicTheory';
import { useSettings } from '../../contexts/SettingsContext';
import { useGuitarSound } from '../../hooks/useGuitarSound';
import './IntervalMath.css';

const MODES = [
  { id: 'math', label: 'Semitones', description: 'Raw semitone addition' },
  { id: 'interval', label: 'Intervals', description: 'Identify intervals' },
];

export default function IntervalMath() {
  const { accidentalPref, intervalMode, setIntervalMode, intervalNotation } = useSettings();
  const { playNote, initAudio } = useGuitarSound();

  const [questionData, setQuestionData] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);

  const scoreRef = useRef(0);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Reset state on mode change
  useEffect(() => {
    setScore(0);
    setStreak(0);
    setTotal(0);
    setChoices([]);
  }, [intervalMode]);

  const newQuestion = useCallback(() => {
    // We just need a random pitch class root note for the math
    const rootNote = Note.randomPitchClass();
    const currentScore = scoreRef.current;
    
    // Scale difficulty every 6 points
    let maxInterval = 2;
    let distractorCount = 1;

    if (currentScore >= 24) { maxInterval = 12; distractorCount = 5; }
    else if (currentScore >= 18) { maxInterval = 12; distractorCount = 4; }
    else if (currentScore >= 12) { maxInterval = 7; distractorCount = 3; }
    else if (currentScore >= 6) { maxInterval = 5; distractorCount = 2; }

    // Generate random non-zero interval
    let interval = 0;
    while (interval === 0) {
      if (intervalMode === 'math') {
        interval = Math.floor(Math.random() * (maxInterval * 2 + 1)) - maxInterval;
      } else {
        // Names and Abbreviations are strictly ascending
        interval = Math.floor(Math.random() * maxInterval) + 1;
      }
    }

    const targetNote = rootNote.add(interval);
    const distractors = generateDistractors(targetNote.name, [rootNote.name], distractorCount).map(name => Note.from(name));

    const options = [targetNote, ...distractors];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    setQuestionData({ rootNote, targetNote, interval });
    setChoices(options);
    setSelected(null);
    setAnswered(false);
  }, [intervalMode]); // Add dependencies so it updates when mode changes

  useEffect(() => {
    if (!choices.length) {
      newQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choices.length, newQuestion]);

  const handleChoice = useCallback(
    (index) => {
      if (answered) return;
      initAudio();

      setSelected(index);
      setAnswered(true);
      setTotal((t) => t + 1);
      
      const { targetNote } = questionData;
      playNote(targetNote.fullName);

      if (choices[index].isSamePitchClass(targetNote)) {
        setScore((s) => {
          const newScore = s + 1;
          setTimeout(() => newQuestion(), 1000);
          return newScore;
        });
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
        setTimeout(() => newQuestion(), 1800);
      }
    },
    [answered, choices, questionData, newQuestion, playNote, initAudio],
  );

  if (!questionData) return null;

  const { rootNote, interval, targetNote } = questionData;
  const rootName = rootNote.formatName(accidentalPref);
  
  const intervalAbs = Math.abs(interval);
  
  let operatorText = '';
  let labelText = '';

  if (intervalMode === 'math') {
    const sign = interval > 0 ? '+' : '-';
    operatorText = `${sign}${intervalAbs}`;
    labelText = 'semitones =';
  } else if (intervalMode === 'interval') {
    operatorText = '→';
    labelText = intervalNotation === 'abbr' 
      ? `${INTERVAL_NAMES[intervalAbs].abbr}` 
      : `${INTERVAL_NAMES[intervalAbs].name}`;
  }

  return (
    <div className="page-container animate-fade-in">
      <header className="math-header">
        <h1 className="math-title">Interval Math</h1>
        <p className="math-subtitle">Master your musical intervals</p>
      </header>

      {/* ── Mode selector ─────────────────────────────────────────────── */}
      <div className="mode-selector">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            id={`mode-${mode.id}`}
            className={`mode-tab ${intervalMode === mode.id ? 'mode-tab-active' : ''}`}
            onClick={() => setIntervalMode(mode.id)}
          >
            <div className="mode-tab-text">
              <span className="mode-tab-label">{mode.label}</span>
              <span className="mode-tab-desc">{mode.description}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="game-wrapper">
        <div className="glass-card math-prompt-card">
          <div className="math-equation">
            <span className="math-root">{rootName}</span>
            <span className="math-operator">{operatorText}</span>
            <span className="math-label">{labelText}</span>
            <span className="math-question-mark">?</span>
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

        <div className="answer-choices">
          {choices.map((noteObj, idx) => {
            let className = 'answer-btn';
            if (answered) {
              if (noteObj.isSamePitchClass(targetNote)) className += ' correct';
              else if (idx === selected) className += ' wrong';
            }

            return (
              <button
                key={`ans-${idx}`}
                className={className}
                onClick={() => handleChoice(idx)}
                disabled={answered}
              >
                {noteObj.formatName(accidentalPref)}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center' }}>
          <button className="btn btn-ghost" onClick={newQuestion}>
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}
