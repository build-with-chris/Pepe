import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Clock as ClockIcon, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import type { BookingData } from '../types';
import { useTranslation } from "react-i18next";

const TIME_SLOTS: string[] = Array.from({ length: 24 }, (_, i) => {
  const totalMinutes = i * 30;
  const hour = Math.floor(totalMinutes / 60) + 12;
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const GUEST_OPTIONS: { labelKey: string; value: number }[] = [
  { labelKey: 'booking.dateTime.guests.options.under200', value: 199 },
  { labelKey: 'booking.dateTime.guests.options.between200and500', value: 350 },
  { labelKey: 'booking.dateTime.guests.options.over500', value: 501 },
];

export interface StepDateAndTimeProps {
  data: BookingData;
  onChange: (update: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepDateAndTime: React.FC<StepDateAndTimeProps> = ({
  data,
  onChange,
  onNext,
  onPrev,
}) => {
  const { t, i18n } = useTranslation();

  // Helper: turn Date -> 'YYYY-MM-DD'
  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Compute defaultMonth and selected Date from stored string
  const selectedDate = React.useMemo(() => {
    if (!data.event_date) return undefined;
    const [y, m, d] = data.event_date.split('-').map((v) => parseInt(v, 10));
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  }, [data.event_date]);

  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(selectedDate);

  React.useEffect(() => {
    setSelectedDay(selectedDate);
  }, [selectedDate]);

  // Calendar selection handler
  const handleCalendarSelect = (selected?: Date) => {
    if (!selected) return;
    onChange({ event_date: toISODate(selected) });
    setSelectedDay(selected);
  };

  const canProceed = Boolean(data.event_date && data.event_time && data.number_of_guests);

  const handleTimeSelect = React.useCallback((time: string) => {
    onChange({ event_time: time });
  }, [onChange]);

  const handleGuestSelect = React.useCallback((val: number) => {
    onChange({ number_of_guests: val });
  }, [onChange]);

  // Selected time comes from data.event_time
  const selectedTime = data.event_time || null;

  // Optional: disable past days
  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  return (
    <div className="step flex flex-col items-center pb-28">
      <h2 className="text-3xl md:text-4xl text-center mb-3 font-extrabold mb-10">{t('booking.dateTime.heading')}</h2>

      {/* Calendar + Time slots */}
      <div className="relative w-full max-w-5xl grid grid-cols-1 md:[grid-template-columns:1fr_220px_220px] gap-4 md:gap-6 mb-6 items-stretch">
        <div className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 p-3 md:p-4 min-w-0">
          <div className="flex items-center gap-2 mb-3 text-white">
            <CalendarIcon className="h-5 w-5" />
            <span className="text-base md:text-lg font-semibold tracking-wide">{t('booking.dateTime.pickDate')}</span>
          </div>
          <div className="h-px bg-white/10 -mt-2 mb-3" />
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={handleCalendarSelect}
            defaultMonth={selectedDay || new Date()}
            disabled={isPast}
            showOutsideDays={false}
            classNames={{
              day: "hover:bg-blue-500 hover:text-white data-[selected]:bg-white data-[selected]:text-black data-[selected]:hover:bg-white/90 rounded-md overflow-hidden font-black"
            }}
            className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            formatters={{
              formatWeekdayName: (date) =>
                date.toLocaleString(i18n.language || 'de-DE', { weekday: 'short' }),
            }}
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-3 md:p-4 max-h-[500px] overflow-y-auto no-scrollbar min-w-0 flex flex-col">
          <div className="mb-3 text-white text-base md:text-lg font-semibold tracking-wide flex items-center justify-center gap-2">
            <ClockIcon className="h-5 w-5 text-white" />
            {t('booking.dateTime.pickTime')}
          </div>
          <div className="h-px bg-white/10 -mt-2 mb-3" />
          <div className="grid gap-2">
            {TIME_SLOTS.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? 'secondary' : 'default'}
                onClick={() => handleTimeSelect(time)}
                className="w-full shadow-none"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 md:p-4 min-w-0">
          <div className="mb-3 text-white text-base md:text-lg font-semibold tracking-wide flex items-center justify-center gap-2">
            <UsersIcon className="h-5 w-5 text-white" />
            {t('booking.dateTime.guestsLabel')}
          </div>
          <div className="h-px bg-white/10 -mt-2 mb-3" />
          <div className="grid gap-2">
            {GUEST_OPTIONS.map((option) => (
              <Button
                key={option.labelKey}
                onClick={() => handleGuestSelect(option.value)}
                variant={data.number_of_guests === option.value ? 'secondary' : 'default'}
                className="w-full"
                type="button"
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      </div>


      <div className="text-sm text-neutral-200 mb-4">
        {data.event_date && data.event_time ? (
          <>
            {t('booking.dateTime.confirmPrefix')}{' '}
            <span className="font-medium">{new Date(data.event_date).toLocaleDateString(i18n.language || 'de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>{' '}
            {t('booking.dateTime.at')}{' '}
            <span className="font-medium">{data.event_time}</span>{' '}
            {t('booking.dateTime.oclock')}
          </>
        ) : (
          <>{t('booking.dateTime.pickBoth')}</>
        )}
      </div>


      <div className="fixed bottom-0 inset-x-0 px-4 py-4 bg-black/60 backdrop-blur-sm flex justify-center gap-3">
        
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          aria-label={t('booking.dateTime.next')}
          className={`bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-opacity ${
            !canProceed
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-700'
          }`}
        >
          {t('booking.dateTime.next')}
        </button>
      </div>
    </div>
  );
};

export default StepDateAndTime;