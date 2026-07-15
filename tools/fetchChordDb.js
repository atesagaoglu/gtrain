import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getNoteAtFret, TUNINGS } from '../src/utils/musicTheory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '..', 'src', 'data', 'chordDb.json');
const tuningLowToHigh = [...TUNINGS.standard.notes].reverse();

const DB_URL = 'https://raw.githubusercontent.com/tombatossals/chords-db/master/lib/guitar.json';

function fretsToIdString(frets) {
  return frets.map(f => {
    if (f === -1) return 'X';
    if (f >= 10) return f.toString(); 
    return f.toString();
  }).join('');
}

console.log('🎸 Fetching curated chord database...');

https.get(DB_URL, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('✅ Download complete. Parsing...');
    const sourceDb = JSON.parse(data);
    
    const db = {
      meta: {
        generatedAt: new Date().toISOString(),
        tuning: tuningLowToHigh,
        version: 2,
        source: 'tombatossals/chords-db'
      },
      chordTypes: [],
      voicings: {}
    };

    // 1. Build chord types array
    sourceDb.suffixes.forEach(suffix => {
      // Create a simplified name or just use the suffix
      db.chordTypes.push({
        id: suffix,
        name: suffix,
        formula: '', // The source DB doesn't have interval formulas
        category: suffix.includes('maj') ? 'major' : suffix.includes('m') ? 'minor' : 'other'
      });
    });

    // 2. Build voicings
    Object.keys(sourceDb.chords).forEach(root => {
      // Map sharp names (e.g. C#) properly
      const formattedRoot = root.replace('sharp', '#');
      db.voicings[formattedRoot] = {};

      sourceDb.chords[root].forEach(chordDef => {
        const typeId = chordDef.suffix;
        db.voicings[formattedRoot][typeId] = [];

        chordDef.positions.forEach(pos => {
          // Convert to absolute frets
          const absoluteFrets = pos.frets.map(f => {
            if (f === -1) return -1;
            if (f === 0) return 0;
            return f + pos.baseFret - 1;
          });

          const minFret = absoluteFrets.filter(f => f > 0).length > 0 
            ? Math.min(...absoluteFrets.filter(f => f > 0)) 
            : 0;

          const notes = absoluteFrets.map((f, i) => {
            if (f === -1) return 'X';
            return getNoteAtFret(tuningLowToHigh[i], f).name;
          });

          const isOpen = absoluteFrets.some(f => f === 0);
          
          let barFret = null;
          if (pos.barres && pos.barres.length > 0) {
            barFret = pos.barres[0] + pos.baseFret - 1;
          }

          db.voicings[formattedRoot][typeId].push({
            id: `${formattedRoot}-${typeId}-${fretsToIdString(absoluteFrets)}`,
            frets: absoluteFrets,
            fingers: pos.fingers, // new field: array of fingers
            notes,
            minFret,
            barFret,
            isOpen
          });
        });
      });
    });

    fs.writeFileSync(outputPath, JSON.stringify(db, null, 2));
    
    let totalVoicings = 0;
    Object.values(db.voicings).forEach(root => {
      Object.values(root).forEach(arr => {
        totalVoicings += arr.length;
      });
    });

    console.log(`✅ Conversion complete. Saved to ${outputPath}`);
    console.log(`   Total voicings: ${totalVoicings}`);
    console.log(`   Chord types: ${db.chordTypes.length}`);
  });
}).on('error', (err) => {
  console.error('Failed to download DB:', err);
});
