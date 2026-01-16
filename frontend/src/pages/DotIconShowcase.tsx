import React, { useState, useEffect } from 'react';
import DotCloudImage from '@/components/ui/DotCloudImage';
import PepeLogo from '@/assets/Logos/Logo PepeShows weiß.png';

// Available icons
const availableIcons = [
  { id: 'logo', name: 'Logo PepeShows', aspectRatio: 3 },
  { id: 'breakdance', name: 'Breakdance', aspectRatio: 1 },
  { id: 'contemporary', name: 'Contemporary Dance', aspectRatio: 1 },
  { id: 'cyrwheel', name: 'Cyr-Wheel', aspectRatio: 1 },
  { id: 'handstand', name: 'Handstand', aspectRatio: 1 },
  { id: 'juggling', name: 'Jonglage', aspectRatio: 1 },
  { id: 'luftakrobatik', name: 'Luftakrobatik', aspectRatio: 1 },
  { id: 'magician', name: 'Zauberer', aspectRatio: 1 },
  { id: 'pantomime', name: 'Pantomime', aspectRatio: 1 },
  { id: 'partnerakrobatik', name: 'Partnerakrobatik', aspectRatio: 1 },
  { id: 'pole', name: 'Chinese Pole', aspectRatio: 1 },
  { id: 'world', name: 'Verantwortung', aspectRatio: 1 },
];

// Color presets
const colorPresets = [
  { name: 'Gold', value: '#D4A574', description: 'Primary golden accent' },
  { name: 'Bronze', value: '#B8860B', description: 'Deep bronze tone' },
  { name: 'Amber', value: '#FFBF00', description: 'Bright amber highlight' },
  { name: 'Copper', value: '#B87333', description: 'Warm copper tone' },
  { name: 'White', value: '#FFFFFF', description: 'Pure white' },
  { name: 'Crimson', value: '#DC143C', description: 'Bold red accent' },
  { name: 'Emerald', value: '#50C878', description: 'Fresh green' },
  { name: 'Sapphire', value: '#0F52BA', description: 'Deep blue' },
];

/**
 * DotIcon Showcase & Configurator
 * Interactive demo page with modern design, icon gallery, and live controls
 */
