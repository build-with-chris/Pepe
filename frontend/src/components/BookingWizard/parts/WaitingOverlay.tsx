import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface WaitingOverlayProps {
  /** Optional single message (line1) */
  message?: string;
}

const WaitingOverlay: React.FC<WaitingOverlayProps> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[1000] bg-black/60 backdrop-blur-sm text-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <DotLottieReact
        src="https://lottie.host/f1618824-5547-4c31-80af-8c201d095f8c/klnukhE8Er.lottie"
        loop
        autoplay
        style={{ width: 120, height: 120 }}
      />
      <div className="mt-6 text-white font-medium text-lg max-w-md">
        <p>{message || t('booking.showtime.waiting.line1')}</p>
      </div>
    </div>
  );
};

export default WaitingOverlay;