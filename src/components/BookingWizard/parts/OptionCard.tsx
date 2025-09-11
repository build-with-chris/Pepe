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
        `artist-card aspect-square hover-grow cursor-pointer transition-all ` +
        `${checked || flash ? 'border-gold glow' : ''}`
      }
    >
      <img
        src={imgSrc}
        alt={label}
        className="artist-card-image"
      />
      <img
        src={colorSrc}
        alt={label}
        className={`artist-card-image absolute inset-0 transition-opacity duration-300 ${checked || hovered ? 'opacity-100' : 'opacity-0'}`}
      />
      
      <div className="artist-card-overlay">
        <div className="artist-card-title text-center">{label}</div>
      </div>
      {/* Visually hidden native input for forms/accessibility if needed */}
      <input type="radio" name={name} value={value} checked={checked} onChange={() => {}} className="sr-only" />
    </label>
  );
};

export default OptionCard;