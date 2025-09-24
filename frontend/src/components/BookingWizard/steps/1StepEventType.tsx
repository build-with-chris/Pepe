import React from 'react';
import type { BookingData } from '../types';
import OptionCard from '../parts/OptionCard';
import { useTranslation } from "react-i18next";

export interface StepEventTypeProps {
  data: BookingData;
  onChange: (update: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepEventType: React.FC<StepEventTypeProps> = ({ data, onChange, onNext }) => {
  const { t } = useTranslation();

  const options = [
    { value: 'Private Feier', label: t('booking.eventType.options.private'), img: 'Private_Feier' },
    { value: 'Firmenfeier', label: t('booking.eventType.options.corporate'), img: 'Firmenfeier' },
    { value: 'Incentive', label: t('booking.eventType.options.incentive'), img: 'Incentive' },
    { value: 'Streetshow', label: t('booking.eventType.options.streetshow'), img: 'Streetshow' },
  ];

  return (
    <div className="p-0 w-full mx-auto md:max-w-4/5">
      <h2 className="text-3xl md:text-4xl text-center mb-7 font-extrabold">
        {t('booking.eventType.heading')}
      </h2>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 w-full">
        {options.map(option => (
          <OptionCard
            key={option.value}
            name="event_type"
            value={option.value}
            label={option.label}
            imgSrc={`/images/bookingagent/BW/${option.img}.webp`}
            checked={data.event_type === option.value}
            onChange={val => onChange({ event_type: val })}
            onSelectNext={onNext}
          />
        ))}
      </div>

    </div>
  );
};

export default StepEventType;