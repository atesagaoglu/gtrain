import { useEffect, useRef, useCallback } from 'react';
import { Soundfont } from 'smplr';
import { useSettings } from '../contexts/SettingsContext';

export function useGuitarSound() {
  const { soundEnabled, soundProfile } = useSettings();
  const synthRef = useRef(null);
  const isInitialized = useRef(false);
  const activeProfile = useRef(null);
  const audioContextRef = useRef(null);

  const initAudio = useCallback(async () => {
    // Return early if already initialized with the correct profile
    if (isInitialized.current && activeProfile.current === soundProfile) return;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const context = audioContextRef.current;
    
    if (context.state === 'suspended') {
      await context.resume();
    }
    
    // Stop and clear the old synth if it exists
    if (synthRef.current) {
      synthRef.current = null;
    }

    let outputNode = context.destination;
    let instrumentName = soundProfile;

    // Apply Web Audio API custom distortion for overdriven/distortion profiles
    // since the default soundfonts for these are often low quality MIDI synthesis.
    if (soundProfile === 'overdriven_guitar' || soundProfile === 'distortion_guitar') {
      instrumentName = 'electric_guitar_clean'; // Use clean sample as base
      
      const distortion = context.createWaveShaper();
      function makeDistortionCurve(amount) {
        let k = amount,
          n_samples = 44100,
          curve = new Float32Array(n_samples),
          deg = Math.PI / 180,
          i = 0,
          x;
        for ( ; i < n_samples; ++i ) {
          x = i * 2 / n_samples - 1;
          curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
      }
      
      // Apply different amounts of gain/distortion
      distortion.curve = makeDistortionCurve(soundProfile === 'distortion_guitar' ? 400 : 50);
      distortion.oversample = '4x';
      
      // Lowpass filter to roll off harsh high-end frequencies
      const biquadFilter = context.createBiquadFilter();
      biquadFilter.type = "lowpass";
      biquadFilter.frequency.value = soundProfile === 'distortion_guitar' ? 2500 : 4000;
      
      distortion.connect(biquadFilter);
      biquadFilter.connect(context.destination);
      
      outputNode = distortion;
    }

    const instrument = new Soundfont(context, {
      instrument: instrumentName,
      output: outputNode
    });
    
    await instrument.load;
    
    synthRef.current = instrument;
    activeProfile.current = soundProfile;
    isInitialized.current = true;
  }, [soundProfile]);

  const playNote = useCallback((noteFullName) => {
    if (!soundEnabled) return;
    
    if (!isInitialized.current || activeProfile.current !== soundProfile) {
      initAudio().then(() => {
        if (synthRef.current) {
          synthRef.current.start({ note: noteFullName, duration: 2 });
        }
      });
    } else {
      if (synthRef.current) {
        synthRef.current.start({ note: noteFullName, duration: 2 });
      }
    }
  }, [soundEnabled, soundProfile, initAudio]);

  return { playNote, initAudio };
}
