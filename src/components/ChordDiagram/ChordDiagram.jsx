import './ChordDiagram.css';

/**
 * Renders a vertical chord box diagram using SVG.
 * 
 * @param {number[]} frets - Array of 6 integers representing fret positions (-1 for muted, 0 for open)
 * @param {number[]} fingers - Array of 6 integers representing finger numbers (0 for open/muted, 1-4 for fingers)
 * @param {string[]} notes - Array of 6 strings representing the note names
 * @param {number} minFret - The lowest fretted note (used to calculate starting fret)
 * @param {number|null} barFret - Fret number to draw a barre across (optional)
 * @param {string} title - Optional title to display below the chord
 * @param {string} subtitle - Optional subtitle (e.g. interval formula)
 * @param {boolean} highlightRoot - Whether to highlight the root note differently
 * @param {string} rootNote - The root note name to check against if highlighting
 * @param {boolean} isModal - Whether this diagram is being rendered inside the fullscreen modal
 */
export default function ChordDiagram({
  frets,
  fingers = [],
  notes = [],
  minFret = 0,
  barFret = null,
  title = '',
  subtitle = '',
  highlightRoot = false,
  rootNote = '',
  isModal = false,
}) {
  const numStrings = 6;
  const fretted = frets.filter(f => f > 0);
  const maxFret = fretted.length > 0 ? Math.max(...fretted) : 0;

  // Calculate the starting fret for the grid.
  // If minFret is 0, 1, or 2, we show the nut (fret 0) down.
  // If minFret > 2, we shift the grid down to start at minFret.
  const startFret = minFret > 2 ? minFret : 1;
  const isNut = startFret === 1;

  // Dynamically size the grid to fit the highest fret.
  // Standard is 4 frets, but some open chords might stretch to fret 5.
  const requiredFrets = maxFret > 0 ? (maxFret - startFret + 1) : 4;
  const numFrets = Math.max(4, requiredFrets);

  // SVG Geometry
  const width = 120;
  const height = 150;
  const margin = { top: 30, right: 20, bottom: 10, left: 20 };
  
  const gridWidth = width - margin.left - margin.right;
  const gridHeight = height - margin.top - margin.bottom;
  
  const stringSpacing = gridWidth / (numStrings - 1);
  const fretSpacing = gridHeight / numFrets;

  // Generate grid lines
  const stringLines = Array.from({ length: numStrings }).map((_, i) => margin.left + i * stringSpacing);
  const fretLines = Array.from({ length: numFrets + 1 }).map((_, i) => margin.top + i * fretSpacing);

  return (
    <div className={`chord-diagram-container ${isModal ? 'modal-view' : ''}`}>
      <svg width={width} height={height} className="chord-diagram">
        {/* Fret Label (e.g. "3fr") */}
        {!isNut && (
          <text 
            x={margin.left - 4} 
            y={margin.top + fretSpacing / 2} 
            className="chord-diagram-label"
            textAnchor="end"
            alignmentBaseline="middle"
          >
            {startFret}fr
          </text>
        )}

        {/* Fret Grid Lines */}
        {fretLines.map((y, i) => (
          <line
            key={`fret-${i}`}
            x1={margin.left}
            y1={y}
            x2={width - margin.right}
            y2={y}
            className={`chord-diagram-grid ${i === 0 && isNut ? 'chord-diagram-nut' : ''}`}
          />
        ))}

        {/* String Grid Lines */}
        {stringLines.map((x, i) => (
          <line
            key={`string-${i}`}
            x1={x}
            y1={margin.top}
            x2={x}
            y2={height - margin.bottom}
            className="chord-diagram-grid"
          />
        ))}

        {/* Markers (X / O / Dots) */}
        {frets.map((fret, i) => {
          const x = stringLines[i];
          const noteName = notes[i] || '';
          const isRoot = highlightRoot && noteName === rootNote;

          if (fret === -1) {
            // Muted string (X) above the nut
            return (
              <text
                key={`marker-${i}`}
                x={x}
                y={margin.top - 10}
                className="chord-diagram-marker muted"
                textAnchor="middle"
              >
                ×
              </text>
            );
          } else if (fret === 0) {
            // Open string (O) above the nut
            return (
              <text
                key={`marker-${i}`}
                x={x}
                y={margin.top - 10}
                className="chord-diagram-marker open"
                textAnchor="middle"
              >
                ○
              </text>
            );
          } else {
            // Fretted note dot
            // Calculate y position relative to the grid start
            const relativeFret = fret - startFret + 1;
            
            // If the note falls outside the visual grid, we don't render the dot 
            if (relativeFret < 1 || relativeFret > numFrets) return null;

            const y = margin.top + (relativeFret - 0.5) * fretSpacing;
            const finger = fingers[i];

            return (
              <g key={`marker-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={8}
                  className={`chord-diagram-dot ${isRoot ? 'root' : ''}`}
                />
                {finger > 0 && (
                  <text
                    x={x}
                    y={y + 1}
                    className="chord-diagram-finger"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          }
        })}

        {/* Optional Barre Indicator */}
        {barFret !== null && (
          <line
            x1={stringLines[0] - 2}
            y1={margin.top + (barFret - startFret + 0.5) * fretSpacing}
            x2={stringLines[numStrings - 1] + 2}
            y2={margin.top + (barFret - startFret + 0.5) * fretSpacing}
            className="chord-diagram-barre"
          />
        )}
      </svg>
      
      {title && <div className="chord-diagram-title">{title}</div>}
      {subtitle && <div className="chord-diagram-subtitle">{subtitle}</div>}
    </div>
  );
}