export default function DotIconShowcase() {
  // State
  const [selectedIcon, setSelectedIcon] = useState<string>('logo');
  const [size, setSize] = useState(400);
  const [density, setDensity] = useState(0.25);
  const [color, setColor] = useState('#D4A574');
  const [minDotSize, setMinDotSize] = useState(0.5);
  const [maxDotSize, setMaxDotSize] = useState(5.0);
  const [sampleGap, setSampleGap] = useState(2);
  const [showGrid, setShowGrid] = useState(false);
  const [manualAnimation, setManualAnimation] = useState(false);
  const [animationPosition, setAnimationPosition] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get current icon data
  const currentIcon = availableIcons.find(icon => icon.id === selectedIcon) || availableIcons[0];

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || !manualAnimation) return;

    let frame: number;
    const startTime = performance.now();
    const duration = 3000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;
      const position = Math.sin(progress * Math.PI * 2) * 50 + 50;
      setAnimationPosition(position);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, manualAnimation]);

  return (
    <div className="doticon-showcase">
      {/* Header */}
      <header className="showcase-header">
        <div className="showcase-container">
          <div className="header-content">
            <div>
              <h1 className="h2" style={{ margin: 0, color: 'var(--pepe-gold)' }}>
                DotIcon Showcase
              </h1>
              <p className="caption" style={{ marginTop: 'var(--space-1)', color: 'var(--pepe-t60)' }}>
                Interactive particle-based icon system
              </p>
            </div>
            <img src={PepeLogo} alt="PepeShows" className="header-logo" />
          </div>
        </div>
      </header>

      <div className="showcase-container">
        {/* Main Grid Layout */}
        <div className="showcase-grid">
          {/* Left Panel - Icon Gallery */}
          <aside className="icon-gallery">
            <div className="gallery-header">
              <h3 className="h5" style={{ color: 'var(--pepe-white)' }}>Icon Gallery</h3>
              <span className="badge">{availableIcons.length} Icons</span>
            </div>

            <div className="icon-grid">
              {availableIcons.map(icon => (
                <button
                  key={icon.id}
                  onClick={() => setSelectedIcon(icon.id)}
                  className={`icon-thumbnail ${selectedIcon === icon.id ? 'active' : ''}`}
                  title={icon.name}
                >
                  <div className="thumbnail-preview">
                    <img
                      src={`/doticons/${icon.id}.jpg`}
                      alt={icon.name}
                      className="thumbnail-image"
                    />
                  </div>
                  <span className="thumbnail-label">{icon.name}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Center - Preview Area */}
          <main className="preview-area">
            <div className="preview-card">
              <div className="preview-header">
                <h2 className="h4" style={{ color: 'var(--pepe-gold)' }}>
                  {currentIcon.name}
                </h2>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`btn-icon ${showGrid ? 'active' : ''}`}
                  title="Toggle grid"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="16" height="16" stroke="currentColor" strokeWidth="2"/>
                    <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="1"/>
                    <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </button>
              </div>

              <div className="preview-canvas">
                <div
                  className="icon-container"
                  style={{
                    width: size * currentIcon.aspectRatio,
                    height: size,
                    border: showGrid ? '2px solid var(--pepe-gold)' : 'none',
                    position: 'relative',
                  }}
                >
                  {/* Grid Overlay */}
                  {showGrid && (
                    <div className="grid-overlay">
                      <div className="grid-line grid-v" style={{ left: '25%' }} />
                      <div className="grid-line grid-v" style={{ left: '50%' }} />
                      <div className="grid-line grid-v" style={{ left: '75%' }} />
                      <div className="grid-line grid-h" style={{ top: '25%' }} />
                      <div className="grid-line grid-h" style={{ top: '50%' }} />
                      <div className="grid-line grid-h" style={{ top: '75%' }} />
                    </div>
                  )}

                  <DotCloudImage
                    disciplineId={selectedIcon}
                    size={size}
                    density={density}
                    color={color}
                    aspectRatio={currentIcon.aspectRatio}
                    minDotSize={minDotSize}
                    maxDotSize={maxDotSize}
                    sampleGap={sampleGap}
                    manualAnimationPosition={manualAnimation ? animationPosition : undefined}
                  />
                </div>

                <div className="preview-stats">
                  <span className="stat-item">
                    <strong>{size}px</strong> Size
                  </span>
                  <span className="stat-divider">•</span>
                  <span className="stat-item">
                    <strong>{density.toFixed(2)}x</strong> Density
                  </span>
                  <span className="stat-divider">•</span>
                  <span className="stat-item">
                    <strong>Gap {sampleGap}</strong>
                  </span>
                  <span className="stat-divider">•</span>
                  <span className="stat-item">
                    <strong>{currentIcon.aspectRatio}:1</strong> Ratio
                  </span>
                </div>
              </div>
            </div>
          </main>

          {/* Right Panel - Controls */}
          <aside className="controls-panel">
            <div className="controls-section">
              <h4 className="control-title">Color</h4>
              <div className="color-grid">
                {colorPresets.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => setColor(preset.value)}
                    className={`color-swatch ${color === preset.value ? 'active' : ''}`}
                    style={{ background: preset.value }}
                    title={preset.name}
                  >
                    {color === preset.value && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="controls-section">
              <h4 className="control-title">Size</h4>
              <div className="slider-group">
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="50"
                  value={size}
                  onChange={e => setSize(Number(e.target.value))}
                  className="slider"
                />
                <span className="slider-value">{size}px</span>
              </div>
            </div>

            <div className="controls-section">
              <h4 className="control-title">Density</h4>
              <div className="slider-group">
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={density}
                  onChange={e => setDensity(Number(e.target.value))}
                  className="slider"
                />
                <span className="slider-value">{density.toFixed(2)}x</span>
              </div>
            </div>

            <div className="controls-section">
              <h4 className="control-title">Dot Size Range</h4>
              <div className="slider-group">
                <label className="slider-label">Min: {minDotSize.toFixed(1)}px</label>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={minDotSize}
                  onChange={e => setMinDotSize(Number(e.target.value))}
                  className="slider"
                />
              </div>
              <div className="slider-group">
                <label className="slider-label">Max: {maxDotSize.toFixed(1)}px</label>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.1"
                  value={maxDotSize}
                  onChange={e => setMaxDotSize(Number(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            <div className="controls-section">
              <h4 className="control-title">Sample Gap</h4>
              <div className="slider-group">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={sampleGap}
                  onChange={e => setSampleGap(Number(e.target.value))}
                  className="slider"
                />
                <span className="slider-value">{sampleGap}</span>
              </div>
              <p className="control-hint">Lower = more particles (higher quality)</p>
            </div>

            <div className="controls-section">
              <h4 className="control-title">Animation</h4>
              <div className="toggle-group">
                <button
                  onClick={() => {
                    setManualAnimation(!manualAnimation);
                    if (manualAnimation) setIsPlaying(false);
                  }}
                  className={`btn-toggle ${manualAnimation ? 'active' : ''}`}
                >
                  Manual Control
                </button>
              </div>

              {manualAnimation && (
                <>
                  <div className="slider-group" style={{ marginTop: 'var(--space-3)' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={animationPosition}
                      onChange={e => {
                        setAnimationPosition(Number(e.target.value));
                        setIsPlaying(false);
                      }}
                      className="slider"
                    />
                    <span className="slider-value">{Math.round(animationPosition)}%</span>
                  </div>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="btn-play"
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play Loop'}
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>

        {/* Documentation Section */}
        <section className="documentation-section">
          <h2 className="h3" style={{ color: 'var(--pepe-white)' }}>Usage Guide</h2>

          <div className="doc-grid">
            <div className="doc-card">
              <h3 className="h5" style={{ color: 'var(--pepe-gold)' }}>Import Component</h3>
              <pre className="code-block">
{`import DotCloudImage from '@/components/ui/DotCloudImage';`}
              </pre>
            </div>

            <div className="doc-card">
              <h3 className="h5" style={{ color: 'var(--pepe-gold)' }}>Basic Usage</h3>
              <pre className="code-block">
{`<DotCloudImage
  disciplineId="${selectedIcon}"
  size={${size}}
  density={${density}}
  color="${color}"
  aspectRatio={${currentIcon.aspectRatio}}
/>`}
              </pre>
            </div>

            <div className="doc-card">
              <h3 className="h5" style={{ color: 'var(--pepe-gold)' }}>Advanced Options</h3>
              <pre className="code-block">
{`<DotCloudImage
  disciplineId="${selectedIcon}"
  size={${size}}
  density={${density}}
  color="${color}"
  minDotSize={${minDotSize}}
  maxDotSize={${maxDotSize}}
  sampleGap={${sampleGap}}
  manualAnimationPosition={${manualAnimation ? Math.round(animationPosition) : 'undefined'}}
/>`}
              </pre>
            </div>

            <div className="doc-card">
              <h3 className="h5" style={{ color: 'var(--pepe-gold)' }}>Props Reference</h3>
              <ul className="props-list">
                <li><code>disciplineId</code>: Icon identifier (required)</li>
                <li><code>size</code>: Canvas height in pixels</li>
                <li><code>density</code>: Particle density multiplier</li>
                <li><code>color</code>: Hex color for particles</li>
                <li><code>aspectRatio</code>: Width/height ratio</li>
                <li><code>sampleGap</code>: Pixel sampling interval (1-10)</li>
                <li><code>minDotSize</code> / <code>maxDotSize</code>: Particle size range</li>
                <li><code>manualAnimationPosition</code>: Animation control (0-100)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .doticon-showcase {
          min-height: 100vh;
          background: var(--pepe-black);
          padding-top: var(--space-20);
        }

        .showcase-header {
          background: var(--pepe-ink);
          border-bottom: 1px solid var(--pepe-line);
          padding: var(--space-6);
        }

        .showcase-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 var(--space-6);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-logo {
          height: 40px;
          object-fit: contain;
        }

        .badge {
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          color: var(--pepe-t60);
          background: var(--pepe-surface);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-md);
        }

        /* Grid Layout */
        .showcase-grid {
          display: grid;
          grid-template-columns: 250px 1fr 300px;
          gap: var(--space-8);
          margin: var(--space-8) 0;
        }

        /* Icon Gallery */
        .icon-gallery {
          background: var(--pepe-ink);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          height: fit-content;
          position: sticky;
          top: var(--space-24);
        }

        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .icon-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .icon-thumbnail {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--pepe-surface);
          border: 2px solid transparent;
          border-radius: var(--radius-lg);
          padding: var(--space-2);
          cursor: pointer;
          transition: all var(--duration-fast);
          text-align: left;
          width: 100%;
        }

        .icon-thumbnail:hover {
          background: var(--pepe-dark);
          border-color: var(--pepe-line);
        }

        .icon-thumbnail.active {
          background: var(--pepe-dark);
          border-color: var(--pepe-gold);
        }

        .thumbnail-preview {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--pepe-black);
          flex-shrink: 0;
        }

        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-label {
          font-size: var(--text-sm);
          color: var(--pepe-t80);
          font-weight: var(--font-medium);
        }

        .icon-thumbnail.active .thumbnail-label {
          color: var(--pepe-gold);
        }

        /* Preview Area */
        .preview-area {
          display: flex;
          flex-direction: column;
        }

        .preview-card {
          background: var(--pepe-ink);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--pepe-surface);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          color: var(--pepe-t60);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .btn-icon:hover {
          background: var(--pepe-dark);
          color: var(--pepe-t80);
        }

        .btn-icon.active {
          background: var(--pepe-gold);
          color: var(--pepe-black);
          border-color: var(--pepe-gold);
        }

        .preview-canvas {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
          padding: var(--space-8);
          background: var(--pepe-black);
          border-radius: var(--radius-lg);
        }

        .icon-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .grid-line {
          position: absolute;
          background: var(--pepe-gold);
          opacity: 0.3;
        }

        .grid-line.grid-v {
          width: 1px;
          height: 100%;
        }

        .grid-line.grid-h {
          height: 1px;
          width: 100%;
        }

        .preview-stats {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--pepe-t60);
        }

        .stat-item strong {
          color: var(--pepe-gold);
          font-weight: var(--font-semibold);
        }

        .stat-divider {
          color: var(--pepe-line);
        }

        /* Controls Panel */
        .controls-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          position: sticky;
          top: var(--space-24);
          height: fit-content;
        }

        .controls-section {
          background: var(--pepe-ink);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
        }

        .control-title {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--pepe-white);
          margin-bottom: var(--space-3);
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
        }

        .control-hint {
          font-size: var(--text-xs);
          color: var(--pepe-t48);
          margin-top: var(--space-2);
        }

        /* Color Grid */
        .color-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-2);
        }

        .color-swatch {
          width: 100%;
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          border: 2px solid transparent;
          cursor: pointer;
          transition: all var(--duration-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pepe-black);
        }

        .color-swatch:hover {
          transform: scale(1.05);
          border-color: var(--pepe-line-light);
        }

        .color-swatch.active {
          border-color: var(--pepe-white);
          box-shadow: 0 0 0 3px var(--pepe-gold-glow);
        }

        /* Sliders */
        .slider-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .slider-group:last-child {
          margin-bottom: 0;
        }

        .slider-label {
          font-size: var(--text-xs);
          color: var(--pepe-t64);
          font-weight: var(--font-medium);
        }

        .slider {
          width: 100%;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--pepe-surface);
          outline: none;
          -webkit-appearance: none;
          accent-color: var(--pepe-gold);
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--pepe-gold);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .slider::-webkit-slider-thumb:hover {
          background: var(--pepe-gold-hover);
          transform: scale(1.2);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--pepe-gold);
          cursor: pointer;
          border: none;
          transition: all var(--duration-fast);
        }

        .slider::-moz-range-thumb:hover {
          background: var(--pepe-gold-hover);
          transform: scale(1.2);
        }

        .slider-value {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--pepe-gold);
          text-align: right;
        }

        /* Buttons */
        .toggle-group {
          display: flex;
          gap: var(--space-2);
        }

        .btn-toggle {
          flex: 1;
          padding: var(--space-2) var(--space-3);
          background: var(--pepe-surface);
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          color: var(--pepe-t80);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .btn-toggle:hover {
          background: var(--pepe-dark);
          border-color: var(--pepe-line);
        }

        .btn-toggle.active {
          background: var(--pepe-gold);
          color: var(--pepe-black);
          border-color: var(--pepe-gold);
        }

        .btn-play {
          width: 100%;
          padding: var(--space-2);
          background: var(--pepe-gold);
          border: none;
          border-radius: var(--radius-md);
          color: var(--pepe-black);
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          cursor: pointer;
          transition: all var(--duration-fast);
          margin-top: var(--space-3);
        }

        .btn-play:hover {
          background: var(--pepe-gold-hover);
          transform: translateY(-1px);
        }

        /* Documentation Section */
        .documentation-section {
          margin: var(--space-12) 0;
          padding: var(--space-8);
          background: var(--pepe-ink);
          border-radius: var(--radius-xl);
        }

        .doc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--space-6);
          margin-top: var(--space-6);
        }

        .doc-card {
          background: var(--pepe-surface);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
        }

        .code-block {
          background: var(--pepe-black);
          color: var(--pepe-t80);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          overflow-x: auto;
          margin-top: var(--space-3);
          line-height: 1.6;
        }

        .props-list {
          list-style: none;
          padding: 0;
          margin: var(--space-3) 0 0;
        }

        .props-list li {
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--pepe-line2);
          font-size: var(--text-sm);
          color: var(--pepe-t64);
        }

        .props-list li:last-child {
          border-bottom: none;
        }

        .props-list code {
          color: var(--pepe-gold);
          font-family: var(--font-mono);
          font-weight: var(--font-semibold);
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .showcase-grid {
            grid-template-columns: 1fr;
          }

          .icon-gallery,
          .controls-panel {
            position: static;
          }

          .icon-grid {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .controls-panel {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .showcase-grid {
            gap: var(--space-4);
          }

          .preview-card {
            padding: var(--space-4);
          }

          .preview-canvas {
            padding: var(--space-4);
          }

          .doc-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
