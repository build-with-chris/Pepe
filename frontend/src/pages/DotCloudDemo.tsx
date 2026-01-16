import React, { useState } from 'react';
import DotCloudImage from '@/components/ui/DotCloudImage';
import { disciplinesOptions } from '@/constraints/disciplines';
import PepeLogo from '@/assets/Logos/Logo PepeShows weiß.png';

// Map discipline names to available icon files
const iconMap: Record<string, string> = {
  'Cyr-Wheel': 'cyrwheel',
  'Jonglage': 'juggling',
  'Zauberer': 'magician',
  'Logo': 'logo',
  'Breakdance': 'breakdance',
  'Handstand': 'handstand',
  'Pantomime': 'pantomime',
  'Contemporary Dance': 'contemporary',
  'Partnerakrobatik': 'partnerakrobatik',
  'Luftakrobatik': 'luftakrobatik',
  'Chinese Pole': 'pole',
  'Verantwortung': 'world',
};

// Get available disciplines (ones with icons)
const availableDisciplines = disciplinesOptions.filter(d => iconMap[d]);

// Color options
const colorOptions = [
  { name: 'Gold', value: 'var(--pepe-gold)' },
  { name: 'Bronze', value: 'var(--pepe-bronze)' },
  { name: 'Amber', value: 'var(--pepe-amber)' },
  { name: 'Copper', value: 'var(--pepe-copper)' },
  { name: 'White', value: '#FFFFFF' },
];

/**
 * Demo Page for DotCloudImage Component - Interactive Configurator
 */
