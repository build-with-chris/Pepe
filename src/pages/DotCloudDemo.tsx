import { useState } from 'react';
import React from 'react';
import DotCloudImage from '@/components/ui/DotCloudImage';
import { disciplinesOptions } from '@/constraints/disciplines';

// Map discipline names to available icon files
const iconMap: Record<string, string> = {
  'Cyr-Wheel': 'cyrwheel',
  'Jonglage': 'juggling',
  'Zauberer': 'magician',
};

// Get available disciplines (ones with icons)
const availableDisciplines = disciplinesOptions.filter(d => iconMap[d]);

/**
 * Demo Page for DotCloudImage Component
 * Each icon gets exactly 100vh - scroll-triggered animation only
 */
export default function DotCloudDemo() {
  const [selectedDiscipline, setSelectedDiscipline] = useState(availableDisciplines[0]);
  const iconName = iconMap[selectedDiscipline];

  // Reset indicator on scroll
  const resetIndicator = () => {
    const indicator = document.getElementById('scroll-debug-indicator');
    if (indicator) {
      indicator.setAttribute('data-progress', '0');
    }
  };

  React.useEffect(() => {
    window.addEventListener('scroll', resetIndicator, { passive: true });
    return () => window.removeEventListener('scroll', resetIndicator);
  }, []);

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Fixed Scroll Debug Indicator */}
      <div
        id="scroll-debug-indicator"
        data-progress="0"
        style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          fontSize: '14px',
          color: 'yellow',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '8px 12px',
          borderRadius: '4px',
          opacity: 0.3,
          transition: 'opacity 0.2s'
        }}
      >
        scroll: 0.00
      </div>
      {/* Section 1: Hero + Selector - 100vh */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-center">
          DotCloud Icon System
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl text-center mb-12">
          Scroll-triggered particle animations • Nur Scrolling, kein Hover
        </p>

        {/* Discipline Selector */}
        <div className="mb-16">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 text-center">
            Select Discipline
          </h3>
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl">
            {disciplinesOptions.map((discipline) => {
              const hasIcon = iconMap[discipline];
              const isSelected = discipline === selectedDiscipline;

              return (
                <button
                  key={discipline}
                  onClick={() => hasIcon && setSelectedDiscipline(discipline)}
                  disabled={!hasIcon}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all text-sm
                    ${hasIcon
                      ? isSelected
                        ? 'bg-[var(--pepe-gold)] text-black shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-900 text-gray-600 cursor-not-allowed opacity-30'
                    }
                  `}
                >
                  {discipline}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-gray-500 animate-pulse">
          ↓ Scroll to see formation ↓
        </p>
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Icon 1: Cyr-Wheel */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Cyr-Wheel</h2>
        <p className="text-gray-400 mb-16">Large • 500px</p>
        <DotCloudImage
          disciplineId="cyrwheel"
          size={500}
          density={0.8}
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Icon 2: Jonglage */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Jonglage</h2>
        <p className="text-gray-400 mb-16">Large • 500px</p>
        <DotCloudImage
          disciplineId="juggling"
          size={500}
          density={0.8}
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Icon 3: Zauberer */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Zauberer</h2>
        <p className="text-gray-400 mb-16">Large • 500px</p>
        <DotCloudImage
          disciplineId="magician"
          size={500}
          density={0.8}
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Size Variation: Small */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Small Size</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline} • 300px</p>
        <DotCloudImage
          disciplineId={iconName}
          size={300}
          density={1.0}
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Size Variation: Medium */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Medium Size</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline} • 400px</p>
        <DotCloudImage
          disciplineId={iconName}
          size={400}
          density={0.9}
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Size Variation: Large */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Large Size</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline} • 600px</p>
        <DotCloudImage
          disciplineId={iconName}
          size={600}
          density={0.7}
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Density: Sparse */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Sparse Density</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline} • 0.5x • ~25-50 particles</p>
        <DotCloudImage
          disciplineId={iconName}
          size={450}
          density={0.5}
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Density: Normal */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Normal Density</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline} • 1.0x • ~50-100 particles</p>
        <DotCloudImage
          disciplineId={iconName}
          size={450}
          density={1.0}
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Density: Dense */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Dense</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline} • 1.5x • ~75-150 particles</p>
        <DotCloudImage
          disciplineId={iconName}
          size={450}
          density={1.5}
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Color: Gold */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Gold Color</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline}</p>
        <DotCloudImage
          disciplineId={iconName}
          size={450}
          density={1.0}
          color="var(--pepe-gold)"
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Color: Bronze */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Bronze Color</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline}</p>
        <DotCloudImage
          disciplineId={iconName}
          size={450}
          density={1.0}
          color="var(--pepe-bronze)"
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Color: Amber */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">Amber Color</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline}</p>
        <DotCloudImage
          disciplineId={iconName}
          size={450}
          density={1.0}
          color="var(--pepe-amber)"
        />
      </section>

      {/* Spacer */}
      <div className="h-screen" />

      {/* Color: White */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-3xl font-bold text-white mb-6">White Color</h2>
        <p className="text-gray-400 mb-16">{selectedDiscipline}</p>
        <DotCloudImage
          disciplineId={iconName}
          size={450}
          density={1.0}
          color="#FFFFFF"
        />
      </section>

      {/* Final: Technical Details */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h2 className="text-4xl font-bold text-white mb-12">
          Technical Features
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-xl font-medium text-white mb-4">✨ Animation</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Scroll-triggered (100% at viewport center)</li>
              <li>• Floating + scaling movement</li>
              <li>• Staggered timing per particle</li>
              <li>• 25-50px organic spread radius</li>
              <li>• No raster, no hover</li>
            </ul>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-xl font-medium text-white mb-4">⚡ Performance</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Size based on darkness</li>
              <li>• GPU-accelerated CSS</li>
              <li>• Passive scroll listeners</li>
              <li>• Reduced motion support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final Spacer */}
      <div className="h-screen" />
    </div>
  );
}
