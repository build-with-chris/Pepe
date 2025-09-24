import type { BookingData } from '../types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverTrigger, PopoverContent } from '../../ui/popover';
import { Info } from "lucide-react";


const NeedOption: React.FC<{
    optionKey: 'light' | 'sound';
    field: 'needs_light' | 'needs_sound';
    data: BookingData;
    onChange: (update: Partial<BookingData>) => void;
    toggle: (field: 'needs_light' | 'needs_sound') => void;
  }> = ({ optionKey, field, data, onChange, toggle }) => {
    const { t } = useTranslation();
    const labels = {
      light: t('booking.wishes.options.light.label'),
      sound: t('booking.wishes.options.sound.label'),
    };
    const prices = {
      light: t('booking.wishes.options.light.price'),
      sound: t('booking.wishes.options.sound.price'),
    };
    const hints = {
      light: t('booking.wishes.options.light.hint'),
      sound: t('booking.wishes.options.sound.hint'),
    };
    const popoverBodies = {
      light: t('booking.wishes.popover.light.body'),
      sound: t('booking.wishes.popover.sound.body'),
    };
    const toggleAddTexts = {
      light: t('booking.wishes.popover.light.toggleAdd'),
      sound: t('booking.wishes.popover.sound.toggleAdd'),
    };
    const toggleRemoveTexts = {
      light: t('booking.wishes.popover.light.toggleRemove'),
      sound: t('booking.wishes.popover.sound.toggleRemove'),
    };
    const checked = (data as any)[field];
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer relative">
        <input
          type="checkbox"
          className="hidden"
          checked={checked}
          onChange={() => toggle(field)}
        />
        <span
          className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
            checked
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
          }`}
        >
          {labels[optionKey]}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="ml-2 text-white/60 hover:text-white focus:outline-none"
              aria-label={hints[optionKey]}
            >
              <Info className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="bg-white p-4 rounded-md shadow-md max-w-xs text-sm">
            <p className="mb-2">{popoverBodies[optionKey]}</p>
            <button
              type="button"
              onClick={() => toggle(field)}
              className="text-blue-600 font-medium underline"
            >
              {checked ? toggleRemoveTexts[optionKey] : toggleAddTexts[optionKey]}
            </button>
          </PopoverContent>
        </Popover>
  
      </label>
    );
  };

export default NeedOption;