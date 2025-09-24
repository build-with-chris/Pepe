import React, { useState, useEffect, useCallback } from 'react';
import type { BookingData } from '../types';
import OptionCard from '../parts/OptionCard';
import { useTranslation } from "react-i18next";
export interface StepLocationProps {
  data: BookingData;
  onChange: (update: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepLocation: React.FC<StepLocationProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const { t } = useTranslation();
  // Separate address fields: Straße, PLZ, Stadt
  const [street, setStreet] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [hasSelection, setHasSelection] = useState(false);

  // Coordinates for artist home and event city
  const [artistCoord, setArtistCoord] = useState<{ lat: number; lon: number } | null>(null);
  const [eventCoord, setEventCoord] = useState<{ lat: number; lon: number } | null>(null);

  const haversineDistance = useCallback((c1: { lat: number; lon: number }, c2: { lat: number; lon: number }) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(c2.lat - c1.lat);
    const dLon = toRad(c2.lon - c1.lon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  useEffect(() => {
    fetch('/api/artists/me')
      .then(res => res.json())
      .then(data => {
        if (data.home_address) {
          // Geocode the artist's home using Nominatim
          fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.home_address)}&format=json&limit=1`)
            .then(res => res.json())
            .then(results => {
              if (results[0]) {
                setArtistCoord({
                  lat: parseFloat(results[0].lat),
                  lon: parseFloat(results[0].lon),
                });
              }
            });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (city && artistCoord) {
      const handler = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`)
          .then(res => res.json())
          .then(results => {
            if (results[0]) {
              const ev = { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
              setEventCoord(ev);
              const dist = haversineDistance(artistCoord, ev);
              onChange({ distance_km: Math.round(dist) });
            }
          })
          .catch(() => {});
      }, 500); // debounce 500ms
      return () => clearTimeout(handler);
    }
  }, [city, artistCoord, haversineDistance, onChange]);

  const updateAddress = (newStreet: string, newPostalCode: string, newCity: string) => {
    const addr = [newStreet, newPostalCode, newCity].filter(Boolean).join(', ');
    onChange({ event_address: addr });
  };

  const locationOptions = [
    {
      value: 'true',
      label: t('booking.location.indoor'),
      imgSrc: '/images/bookingagent/BW/Indoor.webp',
      imgHoverSrc: '/images/bookingagent/Farbig/Indoor.webp'
    },
    {
      value: 'false',
      label: t('booking.location.outdoor'),
      imgSrc: '/images/bookingagent/BW/Outdoor.webp',
      imgHoverSrc: '/images/bookingagent/Farbig/Outdoor.webp'
    }
  ];

  const handleIndoorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ is_indoor: e.target.value === 'true' });
  };

  return (
    <div className="step pb-28">
      <h2 className="text-3xl mb-10 md:text-4xl text-center mb-3 font-extrabold">{t('booking.location.heading')}</h2>
      <div className="flex flex-col lg:flex-row lg:space-x-4 w-full max-w-[800px] mx-auto px-4 mb-6">
      <div className="w-full lg:w-1/2 mb-4">
        <label htmlFor="street" className="block text-sm font-medium text-neutral-200">
          {t('booking.location.streetLabel')}
        </label>
        <input
          id="street"
          type="text"
          value={street}
          onChange={e => { const v = e.target.value; setStreet(v); updateAddress(v, postalCode, city); }}
          placeholder={t('booking.location.streetPlaceholder')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="w-full lg:w-1/4 mb-4">
        <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-200">
          {t('booking.location.postalLabel')}
        </label>
        <input
          id="postalCode"
          type="text"
          value={postalCode}
          onChange={e => { const v = e.target.value; setPostalCode(v); updateAddress(street, v, city); }}
          placeholder={t('booking.location.postalPlaceholder')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="w-full lg:w-1/4 mb-4">
        <label htmlFor="city" className="block text-sm font-medium text-neutral-200">
          {t('booking.location.cityLabel')} <span className="text-red-500">*</span>
        </label>
        <input
          id="city"
          type="text"
          required
          value={city}
          onChange={e => { const v = e.target.value; setCity(v); updateAddress(street, postalCode, v); }}
          placeholder={t('booking.location.cityPlaceholder')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      </div>
      <div className="w-full max-w-[800px] mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locationOptions.map(opt => (
            <div className="w-full" key={opt.value}>
              <OptionCard
                name="is_indoor"
                value={opt.value}
                label={opt.label}
                imgSrc={opt.imgSrc}
                imgHoverSrc={opt.imgHoverSrc}
                checked={hasSelection && data.is_indoor === (opt.value === 'true')}
                onChange={val => {
                  setHasSelection(true);
                  onChange({ is_indoor: val === 'true' });
                  if (street && postalCode && city) {
                    onNext();
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>


      {/* Fixed footer CTA */}
      <div className="fixed bottom-0 inset-x-0 px-4 py-4 bg-black/60 backdrop-blur-sm flex justify-center">
        <button
          type="button"
          onClick={onNext}
          disabled={!street || !postalCode || !city || !hasSelection}
          className={`bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-opacity ${(!street || !postalCode || !city || !hasSelection) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          aria-label={t('booking.location.next')}
        >
          {t('booking.location.next')}
        </button>
      </div>
    </div>
  );
};

export default StepLocation;
