
import { DEFAULT_NUM_FRETS, FRET_PRESETS } from '../../utils/musicTheory';
import { useSettings } from '../../contexts/SettingsContext';
import LearningMode from './modes/LearningMode';
import FindTheNoteMode from './modes/FindTheNoteMode';
import GuessTheNoteMode from './modes/GuessTheNoteMode';
import './FretboardTrainer.css';

const MODES = [
  { id: 'learn',   label: 'Learning',           description: 'Click any fret to see its note' },
  { id: 'find',    label: 'Find the Note',      description: 'Find a specific note on a string' },
  { id: 'guess',   label: 'Which Note Is This?', description: 'Identify the highlighted note' },
];

export default function FretboardTrainer() {
  const { tuning, accidentalPref, numFrets, hideInstructions, setHideInstructions, activeMode, setActiveMode } = useSettings();

  const renderMode = () => {
    switch (activeMode) {
      case 'learn': return <LearningMode numFrets={numFrets} />;
      case 'find':  return <FindTheNoteMode numFrets={numFrets} />;
      case 'guess': return <GuessTheNoteMode numFrets={numFrets} />;
      default:      return null;
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <header className="trainer-header">
        <h1 className="trainer-title">Fretboard Trainer</h1>
      </header>

      {/* ── Mode selector ─────────────────────────────────────────────── */}
      <div className="mode-selector">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            id={`mode-${mode.id}`}
            className={`mode-tab ${activeMode === mode.id ? 'mode-tab-active' : ''}`}
            onClick={() => setActiveMode(mode.id)}
          >
            <div className="mode-tab-text">
              <span className="mode-tab-label">{mode.label}</span>
              <span className="mode-tab-desc">{mode.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Active mode ────────────────────────────────────────────────── */}
      <div className="mode-content" key={`${activeMode}-${numFrets}-${tuning.join('-')}-${accidentalPref}`}>
        {renderMode()}
      </div>

      {/* ── Help Modal ────────────────────────────────────────────────── */}
      {(!hideInstructions || !hideInstructions[activeMode]) && (
        <div 
          className="drawer-overlay open" 
          onClick={() => setHideInstructions(prev => {
            const current = typeof prev === 'object' && prev !== null ? prev : {};
            return { ...current, [activeMode]: true };
          })} 
          style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div 
            className="glass-card animate-fade-in" 
            style={{ maxWidth: 500, padding: 'var(--space-xl)', position: 'relative', margin: '0 var(--space-md)' }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setHideInstructions(prev => {
                const current = typeof prev === 'object' && prev !== null ? prev : {};
                return { ...current, [activeMode]: true };
              })}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}
              title="Close"
            >
              ✕
            </button>
            <h2 style={{ marginBottom: 'var(--space-md)' }}>
              {activeMode === 'learn' && 'Learning Mode'}
              {activeMode === 'find' && 'Find the Note'}
              {activeMode === 'guess' && 'Guess the Note'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 'var(--fs-md)' }}>
              {activeMode === 'learn' && 'Click any position on the fretboard (or the string labels) to reveal its note and hear its pitch. Click again to hide it. Natural notes are shown in amber, accidentals in gold.'}
              {activeMode === 'find' && 'Click on the fretboard to find all instances of a specific note on the given string. Test your horizontal fretboard navigation skills!'}
              {activeMode === 'guess' && 'Identify the correct note at the highlighted fret. The choices will dynamically increase from 2 options up to 6 as you build a hot streak!'}
            </p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: 'var(--space-lg)', width: '100%' }} 
              onClick={() => setHideInstructions(prev => {
                const current = typeof prev === 'object' && prev !== null ? prev : {};
                return { ...current, [activeMode]: true };
              })}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
