import React, { useEffect, useRef } from 'react';
import type { BookingData } from '../types';
import OptionCard from '../parts/OptionCard';
import { useTranslation } from "react-i18next";

export interface StepArtistCountProps {
  data: BookingData;
  onChange: (update: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepArtistCount: React.FC<StepArtistCountProps> = ({
  data,
  onChange,
  onNext,
  onPrev
}) => {
  const { t } = useTranslation();

  const didAutoSkip = useRef(false);
  useEffect(() => {
    if (didAutoSkip.current) return;
    didAutoSkip.current = true;
    try {
      const stored = localStorage.getItem('bookingTargetArtistId');
      const artistId = stored ? Number(stored) : 0;
      if (artistId) {
        // default to solo and skip this step
        if (Number(data.team_size || 0) !== 1) {
          onChange({ team_size: 1 });
        }
        onNext();
      }
    } catch {}
  }, []);

  const options: { labelKey: string; value: number; img: string }[] = [
    { labelKey: 'booking.artistCount.options.solo', value: 1, img: 'Solo' },
    { labelKey: 'booking.artistCount.options.duo', value: 2, img: 'Duo' },
    { labelKey: 'booking.artistCount.options.group', value: 3, img: 'Gruppe' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ team_size: Number(e.target.value) });
  };

   return (
    <div className="step">
      <h2 className="text-3xl md:text-4xl text-center mb-3 font-extrabold">
        {t('booking.artistCount.heading')}
      </h2>

      {/* Auswahlkarten */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full lg:w-2/3 mx-auto">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            name="team_size"
            value={option.value.toString()}
            label={t(option.labelKey)}
            imgSrc={`/images/bookingagent/BW/${option.img}.webp`}
            imgHoverSrc={`/images/bookingagent/Farbig/${option.img}.webp`}
            checked={data.team_size === option.value}
            onChange={(val) => { onChange({ team_size: Number(val) }); onNext(); }}
          />
        ))}
      </div>
    </div>
  );
};

export default StepArtistCount;