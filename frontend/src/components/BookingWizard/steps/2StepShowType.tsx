import React from 'react';
import type { BookingData } from '../types';
import OptionCard from '../parts/OptionCard';
import { useTranslation } from "react-i18next";

export interface StepShowTypeProps {
  data: BookingData;
  onChange: (update: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepShowType: React.FC<StepShowTypeProps> = ({ data, onChange, onNext, onPrev }) => {
  const { t } = useTranslation();
  const options = [
    { value: 'Live-Interaktion', labelKey: 'booking.showType.options.liveInteraction', img: 'Live_Interaktion' },
    { value: 'Bühnen Show', labelKey: 'booking.showType.options.stageShow', img: 'Buehnen_Show' },
  ] as const;

  return (
    <div className="step flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl text-center mb-3 font-extrabold">{t('booking.showType.heading')}</h2>
      
      <div className="flex flex-wrap justify-center gap-4 w-full">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            name="show_type"
            value={option.value}
            label={t(option.labelKey)}
            imgSrc={`/images/bookingagent/BW/${option.img}.webp`}
            imgHoverSrc={`/images/bookingagent/Farbig/${option.img}.webp`}
            checked={data.show_type === option.value}
            onChange={(val) => onChange({ show_type: val })}
            onSelectNext={onNext}
            autoAdvance={true}
          />
        ))}
      </div>
   
    </div>
  );
};

export default StepShowType;
