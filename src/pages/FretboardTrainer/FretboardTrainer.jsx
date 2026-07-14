import { useState } from 'react';
import { DEFAULT_NUM_FRETS, FRET_PRESETS } from '../../utils/musicTheory';
import { useSettings } from '../../contexts/SettingsContext';
import LearningMode from './modes/LearningMode';
import FindTheNoteMode from './modes/FindTheNoteMode';
import GuessTheNoteMode from './modes/GuessTheNoteMode';
import SettingsDrawer from '../../components/SettingsDrawer/SettingsDrawer';
import './FretboardTrainer.css';

const MODES = [
  { id: 'learn',   label: 'Learning',           description: 'Click any fret to see its note' },
  { id: 'find',    label: 'Find the Note',      description: 'Find a specific note on a string' },
  { id: 'guess',   label: 'Which Note Is This?', description: 'Identify the highlighted note' },
];

export default function FretboardTrainer() {
  const [activeMode, setActiveMode] = useState('learn');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { tuning, accidentalPref, numFrets } = useSettings();

  const renderMode = () => {
    switch (activeMode) {
      case 'learn': return <LearningMode numFrets={numFrets} />;
      case 'find':  return <FindTheNoteMode numFrets={numFrets} />;
      case 'guess': return <GuessTheNoteMode numFrets={numFrets} />;
      default:      return null;
    }
  };

  return (
    <div className="trainer-page animate-fade-in">
      <header className="trainer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="trainer-title">Fretboard Trainer</h1>
        <button
          className="btn btn-ghost"
          onClick={() => setIsDrawerOpen(true)}
          title="Settings"
          style={{ padding: '8px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
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

      <SettingsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
