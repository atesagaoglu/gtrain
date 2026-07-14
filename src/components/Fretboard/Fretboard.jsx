import { useMemo } from 'react';
import {
  Note,
  SINGLE_DOT_FRETS,
  DOUBLE_DOT_FRETS,
  DEFAULT_NUM_FRETS,
} from '../../utils/musicTheory';
import { useSettings } from '../../contexts/SettingsContext';
import './Fretboard.css';

export default function Fretboard({
  onFretClick,
  highlightedFrets = [],
  activeStrings = null,
  numFrets = DEFAULT_NUM_FRETS,
}) {
  const { tuning, accidentalPref, skin, showFretNumbers } = useSettings();

  const PADDING_LEFT   = 70;
  const PADDING_RIGHT  = 20;
  const PADDING_TOP    = 30;
  const PADDING_BOTTOM = 40;

  const NUT_WIDTH       = 10;
  const FRET_AREA_START = PADDING_LEFT + NUT_WIDTH;

  const FRETBOARD_HEIGHT = 160;
  const STRING_COUNT     = tuning.length;
  const STRING_PADDING   = 18;
  const STRING_AREA      = FRETBOARD_HEIGHT - STRING_PADDING * 2;
  const STRING_GAP       = STRING_AREA / (STRING_COUNT - 1);

  const fretPositions = useMemo(() => {
    const SCALE_LENGTH = 1200;
    const positions = [FRET_AREA_START];
    for (let i = 1; i <= numFrets; i++) {
      positions.push(FRET_AREA_START + SCALE_LENGTH * (1 - Math.pow(2, -i / 12)));
    }
    return positions;
  }, [numFrets]);

  const BOARD_END    = fretPositions[numFrets];
  const TOTAL_WIDTH  = BOARD_END + PADDING_RIGHT;
  const TOTAL_HEIGHT = PADDING_TOP + FRETBOARD_HEIGHT + PADDING_BOTTOM;

  const stringY = (idx) => PADDING_TOP + STRING_PADDING + STRING_GAP * idx;

  const fretCentreX = (fret) => {
    if (fret === 0) return PADDING_LEFT - 6;
    return (fretPositions[fret - 1] + fretPositions[fret]) / 2;
  };

  const fretZoneWidth = (fret) => {
    if (fret === 0) return NUT_WIDTH + 24;
    return fretPositions[fret] - fretPositions[fret - 1];
  };

  const fretZoneLeft = (fret) => {
    if (fret === 0) return PADDING_LEFT - 30;
    return fretPositions[fret - 1];
  };

  const highlightMap = useMemo(() => {
    const map = new Map();
    for (const h of highlightedFrets) {
      map.set(`${h.string}-${h.fret}`, h);
    }
    return map;
  }, [highlightedFrets]);

  const stringThickness = (idx) => [1, 1.3, 1.8, 2.4, 3.0, 3.5][idx] ?? 2;
  const stringColor     = (idx) => (idx <= 1 ? '#d8d8d8' : '#b89860');
  const stringHighlight = (idx) => (idx <= 1 ? 'rgba(255,255,255,0.12)' : 'rgba(184,152,96,0.12)');

  const formatStringLabel = (noteStr, idx) => {
    const note = Note.from(noteStr);
    let label = note.formatName(accidentalPref);
    if (idx === tuning.length - 1 && note.index === 4) return label.toLowerCase();
    return label;
  };

  const singleDots = SINGLE_DOT_FRETS.filter((f) => f <= numFrets);
  const doubleDots = DOUBLE_DOT_FRETS.filter((f) => f <= numFrets);

  const boardCentreY = PADDING_TOP + FRETBOARD_HEIGHT / 2;

  const skinColorsMap = {
    rosewood: { stops: ['#5a3520', '#4a2c1a', '#3a2015', '#4a2c1a', '#5a3520'], stroke: '#6a5040' },
    maple:    { stops: ['#e6c89c', '#d2b482', '#c1a576', '#d2b482', '#e6c89c'], stroke: '#bca171' },
    ebony:    { stops: ['#2a2a2a', '#1a1a1a', '#111111', '#1a1a1a', '#2a2a2a'], stroke: '#333333' }
  };
  const activeSkin = skinColorsMap[skin] || skinColorsMap.rosewood;

  return (
    <div className="fretboard-wrapper">
      <svg
        viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
        className="fretboard-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="fb-wood" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={activeSkin.stops[0]} />
            <stop offset="15%"  stopColor={activeSkin.stops[1]} />
            <stop offset="50%"  stopColor={activeSkin.stops[2]} />
            <stop offset="85%"  stopColor={activeSkin.stops[3]} />
            <stop offset="100%" stopColor={activeSkin.stops[4]} />
          </linearGradient>

          <pattern id="fb-grain" x="0" y="0" width="300" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="1" x2="300" y2="1" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
            <line x1="0" y1="4" x2="300" y2="4.5" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
            <line x1="0" y1="7" x2="300" y2="6.8" stroke="rgba(0,0,0,0.04)" strokeWidth="0.6" />
          </pattern>

          <linearGradient id="fb-fret" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#666" />
            <stop offset="30%"  stopColor="#e4e4e4" />
            <stop offset="50%"  stopColor="#fff" />
            <stop offset="70%"  stopColor="#e4e4e4" />
            <stop offset="100%" stopColor="#666" />
          </linearGradient>

          <linearGradient id="fb-nut" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#e8e0c8" />
            <stop offset="50%"  stopColor="#f5f0e0" />
            <stop offset="100%" stopColor="#e0d8c0" />
          </linearGradient>

          <filter id="noteGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="boardShadow" x="-2%" y="-5%" width="104%" height="115%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        <rect
          x={PADDING_LEFT - 2}
          y={PADDING_TOP - 2}
          width={BOARD_END - PADDING_LEFT + 4}
          height={FRETBOARD_HEIGHT + 4}
          rx="4"
          fill="none"
          stroke={activeSkin.stroke}
          strokeWidth="2"
          filter="url(#boardShadow)"
        />

        <rect x={PADDING_LEFT} y={PADDING_TOP} width={BOARD_END - PADDING_LEFT} height={FRETBOARD_HEIGHT} rx="3" fill="url(#fb-wood)" />
        <rect x={PADDING_LEFT} y={PADDING_TOP} width={BOARD_END - PADDING_LEFT} height={FRETBOARD_HEIGHT} rx="3" fill="url(#fb-grain)" />

        {Array.from({ length: numFrets + 1 }, (_, fret) => {
          const left = fretZoneLeft(fret);
          const w = fretZoneWidth(fret);
          const shade = fret % 2 === 0 ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.02)';
          return (
            <rect
              key={`zone-${fret}`}
              x={Math.max(left, PADDING_LEFT)}
              y={PADDING_TOP}
              width={fret === 0 ? NUT_WIDTH : Math.min(w, BOARD_END - left)}
              height={FRETBOARD_HEIGHT}
              fill={shade}
            />
          );
        })}

        <rect x={PADDING_LEFT} y={PADDING_TOP - 3} width={NUT_WIDTH} height={FRETBOARD_HEIGHT + 6} rx="2" fill="url(#fb-nut)" />
        <line x1={PADDING_LEFT + NUT_WIDTH} y1={PADDING_TOP - 1} x2={PADDING_LEFT + NUT_WIDTH} y2={PADDING_TOP + FRETBOARD_HEIGHT + 1} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />

        {singleDots.map((fret) => <circle key={`inlay-${fret}`} cx={fretCentreX(fret)} cy={boardCentreY} r="5" fill="var(--inlay-color)" opacity="0.18" />)}
        {doubleDots.map((fret) => (
          <g key={`dinlay-${fret}`}>
            <circle cx={fretCentreX(fret)} cy={boardCentreY - 26} r="5" fill="var(--inlay-color)" opacity="0.18" />
            <circle cx={fretCentreX(fret)} cy={boardCentreY + 26} r="5" fill="var(--inlay-color)" opacity="0.18" />
          </g>
        ))}

        {fretPositions.slice(1).map((x, i) => (
          <g key={`fret-${i + 1}`}>
            <rect x={x - 1} y={PADDING_TOP} width="5" height={FRETBOARD_HEIGHT} fill="rgba(0,0,0,0.3)" />
            <rect x={x - 2} y={PADDING_TOP} width="4" height={FRETBOARD_HEIGHT} fill="url(#fb-fret)" rx="1" />
          </g>
        ))}

        {tuning.map((_, idx) => {
          const y = stringY(idx);
          const isDimmed = activeStrings !== null && !activeStrings.has(idx);
          const thick = stringThickness(idx);
          return (
            <g key={`string-${idx}`}>
              <line x1={PADDING_LEFT} y1={y + 1} x2={BOARD_END} y2={y + 1} stroke="rgba(0,0,0,0.25)" strokeWidth={thick + 0.5} opacity={isDimmed ? 0.1 : 1} />
              <line x1={PADDING_LEFT} y1={y - 0.5} x2={BOARD_END} y2={y - 0.5} stroke={stringHighlight(idx)} strokeWidth={thick * 0.5} opacity={isDimmed ? 0.05 : 1} />
              <line x1={PADDING_LEFT} y1={y} x2={BOARD_END} y2={y} stroke={stringColor(idx)} strokeWidth={thick} opacity={isDimmed ? 0.15 : 0.8} />
            </g>
          );
        })}

        {Array.from({ length: numFrets + 1 }, (_, fret) => {
          if (fret === 0 || !showFretNumbers) return null;
          return <text key={`fretnum-${fret}`} x={fretCentreX(fret)} y={PADDING_TOP + FRETBOARD_HEIGHT + 18} textAnchor="middle" className="fretboard-fret-number">{fret}</text>;
        })}

        {singleDots.map((fret) => <circle key={`side-${fret}`} cx={fretCentreX(fret)} cy={PADDING_TOP + FRETBOARD_HEIGHT + (showFretNumbers ? 30 : 15)} r="3" fill="var(--text-muted)" opacity="0.4" />)}
        {doubleDots.map((fret) => (
          <g key={`side-d-${fret}`}>
            <circle cx={fretCentreX(fret) - 6} cy={PADDING_TOP + FRETBOARD_HEIGHT + (showFretNumbers ? 30 : 15)} r="3" fill="var(--text-muted)" opacity="0.4" />
            <circle cx={fretCentreX(fret) + 6} cy={PADDING_TOP + FRETBOARD_HEIGHT + (showFretNumbers ? 30 : 15)} r="3" fill="var(--text-muted)" opacity="0.4" />
          </g>
        ))}

        {highlightedFrets.map((h) => {
          const cy = stringY(h.string);
          
          if (h.fret === 0) {
            // Precise alignment over the string label
            return (
              <g key={`hl-${h.string}-${h.fret}`} className={h.pulse ? 'note-pulse' : ''}>
                <circle cx={PADDING_LEFT - 21} cy={cy} r="12" fill={h.color || 'var(--accent)'} opacity="0.92" filter="url(#noteGlow)" />
                {h.label && <text x={PADDING_LEFT - 21} y={cy + 1} textAnchor="middle" dominantBaseline="middle" className="fretboard-note-label">{h.label}</text>}
              </g>
            );
          }

          const cx = fretCentreX(h.fret);
          return (
            <g key={`hl-${h.string}-${h.fret}`} className={h.pulse ? 'note-pulse' : ''}>
              <circle cx={cx} cy={cy} r="12" fill={h.color || 'var(--accent)'} opacity="0.92" filter="url(#noteGlow)" />
              {h.label && <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" className="fretboard-note-label">{h.label}</text>}
            </g>
          );
        })}

        {/* ── Clickable hit zones and Open String Labels ─────────────────────────────── */}
        {tuning.map((noteStr, stringIdx) => {
          const isDimmed = activeStrings !== null && !activeStrings.has(stringIdx);
          if (isDimmed) return null;

          return Array.from({ length: numFrets + 1 }, (__, fret) => {
            const cy = stringY(stringIdx);
            const isHighlighted = highlightMap.has(`${stringIdx}-${fret}`);

            if (fret === 0) {
              return (
                <g 
                  key={`hit-${stringIdx}-${fret}`} 
                  className={`open-string-group ${isHighlighted ? 'hit-zone-highlighted' : ''}`}
                  onClick={() => onFretClick?.(stringIdx, fret)}
                >
                  <text
                    x={PADDING_LEFT - 14}
                    y={cy + 1}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fretboard-string-label"
                    opacity={isHighlighted ? 0 : 1} // Hide if highlighted since the circle draws the text
                  >
                    {formatStringLabel(noteStr, stringIdx)}
                  </text>
                  <rect
                    x={fretZoneLeft(fret)}
                    y={cy - STRING_GAP / 2}
                    width={fretZoneWidth(fret)}
                    height={STRING_GAP}
                    fill="transparent"
                    className="open-string-hit-zone"
                  />
                </g>
              );
            }

            return (
              <rect
                key={`hit-${stringIdx}-${fret}`}
                x={fretZoneLeft(fret)}
                y={cy - STRING_GAP / 2}
                width={fretZoneWidth(fret)}
                height={STRING_GAP}
                fill="transparent"
                className={`fretboard-hit-zone ${isHighlighted ? 'hit-zone-highlighted' : ''}`}
                rx="2"
                onClick={() => onFretClick?.(stringIdx, fret)}
              />
            );
          });
        })}
      </svg>
    </div>
  );
}
