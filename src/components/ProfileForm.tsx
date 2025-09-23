import React from "react";
import { useTranslation } from "react-i18next";

interface ProfileFormProps {
  profile: {
    name: string;
    address: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    phoneNumber: string;
    disciplines: string[];
    priceMin: number;
    priceMax: number;
    bio: string;
    profileImageUrl: string | null;
    galleryUrls: string[];
    galleryFiles: File[];
  };
  setProfile: (updates: any) => void;
  locked: boolean;
  onSubmit: (e: React.FormEvent) => void;
  fieldErrors: Record<string, string>;
}

const availableDisciplines = [
  "Akrobatik", "Jonglage", "Zaubershow", "Tanz", "Feuershow", "Musik",
  "Comedy", "Pantomime", "Breakdance", "Cyr Wheel", "Luftakrobatik"
];

export function ProfileForm({ 
  profile, 
  setProfile, 
  locked, 
  onSubmit, 
  fieldErrors 
}: ProfileFormProps) {
  const { t } = useTranslation();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile({ profileImageFile: file });
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setProfile({ galleryFiles: [...profile.galleryFiles, ...files] });
    }
  };

  const removeGalleryFile = (index: number) => {
    const newFiles = profile.galleryFiles.filter((_, i) => i !== index);
    setProfile({ galleryFiles: newFiles });
  };

  const removeGalleryUrl = (index: number) => {
    const newUrls = profile.galleryUrls.filter((_, i) => i !== index);
    setProfile({ galleryUrls: newUrls });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            {t('profileForm.labels.name')} *
          </label>
          <input
            type="text"
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
            disabled={locked}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
            {t('profileForm.labels.phone')} *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={profile.phoneNumber}
            onChange={(e) => setProfile({ phoneNumber: e.target.value })}
            disabled={locked}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
          />
          {fieldErrors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.phoneNumber}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-medium mb-3">{t('profileForm.sections.basicData')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium mb-2">
              {t('profileForm.labels.street')} *
            </label>
            <input
              type="text"
              id="street"
              value={profile.street}
              onChange={(e) => setProfile({ street: e.target.value })}
              disabled={locked}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
            />
            {fieldErrors.street && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.street}</p>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium mb-2">
              {t('profileForm.labels.postalCode')} *
            </label>
            <input
              type="text"
              id="postalCode"
              value={profile.postalCode}
              onChange={(e) => setProfile({ postalCode: e.target.value })}
              disabled={locked}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
            />
            {fieldErrors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.postalCode}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-2">
              {t('profileForm.labels.city')} *
            </label>
            <input
              type="text"
              id="city"
              value={profile.city}
              onChange={(e) => setProfile({ city: e.target.value })}
              disabled={locked}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
            />
            {fieldErrors.city && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-2">
              {t('profileForm.labels.country')} *
            </label>
            <input
              type="text"
              id="country"
              value={profile.country}
              onChange={(e) => setProfile({ country: e.target.value })}
              disabled={locked}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
            />
            {fieldErrors.country && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.country}</p>
            )}
          </div>
        </div>
      </div>

      {/* Disciplines */}
      <div>
        <label className="block text-sm font-medium mb-3">
          {t('profileForm.sections.disciplines')} *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableDisciplines.map((discipline) => (
            <label
              key={discipline}
              className={`flex items-center p-3 border rounded cursor-pointer transition ${
                profile.disciplines.includes(discipline)
                  ? "bg-indigo-600 border-indigo-500"
                  : "bg-gray-800 border-gray-700 hover:border-gray-600"
              } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                checked={profile.disciplines.includes(discipline)}
                onChange={() => {
                  if (!locked) {
                    const newDisciplines = profile.disciplines.includes(discipline)
                      ? profile.disciplines.filter(d => d !== discipline)
                      : [...profile.disciplines, discipline];
                    setProfile({ disciplines: newDisciplines });
                  }
                }}
                disabled={locked}
                className="sr-only"
              />
              <span className="text-sm">{discipline}</span>
            </label>
          ))}
        </div>
        {fieldErrors.disciplines && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.disciplines}</p>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-medium mb-3">{t('profileForm.sections.pricing')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priceMin" className="block text-sm font-medium mb-2">
              {t('profileForm.labels.priceMin')} (€)
            </label>
            <input
              type="number"
              id="priceMin"
              value={profile.priceMin}
              onChange={(e) => setProfile({ priceMin: parseInt(e.target.value) || 0 })}
              disabled={locked}
              min="0"
              step="50"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
            />
            {fieldErrors.priceMin && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.priceMin}</p>
            )}
          </div>

          <div>
            <label htmlFor="priceMax" className="block text-sm font-medium mb-2">
              {t('profileForm.labels.priceMax')} (€)
            </label>
            <input
              type="number"
              id="priceMax"
              value={profile.priceMax}
              onChange={(e) => setProfile({ priceMax: parseInt(e.target.value) || 0 })}
              disabled={locked}
              min="0"
              step="50"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
            />
            {fieldErrors.priceMax && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.priceMax}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-2">
          {t('profileForm.sections.aboutMe')}
        </label>
        <textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => setProfile({ bio: e.target.value })}
          disabled={locked}
          rows={4}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
          placeholder={t('profileForm.sections.aboutMe')}
        />
        {fieldErrors.bio && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.bio}</p>
        )}
      </div>

      {/* Profile Image */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('profileForm.sections.profileImage')}
        </label>
        {profile.profileImageUrl && (
          <div className="mb-3">
            <img
              src={profile.profileImageUrl}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={locked}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
        />
      </div>

      {/* Gallery */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('profileForm.sections.gallery')}
        </label>
        
        {/* Existing gallery URLs */}
        {profile.galleryUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {profile.galleryUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                {!locked && (
                  <button
                    type="button"
                    onClick={() => removeGalleryUrl(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New gallery files */}
        {profile.galleryFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {profile.galleryFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                {!locked && (
                  <button
                    type="button"
                    onClick={() => removeGalleryFile(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryUpload}
          disabled={locked}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white disabled:opacity-50"
        />
      </div>

      {/* Submit Button */}
      {!locked && (
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
        >
          {t('profileSetup.success.saved')}
        </button>
      )}
    </form>
  );
}