import { useState } from 'react';
import { generateAllDisciplinePNGs, downloadPNG } from '@/lib/generateDotCloudPNG';

/**
 * Utility page to generate PNG exports for all discipline icons
 * Visit /generate-pngs to use this tool
 */
export default function GeneratePNGs() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [generatedPNGs, setGeneratedPNGs] = useState<Array<{filename: string, dataUrl: string}>>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress('Generating PNGs...');
    setGeneratedPNGs([]);

    try {
      const results = await generateAllDisciplinePNGs();
      setGeneratedPNGs(results);
      setProgress(`✅ Generated ${results.length} PNGs! Click "Download All" or individual links below.`);
    } catch (error) {
      setProgress(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAll = () => {
    // Alert user about multiple downloads
    alert(`This will download ${generatedPNGs.length} files. Please allow multiple downloads when prompted by your browser.`);

    // Stagger downloads with longer delay to avoid browser blocking
    generatedPNGs.forEach((png, index) => {
      setTimeout(() => {
        downloadPNG(png.dataUrl, png.filename);
      }, index * 500); // Stagger downloads by 500ms
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--pepe-bg)',
      color: 'var(--pepe-text)',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        PNG Generator
      </h1>
      <p style={{ marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
        Generate transparent PNG files for all discipline icons (active and inactive versions)
        <br />
        <small style={{ color: 'var(--pepe-t64)' }}>
          13 disciplines × 2 versions = 26 PNG files
        </small>
      </p>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          background: isGenerating ? '#666' : 'var(--pepe-gold)',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {isGenerating ? 'Generating...' : 'Generate All PNGs'}
      </button>

      {progress && (
        <p style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          minWidth: '300px',
          textAlign: 'center',
        }}>
          {progress}
        </p>
      )}

      {generatedPNGs.length > 0 && (
        <>
          <button
            onClick={handleDownloadAll}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              background: '#CD7F32',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Download All ({generatedPNGs.length} files)
          </button>

          <p style={{
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--pepe-t64)',
            textAlign: 'center',
          }}>
            Note: Browser may block multiple downloads. Click individual links below if needed.
          </p>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            maxWidth: '800px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Generated Files:</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              {generatedPNGs.map((png) => (
                <div
                  key={png.filename}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                  }}
                >
                  <img
                    src={png.dataUrl}
                    alt={png.filename}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'contain',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <a
                    href={png.dataUrl}
                    download={png.filename}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--pepe-gold)',
                      textDecoration: 'none',
                      textAlign: 'center',
                      wordBreak: 'break-all',
                    }}
                  >
                    {png.filename}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{
        marginTop: '3rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        maxWidth: '600px',
      }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Config:</h3>
        <ul style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          <li>Size: 150px × 150px</li>
          <li>Density: 0.35</li>
          <li>Sample Gap: 1 (max detail)</li>
          <li>Dot Size Range: 0.8px - 3.0px</li>
          <li>Active: Pepe Gold (#D4A574) with per-dot glow</li>
          <li>Inactive: Pepe Line (#333333) no glow</li>
        </ul>
      </div>
    </div>
  );
}
