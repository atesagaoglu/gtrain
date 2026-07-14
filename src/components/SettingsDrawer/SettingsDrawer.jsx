import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { TUNINGS, NOTES, Note } from '../../utils/musicTheory';
import './SettingsDrawer.css';

const SOUND_PROFILES = [
  { id: 'acoustic_guitar_nylon', label: 'Acoustic (Nylon)' },
  { id: 'acoustic_guitar_steel', label: 'Acoustic (Steel)' },
  { id: 'electric_guitar_clean', label: 'Electric (Clean)' },
  { id: 'overdriven_guitar',     label: 'Electric (Overdriven)' },
  { id: 'distortion_guitar',     label: 'Electric (Distortion)' }
];

const SKINS = [
  { id: 'rosewood', label: 'Rosewood' },
  { id: 'maple',    label: 'Maple' },
  { id: 'ebony',    label: 'Ebony' }
];

export default function SettingsDrawer({ isOpen, onClose, showFretboardSettings = true }) {
  const { 
    tuning, setTuning,
    soundProfile, setSoundProfile,
    skin, setSkin,
    accidentalPref, setAccidentalPref,
    soundEnabled, setSoundEnabled,
    showFretNumbers, setShowFretNumbers,
    numFrets, setNumFrets,
    intervalNotation, setIntervalNotation
  } = useSettings();

  const [customTuning, setCustomTuning] = useState(tuning);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    // Prevent CSS transitions from firing on initial load by waiting a tick
    const timer = setTimeout(() => setHasRendered(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isStandard = tuning.join(',') === TUNINGS.standard.notes.join(',');
  const isDropD = tuning.join(',') === TUNINGS.dropD.notes.join(',');
  const isCustom = !isStandard && !isDropD;
  const [showCustom, setShowCustom] = useState(isCustom);

  const handleApplyCustom = () => {
    setTuning(customTuning);
  };

  const updateCustomString = (index, newNoteStr) => {
    const newTuning = [...customTuning];
    newTuning[index] = newNoteStr;
    setCustomTuning(newTuning);
  };

  return (
    <>
      <div 
        className={`drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
        style={!hasRendered ? { transition: 'none', opacity: 0 } : undefined}
      />
      <div 
        id="settings-drawer" 
        className={`settings-drawer ${isOpen ? 'open' : ''}`}
        style={!hasRendered ? { transition: 'none', transform: 'translateX(100%)' } : undefined}
      >
        <div className="drawer-header">
          <h2>Settings</h2>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="drawer-content">
          
          {/* General App Settings */}
          <h3>General</h3>
          <div className="tuning-presets">
            {showFretboardSettings && (
              <>
                <div className="setting-group" style={{ marginBottom: 'var(--space-sm)' }}>
                  <label className="tuning-help">Total Frets</label>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    {[12, 15, 21, 22, 24].map((n) => (
                      <button
                        key={n}
                        className={`preset-btn ${numFrets === n ? 'active' : ''}`}
                        onClick={() => setNumFrets(n)}
                        style={{ padding: '4px 10px' }}
                      >{n}</button>
                    ))}
                  </div>
                </div>
                <button
                  className={`preset-btn ${showFretNumbers ? 'active' : ''}`}
                  onClick={() => setShowFretNumbers(!showFretNumbers)}
                  style={{ marginBottom: 'var(--space-sm)' }}
                >
                  Fret Numbers: {showFretNumbers ? 'Visible' : 'Hidden'}
                </button>
              </>
            )}
            <div className="setting-group" style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="tuning-help">Accidentals</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className={`preset-btn ${accidentalPref === 'sharp' ? 'active' : ''}`}
                  onClick={() => setAccidentalPref('sharp')}
                >#</button>
                <button
                  className={`preset-btn ${accidentalPref === 'flat' ? 'active' : ''}`}
                  onClick={() => setAccidentalPref('flat')}
                >b</button>
                <button
                  className={`preset-btn ${accidentalPref === 'both' ? 'active' : ''}`}
                  onClick={() => setAccidentalPref('both')}
                >Both</button>
              </div>
            </div>

            <div className="setting-group" style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="tuning-help">Interval Notation</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className={`preset-btn ${intervalNotation === 'name' ? 'active' : ''}`}
                  onClick={() => setIntervalNotation('name')}
                >Full Name</button>
                <button
                  className={`preset-btn ${intervalNotation === 'abbr' ? 'active' : ''}`}
                  onClick={() => setIntervalNotation('abbr')}
                >Abbreviation</button>
              </div>
            </div>
          </div>

          <div className="settings-divider-horizontal" />

          {/* Sound & Personalization */}
          <h3>Sound & Skin</h3>
          <div className="tuning-presets">
            <button
              className={`preset-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{ marginBottom: 'var(--space-sm)' }}
            >
              Sound: {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
            
            <label className="tuning-help">Instrument Sound Profile</label>
            <select 
              className="tuning-select" 
              value={soundProfile} 
              onChange={(e) => setSoundProfile(e.target.value)}
              style={{ width: '100%', marginBottom: 'var(--space-md)' }}
            >
              {SOUND_PROFILES.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>

            <label className="tuning-help">Fretboard Skin</label>
            <select 
              className="tuning-select" 
              value={skin} 
              onChange={(e) => setSkin(e.target.value)}
              style={{ width: '100%' }}
            >
              {SKINS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="settings-divider-horizontal" />

          {showFretboardSettings && (
            <>
              {/* Tuning Options */}
              <h3>Tuning Options</h3>
              <div className="tuning-presets">
            <button
              className={`preset-btn ${isStandard && !showCustom ? 'active' : ''}`}
              onClick={() => { setTuning(TUNINGS.standard.notes); setCustomTuning(TUNINGS.standard.notes); setShowCustom(false); }}
            >
              Standard (E A D G B E)
            </button>
            <button
              className={`preset-btn ${isDropD && !showCustom ? 'active' : ''}`}
              onClick={() => { setTuning(TUNINGS.dropD.notes); setCustomTuning(TUNINGS.dropD.notes); setShowCustom(false); }}
            >
              Drop D (D A D G B E)
            </button>
            <button
              className={`preset-btn ${showCustom ? 'active' : ''}`}
              onClick={() => setShowCustom(true)}
            >
              Custom...
            </button>
          </div>

          {showCustom && (
            <>
              <div className="settings-divider-horizontal" />

              <h3>Build Custom Tuning</h3>
              <p className="tuning-help">Select highest string (1) to lowest (6).</p>

              <div className="custom-tuning-builder">
                {customTuning.map((noteStr, idx) => {
                  const note = Note.from(noteStr);
                  return (
                    <div key={idx} className="tuning-row">
                      <span className="string-number">String {idx + 1}</span>
                      <select 
                        value={note.name}
                        onChange={(e) => updateCustomString(idx, `${e.target.value}${note.octave}`)}
                        className="tuning-select"
                      >
                        {NOTES.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <select
                        value={note.octave}
                        onChange={(e) => updateCustomString(idx, `${note.name}${e.target.value}`)}
                        className="tuning-select"
                      >
                        {[1, 2, 3, 4, 5, 6].map((oct) => (
                          <option key={oct} value={oct}>Octave {oct}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              <button 
                className="btn btn-primary apply-btn" 
                onClick={handleApplyCustom}
                style={{ marginBottom: 'var(--space-xl)' }}
              >
                Apply Custom Tuning
              </button>
            </>
          )}
        </>
      )}

        </div>
      </div>
    </>
  );
}
