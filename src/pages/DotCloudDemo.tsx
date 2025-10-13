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
          <h3 className="text-2xl font-bold text-white mb-2">Small Size (300px)</h3>
          <p className="text-gray-400 mb-8 flex items-center gap-3">
            Density: 1.0
            <span className="text-gray-600 px-1">•</span>
            <span id={`scroll-indicator-${iconName}-small`} className="text-xs font-mono text-gray-500">0.00</span>
          </p>
          <DotCloudImage disciplineId={`${iconName}-small`} size={300} density={1.0} />
        </section>

        <div style={{ height: '150vh' }} />

        {/* Size: Medium */}
        <section className="h-screen flex flex-col items-center justify-center px-6">
          <h3 className="text-2xl font-bold text-white mb-2">Medium Size (400px)</h3>
          <p className="text-gray-400 mb-8 flex items-center gap-3">
            Density: 0.9
            <span className="text-gray-600 px-1">•</span>
            <span id={`scroll-indicator-${iconName}-medium`} className="text-xs font-mono text-gray-500">0.00</span>
          </p>
          <DotCloudImage disciplineId={`${iconName}-medium`} size={400} density={0.9} />
        </section>

        <div style={{ height: '150vh' }} />

        {/* Size: Large */}
        <section className="h-screen flex flex-col items-center justify-center px-6">
          <h3 className="text-2xl font-bold text-white mb-2">Large Size (500px)</h3>
          <p className="text-gray-400 mb-8 flex items-center gap-3">
            Density: 0.8
            <span className="text-gray-600 px-1">•</span>
            <span id={`scroll-indicator-${iconName}-large`} className="text-xs font-mono text-gray-500">0.00</span>
          </p>
          <DotCloudImage disciplineId={`${iconName}-large`} size={500} density={0.8} />
        </section>

        <div style={{ height: '150vh' }} />

      {/* Density: Sparse */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h3 className="text-2xl font-bold text-white mb-2">Sparse Density</h3>
        <p className="text-gray-400 mb-8 flex items-center gap-3">
          Density: 0.5
          <span className="text-gray-600 px-1">•</span>
          <span id={`scroll-indicator-${iconName}-sparse`} className="text-xs font-mono text-gray-500">0.00</span>
        </p>
        <DotCloudImage
          disciplineId={`${iconName}-sparse`}
          size={450}
          density={0.5}
        />
      </section>

      <div style={{ height: '150vh' }} />

      {/* Density: Normal */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h3 className="text-2xl font-bold text-white mb-2">Normal Density</h3>
        <p className="text-gray-400 mb-8 flex items-center gap-3">
          Density: 1.0
          <span className="text-gray-600 px-1">•</span>
          <span id={`scroll-indicator-${iconName}-normal`} className="text-xs font-mono text-gray-500">0.00</span>
        </p>
        <DotCloudImage
          disciplineId={`${iconName}-normal`}
          size={450}
          density={1.0}
        />
      </section>

      <div style={{ height: '150vh' }} />

      {/* Density: Dense */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h3 className="text-2xl font-bold text-white mb-2">Dense</h3>
        <p className="text-gray-400 mb-8 flex items-center gap-3">
          Density: 1.5
          <span className="text-gray-600 px-1">•</span>
          <span id={`scroll-indicator-${iconName}-dense`} className="text-xs font-mono text-gray-500">0.00</span>
        </p>
        <DotCloudImage
          disciplineId={`${iconName}-dense`}
          size={450}
          density={1.5}
        />
      </section>

      <div style={{ height: '150vh' }} />

      {/* Color: Gold */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h3 className="text-2xl font-bold text-white mb-2">Gold Color</h3>
        <p className="text-gray-400 mb-8 flex items-center gap-3">
          Color: Gold
          <span className="text-gray-600 px-1">•</span>
          <span id={`scroll-indicator-${iconName}-gold`} className="text-xs font-mono text-gray-500">0.00</span>
        </p>
        <DotCloudImage
          disciplineId={`${iconName}-gold`}
          size={450}
          density={1.0}
          color="var(--pepe-gold)"
        />
      </section>

      <div style={{ height: '150vh' }} />

      {/* Color: Bronze */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h3 className="text-2xl font-bold text-white mb-2">Bronze Color</h3>
        <p className="text-gray-400 mb-8 flex items-center gap-3">
          Color: Bronze
          <span className="text-gray-600 px-1">•</span>
          <span id={`scroll-indicator-${iconName}-bronze`} className="text-xs font-mono text-gray-500">0.00</span>
        </p>
        <DotCloudImage
          disciplineId={`${iconName}-bronze`}
          size={450}
          density={1.0}
          color="var(--pepe-bronze)"
        />
      </section>

      <div style={{ height: '150vh' }} />

      {/* Color: Amber */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h3 className="text-2xl font-bold text-white mb-2">Amber Color</h3>
        <p className="text-gray-400 mb-8 flex items-center gap-3">
          Color: Amber
          <span className="text-gray-600 px-1">•</span>
          <span id={`scroll-indicator-${iconName}-amber`} className="text-xs font-mono text-gray-500">0.00</span>
        </p>
        <DotCloudImage
          disciplineId={`${iconName}-amber`}
          size={450}
          density={1.0}
          color="var(--pepe-amber)"
        />
      </section>

      <div style={{ height: '150vh' }} />

      {/* Color: White */}
      <section className="h-screen flex flex-col items-center justify-center px-6">
        <h3 className="text-2xl font-bold text-white mb-2">White Color</h3>
        <p className="text-gray-400 mb-8 flex items-center gap-3">
          Color: White
          <span className="text-gray-600 px-1">•</span>
          <span id={`scroll-indicator-${iconName}-white`} className="text-xs font-mono text-gray-500">0.00</span>
        </p>
        <DotCloudImage
          disciplineId={`${iconName}-white`}
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
        <div style={{ height: '150vh' }} />
      </div>
    </div>
  );
}
