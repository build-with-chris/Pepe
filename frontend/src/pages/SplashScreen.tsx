import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [highlightButton, setHighlightButton] = useState(true);
  const [showSoundButton, setShowSoundButton] = useState(false);
  const playerRef = useRef<any>(null);

  // Nach 4 Sekunden den Prompt zum Drücken von Enter anzeigen
  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSoundButton(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setHighlightButton(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  // Sobald der Prompt sichtbar ist, auf Enter-Taste hören und zur Startseite navigieren
  useEffect(() => {
    if (!showPrompt) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      navigate('/home');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPrompt, navigate]);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && !document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player('player', {
        videoId: 'dXHLaIkezTM',
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          loop: 1,
          playlist: 'dXHLaIkezTM',
          mute: 1,
        },
      });
    };
  }, []);

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div id="player" className="absolute inset-0 w-full h-full object-cover"></div>
      <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4">
        {showSoundButton && (
          <button
            onClick={toggleMute}
            className={`z-10 bg-black bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-2 rounded ${highlightButton ? 'animate-pulse' : ''}`}
          >
            {isMuted ? '🔇 Sound an' : '🔊 Sound aus'}
          </button>
        )}
        {showPrompt && (
          <div>
            <span className="text-white text-3xl md:text-5xl animate-pulse">
              Drücke Enter
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
