import React from 'react';
import type { BookingData } from '../types';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import NeedOption from "../parts/NeedOption";

const DURATION_OPTIONS = [
  { v: 5, label: '5 min' },
  { v: 10, label: '10 min' },
  { v: 15, label: '15 min' },
  { v: 20, label: '20 min' },
  { v: 30, label: '>20 min' }, // 30 steht hier als Marker für ">20"
];

const NEED_OPTIONS: readonly { key: 'light' | 'sound'; field: 'needs_light' | 'needs_sound' }[] = [
  { key: 'light', field: 'needs_light' },
  { key: 'sound', field: 'needs_sound' },
] as const;

export interface StepWishesProps {
  data: BookingData;
  onChange: (update: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepWishes: React.FC<StepWishesProps> = ({ data, onChange, onNext, onPrev }) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ special_requests: e.target.value });
  };

  const toggle = (field: 'needs_light' | 'needs_sound') => {
    onChange({ [field]: !(data as any)[field] } as any);
  };

  const canProceed = Boolean(data.duration_minutes && Number(data.duration_minutes) >= 1);

  return (
    <div className="w-full step flex flex-col items-center pb-28">
      <h2 className="text-3xl md:text-4xl text-center mb-3 font-extrabold mb-10">{t('booking.wishes.heading')}</h2>

      {/* Unified content wrapper for consistent left edge */}
      <div className="w-full max-w-3xl mx-auto px-4">
        {/* Duration selection (required) */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-white mb-3 text-left">
            {t('booking.length.selectLabel', { defaultValue: 'Dauer der Show' })}
          </label>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
            {DURATION_OPTIONS.map(({ v, label }) => {
              const selected = Number(data.duration_minutes) === v || (v === 30 && Number(data.duration_minutes) > 20);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ duration_minutes: v })}
                  className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium ${
                    selected
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white border-white/30 hover:border-white/60'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-white/70">{t('booking.length.requiredHint', { defaultValue: 'Bitte eine Dauer auswählen (Pflichtfeld).' })}</p>
        </div>

        {/* Wishes textarea */}
        <div className="mb-6">
          <label htmlFor="wishes" className="block text-lg font-semibold text-white mb-2 text-left">
            {t('booking.wishes.label')}
          </label>
          <textarea
            id="wishes"
            value={data.special_requests}
            onChange={handleChange}
            placeholder={t('booking.wishes.placeholder')}
            rows={8}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-white placeholder:text-white/70"
          />
        </div>

        {/* Needs: Light & Sound (side by side, aligned with textarea) */}
        <div className="flex flex-row justify-between gap-6 mb-8">
          {NEED_OPTIONS.map(opt => (
            <NeedOption
              key={opt.key}
              optionKey={opt.key}
              field={opt.field}
              data={data}
              onChange={onChange}
              toggle={toggle}
            />
          ))}
        </div>

      </div>
      
     

      {/* Fixed footer CTA */}
      <div className="fixed bottom-0 inset-x-0 px-4 py-4 bg-black/60 backdrop-blur-sm flex justify-center">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`font-semibold py-3 px-8 rounded-full shadow-lg transition-colors ${
            !canProceed
              ? 'bg-blue-600/60 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {t('booking.wishes.next')}
        </button>
      </div>
    </div>
  );
};

export default StepWishes;