import { useState } from 'react';
import React from 'react';
import DotCloudImage from '@/components/ui/DotCloudImage';
import { disciplinesOptions } from '@/constraints/disciplines';
import PepeLogo from '@/assets/Logos/Logo PepeShows weiß.png';

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
    <div className="bg-gradient-to-b from-black via-gray-900 to-black" style={{ paddingTop: '80px' }}>
      {/* Fixed Icon Selector at Top */}
      <section className="py-12 px-6 sticky top-20 z-40 bg-black/95 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6">
            <h1 className="text-2xl font-bold text-white">Piktogramm Auswahl</h1>
            <img
              src={PepeLogo}
              alt="Pepe Shows"
              style={{ width: '192px', height: '64px', objectFit: 'contain' }}
              className="hidden md:block"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
            {availableDisciplines.map((discipline) => {
              const isSelected = discipline === selectedDiscipline;
              return (
                <button
                  key={discipline}
                  onClick={() => setSelectedDiscipline(discipline)}
                  className={`filter-btn ${isSelected ? 'active' : ''}`}
                >
                  {discipline}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Show ALL variations of selected icon */}
      <div className="py-20">
        <h2 className="text-4xl font-bold text-center text-white mb-4">{selectedDiscipline}</h2>
        <p className="text-center text-gray-400 mb-20">Scroll langsam um die Animationen zu sehen</p>

        {/* Size: Small */}
        <section className="h-screen flex flex-col items-center justify-center px-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            Small Size (300px)
            <span id={`scroll-indicator-${iconName}-small`} className="text-sm font-mono text-gray-500">0.00</span>
          </h3>
          <p className="text-gray-400 mb-12">Density: 1.0</p>
          <DotCloudImage disciplineId={iconName} size={300} density={1.0} />
        </section>

        <div style={{ height: '150vh' }} />

        {/* Size: Medium */}
        <section className="h-screen flex flex-col items-center justify-center px-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            Medium Size (400px)
            <span id={`scroll-indicator-${iconName}-medium`} className="text-sm font-mono text-gray-500">0.00</span>
          </h3>
          <p className="text-gray-400 mb-12">Density: 0.9</p>
          <DotCloudImage disciplineId={iconName} size={400} density={0.9} />
        </section>

        <div style={{ height: '150vh' }} />

        {/* Size: Large */}
        <section className="h-screen flex flex-col items-center justify-center px-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            Large Size (500px)
            <span id={`scroll-indicator-${iconName}-large`} className="text-sm font-mono text-gray-500">0.00</span>
          </h3>
          <p className="text-gray-400 mb-12">Density: 0.8</p>
          <DotCloudImage disciplineId={iconName} size={500} density={0.8} />
        </section>

        <div style={{ height: '150vh' }} />

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
