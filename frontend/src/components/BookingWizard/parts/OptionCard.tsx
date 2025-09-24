// src/components/BookingWizard/OptionCard.tsx
import React, { useState } from 'react';

export interface OptionCardProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  imgSrc: string; // default (Schwarz-Weiß)
  imgHoverSrc?: string; // optional Farbig-Variante; wenn nicht gesetzt, wird automatisch abgeleitet
  onChange: (value: string) => void;
  onSelectNext?: () => void;
  autoAdvance?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({
  name,
  value,
  label,
  checked,
  imgSrc,
  imgHoverSrc,
  onChange,
  onSelectNext,
  autoAdvance = true,
}) => {
  const [flash, setFlash] = useState(false);
  const [hovered, setHovered] = useState(false);
  // Fallback: wenn keine Farbig-Quelle übergeben wurde, leiten wir den Pfad automatisch ab
  const derivedColorSrc = imgSrc.replace('BW', 'Farbig');
  const colorSrc = imgHoverSrc || derivedColorSrc;

  const handleSelect = () => {
    onChange(value);
    setFlash(true);
    window.setTimeout(() => {
      setFlash(false);
      if (onSelectNext && autoAdvance) onSelectNext();
    }, 180);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <label
      role="radio"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={
        `group w-full max-w-[380px] flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-150 ` +
        `${checked || flash ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-600/10' : 'border-gray-300 hover:shadow-lg'}`
      }
    >
      <div className="relative w-full mb-3">
        {/* Schwarz-Weiß (Default) */}
        <img
          src={imgSrc}
          alt={label}
          className="object-cover w-full h-44 md:h-64 lg:h-88 rounded-md"
        />
        {/* Farbig (Hover/Checked) */}
        <img
          src={colorSrc}
          alt={label}
          className={`object-cover w-full h-44 md:h-64 lg:h-88 rounded-md absolute inset-0 transition-opacity duration-300 ${checked || hovered ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <span className="text-center font-medium select-none">{label}</span>
      {/* Visually hidden native input for forms/accessibility if needed */}
      <input type="radio" name={name} value={value} checked={checked} onChange={() => {}} className="sr-only" />
    </label>
  );
};

export default OptionCard;