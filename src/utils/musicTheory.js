/**
 * Music theory utilities for guitar fretboard training.
 * Now with octave and MIDI note number support.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

/** The 12 chromatic notes in order, using sharps. */
export const NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

/** Enharmonic flat names keyed by sharp name. */
export const ENHARMONIC_FLATS = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
};

/** Predefined tunings (with octaves). High E to Low E. */
export const TUNINGS = {
  standard: {
    id: 'standard',
    name: 'Standard (E A D G B E)',
    notes: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'],
  },
  dropD: {
    id: 'dropD',
    name: 'Drop D (D A D G B E)',
    notes: ['E4', 'B3', 'G3', 'D3', 'A2', 'D2'],
  },
};

export const STANDARD_TUNING = TUNINGS.standard.notes;

/** Fret positions that have a single dot inlay on a real guitar. */
export const SINGLE_DOT_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];

/** Fret positions that have double dot inlays. */
export const DOUBLE_DOT_FRETS = [12, 24];

/** Default number of frets to display. */
export const DEFAULT_NUM_FRETS = 22;

/** Common fret count presets. */
export const FRET_PRESETS = [12, 15, 17, 19, 21, 22, 24];

// ─── Note class ──────────────────────────────────────────────────────────────

/**
 * Immutable value object representing a musical note with octave (MIDI based).
 * Middle C (C4) = MIDI 60.
 */
export class Note {
  /** @param {number} midi – MIDI note number */
  constructor(midi) {
    this._midi = midi;
  }

  get midi() {
    return this._midi;
  }

  /** Pitch class index (0-11, where 0 = C) */
  get index() {
    return ((this._midi % 12) + 12) % 12;
  }

  /** Octave number (e.g. C4 -> 4) */
  get octave() {
    return Math.floor(this._midi / 12) - 1;
  }

  /** The canonical sharp-name of this pitch class (e.g. 'C#'). */
  get name() {
    return NOTES[this.index];
  }

  /** The flat alias if one exists (e.g. 'Db'), otherwise null. */
  get flatName() {
    return ENHARMONIC_FLATS[this.name] ?? null;
  }

  /** 
   * Returns formatted name based on preference ('sharp', 'flat', 'both'). 
   * Useful for UI display (excludes octave).
   */
  formatName(preference = 'sharp') {
    if (preference === 'flat' && this.flatName) return this.flatName;
    if (preference === 'both' && this.flatName) return `${this.name}/${this.flatName}`;
    return this.name;
  }

  /** Full name including octave, e.g., 'C#4'. Useful for Tone.js. */
  get fullName() {
    return `${this.name}${this.octave}`;
  }

  /** Whether this note is an accidental (sharp/flat). */
  get isAccidental() {
    return this.name.includes('#');
  }

  /** Return a new Note transposed up/down by `semitones`. */
  add(semitones) {
    return new Note(this._midi + semitones);
  }

  subtract(semitones) {
    return new Note(this._midi - semitones);
  }

  /** The interval (in semitones) from this note up to `other`. */
  intervalTo(other) {
    const otherMidi = other instanceof Note ? other.midi : Note.from(other).midi;
    return ((otherMidi - this._midi) % 12 + 12) % 12; // always positive (0-11)
  }

  /** True if both notes have the same pitch class (ignores octave). */
  isSamePitchClass(other) {
    const otherIdx = other instanceof Note ? other.index : Note.from(other).index;
    return this.index === otherIdx;
  }

  /** Exact match (pitch class and octave). */
  equals(other) {
    const otherNote = other instanceof Note ? other : Note.from(other);
    return this._midi === otherNote.midi;
  }

  toString() {
    return this.fullName;
  }

  // ── Static factories ────────────────────────────────────────────────────

  /**
   * Parse a note name with optional octave (e.g., 'C#4', 'Db', 'E2').
   * If octave is omitted, defaults to 4.
   * @param {string} str
   * @returns {Note}
   */
  static from(str) {
    const match = str.match(/^([a-gA-G][#b]?)(-?\d+)?$/);
    if (!match) throw new Error(`Invalid note string: "${str}"`);

    let name = match[1].charAt(0).toUpperCase() + match[1].slice(1);
    const octave = match[2] ? parseInt(match[2], 10) : 4;

    // Convert flats to sharps internally for lookup
    if (name.endsWith('b')) {
      const entry = Object.entries(ENHARMONIC_FLATS).find(([s, f]) => f === name);
      if (entry) name = entry[0];
    }

    const pitchClass = NOTES.indexOf(name);
    if (pitchClass === -1) throw new Error(`Unknown pitch class in: "${str}"`);

    const midi = (octave + 1) * 12 + pitchClass;
    return new Note(midi);
  }

  /** Return a random Note within standard guitar range (approx E2 to E6) */
  static random(minMidi = 40, maxMidi = 88) {
    const midi = Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi;
    return new Note(midi);
  }

  /** Return a random pitch class Note (defaulting to octave 4 for simple math) */
  static randomPitchClass() {
    return new Note(60 + Math.floor(Math.random() * 12));
  }
}

// ─── Fretboard helpers ───────────────────────────────────────────────────────

/**
 * Get the note at a specific fret on a given open string.
 * @param {string} openNoteStr – the open-string full note (e.g. 'E2')
 * @param {number} fret – fret number (0 = open string)
 * @returns {Note}
 */
export function getNoteAtFret(openNoteStr, fret) {
  return Note.from(openNoteStr).add(fret);
}

/**
 * Find all fret positions of a given note across all strings.
 * (Ignores octave, only matches pitch class).
 */
export function findNotePositions(noteName, tuning = STANDARD_TUNING, numFrets = DEFAULT_NUM_FRETS) {
  const target = Note.from(noteName);
  const positions = [];

  tuning.forEach((openNoteStr, stringIdx) => {
    for (let fret = 0; fret <= numFrets; fret++) {
      if (getNoteAtFret(openNoteStr, fret).isSamePitchClass(target)) {
        positions.push({ string: stringIdx, fret });
      }
    }
  });

  return positions;
}

/**
 * Find all fret positions of a given note on a specific string.
 * (Ignores octave, only matches pitch class).
 */
export function findNoteOnString(noteName, stringIndex, tuning = STANDARD_TUNING, numFrets = DEFAULT_NUM_FRETS) {
  const target = Note.from(noteName);
  const openNoteStr = tuning[stringIndex];
  const frets = [];

  for (let fret = 0; fret <= numFrets; fret++) {
    if (getNoteAtFret(openNoteStr, fret).isSamePitchClass(target)) {
      frets.push(fret);
    }
  }

  return frets;
}

// ─── Quiz helpers ────────────────────────────────────────────────────────────

/**
 * Generate `count` unique distractor pitch classes (excluding `correctNote`).
 */
export function generateDistractors(correctNote, count = 3) {
  const correct = Note.from(correctNote);
  const pool = NOTES.filter((n) => n !== correct.name);

  for (let i = pool.length - 1; i > 0 && i >= pool.length - count; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(-count);
}

export function getRandomString(tuningLength = 6) {
  return Math.floor(Math.random() * tuningLength);
}

export function getRandomFret(max = DEFAULT_NUM_FRETS) {
  return Math.floor(Math.random() * (max + 1));
}
