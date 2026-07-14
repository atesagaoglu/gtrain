import { createContext, useContext, useState, useEffect } from 'react';
import { TUNINGS } from '../utils/musicTheory';

const SettingsContext = createContext();

// Custom hook for localStorage persistence
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      if (stickyValue === null) return defaultValue;
      
      const parsed = JSON.parse(stickyValue);
      return parsed !== null ? parsed : defaultValue;
    } catch (e) {
      console.error(`Error parsing localStorage for ${key}:`, e);
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export function SettingsProvider({ children }) {
  const [accidentalPref, setAccidentalPref] = useStickyState('sharp', 'gtrain_accidentalPref');
  const [tuning, setTuning] = useStickyState(TUNINGS.standard.notes, 'gtrain_tuning');
  const [soundEnabled, setSoundEnabled] = useStickyState(true, 'gtrain_soundEnabled');
  const [soundProfile, setSoundProfile] = useStickyState('acoustic_guitar_nylon', 'gtrain_soundProfile');
  const [skin, setSkin] = useStickyState('rosewood', 'gtrain_skin');
  const [showFretNumbers, setShowFretNumbers] = useStickyState(true, 'gtrain_showFretNumbers');
  const [numFrets, setNumFrets] = useStickyState(24, 'gtrain_numFrets');
  const [hideInstructions, setHideInstructions] = useStickyState({}, 'gtrain_hideInstructions');
  const [activeMode, setActiveMode] = useStickyState('learn', 'gtrain_activeMode');
  const [intervalMode, setIntervalMode] = useStickyState('math', 'gtrain_intervalMode');
  const [intervalNotation, setIntervalNotation] = useStickyState('name', 'gtrain_intervalNotation');

  return (
    <SettingsContext.Provider
      value={{
        accidentalPref, setAccidentalPref,
        tuning, setTuning,
        soundEnabled, setSoundEnabled,
        soundProfile, setSoundProfile,
        skin, setSkin,
        showFretNumbers, setShowFretNumbers,
        numFrets, setNumFrets,
        hideInstructions, setHideInstructions,
        activeMode, setActiveMode,
        intervalMode, setIntervalMode,
        intervalNotation, setIntervalNotation
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
