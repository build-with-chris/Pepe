import React from 'react';
import PepeLogo from '../../../assets/PepeSchrift.png';
import { useTranslation } from "react-i18next";
import posthog from "@/lib/posthog";

/**
 * Landing page component for the booking wizard.
 *
 * This page introduces visitors to the service and encourages them to begin
 * the short questionnaire that collects event details and provides a first
 * price estimate. The design uses the existing Pepe colour palette of
 * black and white with a blue accent, conveying a high‑end, elegant
 * appearance.
 */
interface BookingStartPageProps {
  onStart: () => void;
}

const BookingStartPage: React.FC<BookingStartPageProps> = ({ onStart }) => {
  const { t } = useTranslation();
  const handleStart = React.useCallback(() => {
    if (typeof onStart === 'function') {
      try {
        posthog.capture("booking_assistant_started", {
          source: "web",
        });
      } catch (e) {
        console.warn("PostHog capture failed", e);
      }
      onStart();
    } else {
      // Prevent hard crash if parent forgot to pass onStart
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[BookingStartPage] onStart prop is missing or not a function');
      }
    }
  }, [onStart]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 bg-black text-white px-4">
        <img src={PepeLogo} alt={t("bookingIntro.logoAlt")} className="w-auto max-w-xs mb-2" />
        <p className="text-sm sm:text-base md:text-lg text-gray-300 mt-2 text-center">{t("bookingIntro.kicker")}</p>
      {/* Heading conveys that we match the right artists and deliver offers */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-15 mb-6 text-center leading-tight">
        {t("bookingIntro.heading")}
        </h1>
      <p className="text-base sm:text-lg md:text-xl mb-10 max-w-xl text-center text-gray-300">
        {t("bookingIntro.body")}
      </p>
      <button
        type="button"
        onClick={handleStart}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-lg"
      >
        {t("bookingIntro.start")}
      </button>
    </div>
  );
};

export default BookingStartPage;