export default function DotCloudDemo() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null); // Start with no selection
  const [size, setSize] = useState(400);
  const [density, setDensity] = useState(1.0);
  const [color, setColor] = useState(colorOptions[0].value);
  const [useManualAnimation, setUseManualAnimation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationPosition, setAnimationPosition] = useState(100); // 0-100%
  const [minDotSize, setMinDotSize] = useState(0.5);
  const [maxDotSize, setMaxDotSize] = useState(5.0);
  const [sampleGap, setSampleGap] = useState(3); // 1-10, increment 1
  const [showGrid, setShowGrid] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true); // Onboarding tooltip

  const iconName = selectedDiscipline ? iconMap[selectedDiscipline] : null;

  // Auto-dismiss onboarding after 3 seconds
  React.useEffect(() => {
    if (!showOnboarding) return;
    const timer = setTimeout(() => setShowOnboarding(false), 3000);
    return () => clearTimeout(timer);
  }, [showOnboarding]);

  // Auto-play animation loop
  React.useEffect(() => {
    if (!isPlaying) return;

    let animationFrame: number;
    const startTime = performance.now();
    const duration = 3000; // 3 seconds loop

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;
      const position = Math.sin(progress * Math.PI * 2) * 50 + 50; // 0-100 oscillation
      setAnimationPosition(position);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  return (
    <div style={{ background: 'var(--pepe-black)', minHeight: '100vh', paddingTop: 'var(--space-20)' }}>
      {/* Compact Header */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--pepe-line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h1 className="h4" style={{ color: 'var(--pepe-gold)' }}>DotIcon Config</h1>
        <img src={PepeLogo} alt="Pepe" style={{ width: '120px', height: '40px', objectFit: 'contain' }} />
      </div>

      {/* Compact Controls Panel */}
      <div style={{
        padding: 'var(--space-6)',
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'var(--pepe-ink)',
        borderBottom: '1px solid var(--pepe-line)'
      }}>
        {/* Row 1: Icon + Color */}
        <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          {/* Icon Selector */}
          <div style={{ flex: '0 0 auto', position: 'relative' }}>
            <label className="overline" style={{ color: 'var(--pepe-t60)', marginBottom: 'var(--space-2)', display: 'block' }}>
              ICON
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
              {availableDisciplines.map((discipline) => {
                const isSelected = discipline === selectedDiscipline;
                const iconFile = iconMap[discipline];
                return (
                  <div key={discipline} style={{ position: 'relative', display: 'inline-block' }}>
                    <button
                      onClick={() => {
                        setSelectedDiscipline(discipline);
                        setShowOnboarding(false);
                      }}
                      className="btn btn-xs icon-btn-with-tooltip"
                      style={{
                        background: isSelected ? 'var(--pepe-gold)' : 'var(--pepe-surface)',
                        color: isSelected ? 'var(--pepe-black)' : 'var(--pepe-t80)',
                        border: 'none',
                        padding: 'var(--space-1) var(--space-2)',
                        fontSize: 'var(--text-xs)'
                      }}
                    >
                      {discipline}
                    </button>
                    <div
                      className="icon-tooltip"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(8px)',
                        padding: 'var(--space-2)',
                        background: 'var(--pepe-black)',
                        border: '2px solid var(--pepe-gold)',
                        borderRadius: 'var(--radius-lg)',
                        pointerEvents: 'none',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}
                    >
                      <img
                        src={`/doticons/${iconFile}.jpg`}
                        alt={discipline}
                        style={{
                          width: '200px',
                          height: '200px',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Onboarding Tooltip */}
            {showOnboarding && (
              <div
                onClick={() => setShowOnboarding(false)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0, 0, 0, 0.85)',
                  border: '1px solid var(--pepe-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3) var(--space-4)',
                  color: 'var(--pepe-t80)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '400',
                  textAlign: 'center',
                  cursor: 'pointer',
                  zIndex: 9999,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  whiteSpace: 'nowrap'
                }}
              >
                Select icon and start adjusting
              </div>
            )}
          </div>

          {/* Color */}
          <div style={{ flex: '0 0 auto' }}>
            <label className="overline" style={{ color: 'var(--pepe-t60)', marginBottom: 'var(--space-2)', display: 'block' }}>
              COLOR
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              {colorOptions.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => setColor(opt.value)}
                  className="btn btn-xs"
                  style={{
                    background: color === opt.value ? 'var(--pepe-gold)' : 'var(--pepe-surface)',
                    color: color === opt.value ? 'var(--pepe-black)' : 'var(--pepe-t80)',
                    border: 'none',
                    padding: 'var(--space-1) var(--space-2)',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Row 2: Sliders - Compact Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-4)'
        }}>
          <div>
            <label className="caption" style={{ color: 'var(--pepe-t80)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Density: {density.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--pepe-gold)' }}
            />
          </div>

          <div>
            <label className="caption" style={{ color: 'var(--pepe-t80)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Min Dot: {minDotSize.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={minDotSize}
              onChange={(e) => setMinDotSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--pepe-gold)' }}
            />
          </div>

          <div>
            <label className="caption" style={{ color: 'var(--pepe-t80)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Max Dot: {maxDotSize.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="10.0"
              step="0.1"
              value={maxDotSize}
              onChange={(e) => setMaxDotSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--pepe-gold)' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label className="caption" style={{ color: 'var(--pepe-t80)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Sample Gap: {sampleGap}
              <span style={{ color: 'var(--pepe-t60)', marginLeft: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                (1 = most particles, 10 = fewest)
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={sampleGap}
              onChange={(e) => setSampleGap(Number(e.target.value))}
              list="gap-markers"
              style={{ width: '100%', accentColor: 'var(--pepe-gold)' }}
            />
            <datalist id="gap-markers">
              <option value="1" label="1"></option>
              <option value="2" label="2"></option>
              <option value="3" label="3"></option>
              <option value="4" label="4"></option>
              <option value="5" label="5"></option>
              <option value="6" label="6"></option>
              <option value="7" label="7"></option>
              <option value="8" label="8"></option>
              <option value="9" label="9"></option>
              <option value="10" label="10"></option>
            </datalist>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-0-5)' }}>
              <span className="caption" style={{ color: 'var(--pepe-t40)', fontSize: 'var(--text-xs)' }}>1</span>
              <span className="caption" style={{ color: 'var(--pepe-t40)', fontSize: 'var(--text-xs)' }}>3</span>
              <span className="caption" style={{ color: 'var(--pepe-t40)', fontSize: 'var(--text-xs)' }}>5</span>
              <span className="caption" style={{ color: 'var(--pepe-t40)', fontSize: 'var(--text-xs)' }}>7</span>
              <span className="caption" style={{ color: 'var(--pepe-t40)', fontSize: 'var(--text-xs)' }}>10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Single DotIcon Display */}
      <div style={{
        padding: 'var(--space-12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh'
      }}>
        {/* DotIcon Display */}
        <div
          style={{
            position: 'relative',
            border: showGrid ? '2px solid var(--pepe-gold)' : 'none',
            width: size * (iconName === 'logo' ? 3 : 1),
            height: size,
          }}
        >
          {/* Grid Lines Overlay */}
          {showGrid && (
            <>
              {/* Vertical center line */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--pepe-gold)',
                opacity: 0.5,
                pointerEvents: 'none'
              }} />
              {/* Horizontal center line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'var(--pepe-gold)',
                opacity: 0.5,
                pointerEvents: 'none'
              }} />
              {/* Quarter lines - vertical */}
              <div style={{
                position: 'absolute',
                left: '25%',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--pepe-gold)',
                opacity: 0.2,
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                left: '75%',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--pepe-gold)',
                opacity: 0.2,
                pointerEvents: 'none'
              }} />
              {/* Quarter lines - horizontal */}
              <div style={{
                position: 'absolute',
                top: '25%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'var(--pepe-gold)',
                opacity: 0.2,
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                top: '75%',
                left: 0,
                right: 0,
                height: '1px',
                background: 'var(--pepe-gold)',
                opacity: 0.2,
                pointerEvents: 'none'
              }} />
            </>
          )}

          {iconName ? (
            <DotCloudImage
              disciplineId={`${iconName}-config`}
              size={size}
              density={density}
              color={color}
              aspectRatio={iconName === 'logo' ? 3 : 1}
              manualAnimationPosition={useManualAnimation ? animationPosition : undefined}
              sampleGap={sampleGap}
              minDotSize={minDotSize}
              maxDotSize={maxDotSize}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              color: 'var(--pepe-t40)',
              fontSize: 'var(--text-lg)'
            }}>
              No icon selected
            </div>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <p className="caption" style={{ color: 'var(--pepe-t60)' }}>
            {selectedDiscipline ? `${selectedDiscipline} • ` : ''}
            {size}px • Density: {density.toFixed(1)} • Gap: {sampleGap}
          </p>
        </div>
      </div>

      {/* Sticky Animation Controls - Bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        background: 'var(--pepe-ink)',
        padding: 'var(--space-3) var(--space-6)',
        borderTop: '1px solid var(--pepe-line)',
        zIndex: 50,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ minWidth: '120px' }}>
          <label className="caption" style={{ color: 'var(--pepe-t80)', display: 'block', marginBottom: 'var(--space-1)' }}>
            Size: {size}px
          </label>
          <input
            type="range"
            min="100"
            max="800"
            step="50"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--pepe-gold)' }}
          />
        </div>

        <button
          onClick={() => {
            setUseManualAnimation(!useManualAnimation);
            if (!useManualAnimation) setIsPlaying(false);
          }}
          className="btn btn-xs"
          style={{
            background: useManualAnimation ? 'var(--pepe-gold)' : 'var(--pepe-surface)',
            color: useManualAnimation ? 'var(--pepe-black)' : 'var(--pepe-t80)',
            border: 'none',
            padding: 'var(--space-1) var(--space-3)',
            whiteSpace: 'nowrap'
          }}
        >
          Manual: {useManualAnimation ? 'ON' : 'OFF'}
        </button>

        <div style={{ flex: 1, minWidth: '200px', maxWidth: '400px' }}>
          <label className="caption" style={{ color: 'var(--pepe-t80)', display: 'block', marginBottom: 'var(--space-1)' }}>
            Animation: {Math.round(animationPosition)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={animationPosition}
            onChange={(e) => {
              setAnimationPosition(Number(e.target.value));
              setIsPlaying(false);
            }}
            disabled={!useManualAnimation}
            style={{ width: '100%', accentColor: 'var(--pepe-gold)', opacity: useManualAnimation ? 1 : 0.5 }}
          />
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={!useManualAnimation}
          className="btn btn-xs"
          style={{
            background: isPlaying ? 'var(--pepe-gold)' : 'var(--pepe-surface)',
            color: isPlaying ? 'var(--pepe-black)' : 'var(--pepe-t80)',
            border: 'none',
            padding: 'var(--space-1) var(--space-3)',
            whiteSpace: 'nowrap',
            opacity: useManualAnimation ? 1 : 0.5,
            cursor: useManualAnimation ? 'pointer' : 'not-allowed'
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className="btn btn-xs"
          style={{
            background: showGrid ? 'var(--pepe-gold)' : 'var(--pepe-surface)',
            color: showGrid ? 'var(--pepe-black)' : 'var(--pepe-t80)',
            border: 'none',
            padding: 'var(--space-1) var(--space-3)',
            whiteSpace: 'nowrap'
          }}
        >
          Grid: {showGrid ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Tooltip CSS */}
      <style>{`
        .icon-btn-with-tooltip:hover + .icon-tooltip {
          opacity: 1 !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
