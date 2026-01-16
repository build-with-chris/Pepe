/**
 * Color Demo Page - Pepe Shows Design System
 * Showcases all colors from tokens.css
 */

export default function ColorDemo() {
  const colorGroups = [
    {
      title: 'Core Black Tones',
      colors: [
        { name: 'Black', var: '--pepe-black', value: '#000000' },
        { name: 'Dark', var: '--pepe-dark', value: '#111111' },
        { name: 'Ink', var: '--pepe-ink', value: '#161616' },
        { name: 'Coal', var: '--pepe-coal', value: '#0A0A0A' },
        { name: 'Surface', var: '--pepe-surface', value: '#1A1A1A' },
      ]
    },
    {
      title: 'Text Hierarchy',
      colors: [
        { name: 'White', var: '--pepe-white', value: '#FFFFFF' },
        { name: 'T80', var: '--pepe-t80', value: 'rgba(255, 255, 255, 0.80)' },
        { name: 'T64', var: '--pepe-t64', value: 'rgba(255, 255, 255, 0.64)' },
        { name: 'T48', var: '--pepe-t48', value: 'rgba(255, 255, 255, 0.48)' },
        { name: 'T32', var: '--pepe-t32', value: 'rgba(255, 255, 255, 0.32)' },
      ]
    },
    {
      title: 'UI Elements',
      colors: [
        { name: 'Line', var: '--pepe-line', value: '#333333' },
        { name: 'Line 2', var: '--pepe-line2', value: '#292929' },
        { name: 'Line Light', var: '--pepe-line-light', value: '#3A3A3A' },
      ]
    },
    {
      title: 'Accent Colors - Warm Golden Theatre Lighting',
      colors: [
        { name: 'Gold', var: '--pepe-gold', value: '#D4A574' },
        { name: 'Gold Hover', var: '--pepe-gold-hover', value: '#E6B887' },
        { name: 'Gold Active', var: '--pepe-gold-active', value: '#C19A64' },
        { name: 'Gold Glow', var: '--pepe-gold-glow', value: 'rgba(212, 165, 116, 0.25)' },
        { name: 'Gold Glow Strong', var: '--pepe-gold-glow-strong', value: 'rgba(212, 165, 116, 0.4)' },
      ]
    },
    {
      title: 'Secondary Warm Tones',
      colors: [
        { name: 'Bronze', var: '--pepe-bronze', value: '#B8860B' },
        { name: 'Bronze Hover', var: '--pepe-bronze-hover', value: '#C69315' },
        { name: 'Bronze Active', var: '--pepe-bronze-active', value: '#9C6F09' },
        { name: 'Bronze Glow', var: '--pepe-bronze-glow', value: 'rgba(184, 134, 11, 0.25)' },
        { name: 'Amber', var: '--pepe-amber', value: '#FFBF00' },
        { name: 'Copper', var: '--pepe-copper', value: '#B87333' },
      ]
    },
    {
      title: 'Semantic Colors',
      colors: [
        { name: 'Success', var: '--pepe-success', value: '#00DC82' },
        { name: 'Success BG', var: '--pepe-success-bg', value: 'rgba(0, 220, 130, 0.1)' },
        { name: 'Warning', var: '--pepe-warning', value: '#FFB800' },
        { name: 'Warning BG', var: '--pepe-warning-bg', value: 'rgba(255, 184, 0, 0.1)' },
        { name: 'Error', var: '--pepe-error', value: '#FF3B3B' },
        { name: 'Error BG', var: '--pepe-error-bg', value: 'rgba(255, 59, 59, 0.1)' },
        { name: 'Info', var: '--pepe-info', value: '#0096FF' },
        { name: 'Info BG', var: '--pepe-info-bg', value: 'rgba(0, 150, 255, 0.1)' },
      ]
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--pepe-bg)',
      color: 'var(--pepe-text)',
      padding: '4rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'var(--text-6xl)',
          fontWeight: 'var(--font-bold)',
          marginBottom: '1rem',
          color: 'var(--pepe-gold)',
        }}>
          Pepe Shows Color System
        </h1>
        <p style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--pepe-t64)',
          marginBottom: '4rem',
        }}>
          Design tokens from <code style={{ color: 'var(--pepe-gold)' }}>tokens.css</code>
        </p>

        {colorGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: '2rem',
              color: 'var(--pepe-white)',
            }}>
              {group.title}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}>
              {group.colors.map((color) => (
                <div
                  key={color.var}
                  style={{
                    background: 'var(--pepe-surface)',
                    border: '1px solid var(--pepe-line)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Color Swatch */}
                  <div style={{
                    height: '120px',
                    background: `var(${color.var})`,
                    border: color.value.includes('255, 255, 255') ? '1px solid var(--pepe-line)' : 'none',
                  }} />

                  {/* Color Info */}
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-semibold)',
                      marginBottom: '0.5rem',
                      color: 'var(--pepe-white)',
                    }}>
                      {color.name}
                    </h3>
                    <code style={{
                      display: 'block',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--pepe-gold)',
                      marginBottom: '0.25rem',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {color.var}
                    </code>
                    <code style={{
                      display: 'block',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--pepe-t64)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {color.value}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
