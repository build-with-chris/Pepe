import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

// Shared input styling for glass-morphism effect
const inputClassName = "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#D4A574]/50 focus:ring-[#D4A574]/20 disabled:opacity-50 disabled:cursor-not-allowed";

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
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#D4A574]">{t('profileForm.sections.basicData', 'Grunddaten')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              {t('profileForm.labels.name')} <span className="text-[#D4A574]">*</span>
            </Label>
            <Input
              type="text"
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ name: e.target.value })}
              disabled={locked}
              className={inputClassName}
            />
            {fieldErrors.name && (
              <p className="text-red-400 text-sm">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-gray-300">
              {t('profileForm.labels.phone')} <span className="text-[#D4A574]">*</span>
            </Label>
            <Input
              type="tel"
              id="phoneNumber"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ phoneNumber: e.target.value })}
              disabled={locked}
              className={inputClassName}
            />
            {fieldErrors.phoneNumber && (
              <p className="text-red-400 text-sm">{fieldErrors.phoneNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#D4A574]">{t('profileForm.sections.address', 'Adresse')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="street" className="text-gray-300">
              {t('profileForm.labels.street')} <span className="text-[#D4A574]">*</span>
            </Label>
            <Input
              type="text"
              id="street"
              value={profile.street}
              onChange={(e) => setProfile({ street: e.target.value })}
              disabled={locked}
              className={inputClassName}
            />
            {fieldErrors.street && (
              <p className="text-red-400 text-sm">{fieldErrors.street}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-gray-300">
              {t('profileForm.labels.postalCode')} <span className="text-[#D4A574]">*</span>
            </Label>
            <Input
              type="text"
              id="postalCode"
              value={profile.postalCode}
              onChange={(e) => setProfile({ postalCode: e.target.value })}
              disabled={locked}
              className={inputClassName}
            />
            {fieldErrors.postalCode && (
              <p className="text-red-400 text-sm">{fieldErrors.postalCode}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-300">
              {t('profileForm.labels.city')} <span className="text-[#D4A574]">*</span>
            </Label>
            <Input
              type="text"
              id="city"
              value={profile.city}
              onChange={(e) => setProfile({ city: e.target.value })}
              disabled={locked}
              className={inputClassName}
            />
            {fieldErrors.city && (
              <p className="text-red-400 text-sm">{fieldErrors.city}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-gray-300">
              {t('profileForm.labels.country')} <span className="text-[#D4A574]">*</span>
            </Label>
            <Input
              type="text"
              id="country"
              value={profile.country}
              onChange={(e) => setProfile({ country: e.target.value })}
              disabled={locked}
              className={inputClassName}
            />
            {fieldErrors.country && (
              <p className="text-red-400 text-sm">{fieldErrors.country}</p>
            )}
          </div>
        </div>
      </div>

      {/* Disciplines */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#D4A574]">
          {t('profileForm.sections.disciplines')} <span className="text-[#D4A574]">*</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableDisciplines.map((discipline) => (
            <label
              key={discipline}
              className={cn(
                "flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 text-center",
                profile.disciplines.includes(discipline)
                  ? "bg-[#D4A574] text-black font-medium border-2 border-[#D4A574]"
                  : "bg-white/5 border border-white/10 text-gray-300 hover:border-[#D4A574]/50 hover:bg-white/10",
                locked && "opacity-50 cursor-not-allowed"
              )}
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
          <p className="text-red-400 text-sm">{fieldErrors.disciplines}</p>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#D4A574]">{t('profileForm.sections.pricing')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceMin" className="text-gray-300">
              {t('profileForm.labels.priceMin')} (€)
            </Label>
            <Input
              type="number"
              id="priceMin"
              value={profile.priceMin}
              onChange={(e) => setProfile({ priceMin: parseInt(e.target.value) || 0 })}
              disabled={locked}
              min="0"
              step="50"
              className={inputClassName}
            />
            {fieldErrors.priceMin && (
              <p className="text-red-400 text-sm">{fieldErrors.priceMin}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priceMax" className="text-gray-300">
              {t('profileForm.labels.priceMax')} (€)
            </Label>
            <Input
              type="number"
              id="priceMax"
              value={profile.priceMax}
              onChange={(e) => setProfile({ priceMax: parseInt(e.target.value) || 0 })}
              disabled={locked}
              min="0"
              step="50"
              className={inputClassName}
            />
            {fieldErrors.priceMax && (
              <p className="text-red-400 text-sm">{fieldErrors.priceMax}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-gray-300 text-lg font-semibold">
          {t('profileForm.sections.aboutMe')}
        </Label>
        <Textarea
          id="bio"
          value={profile.bio}
          onChange={(e) => setProfile({ bio: e.target.value })}
          disabled={locked}
          rows={4}
          className={cn(inputClassName, "resize-none")}
          placeholder={t('profileForm.sections.aboutMe')}
        />
        {fieldErrors.bio && (
          <p className="text-red-400 text-sm">{fieldErrors.bio}</p>
        )}
      </div>

      {/* Profile Image */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#D4A574]">
          {t('profileForm.sections.profileImage')}
        </h3>
        {profile.profileImageUrl && (
          <div className="mb-4">
            <img
              src={profile.profileImageUrl}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-xl border-2 border-white/10"
            />
          </div>
        )}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={locked}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#D4A574] file:text-black file:font-medium hover:file:bg-[#E6B887] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Gallery */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#D4A574]">
          {t('profileForm.sections.gallery')}
        </h3>

        {/* Existing gallery URLs */}
        {profile.galleryUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.galleryUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-24 object-cover rounded-xl border border-white/10"
                />
                {!locked && (
                  <button
                    type="button"
                    onClick={() => removeGalleryUrl(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.galleryFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New ${index + 1}`}
                  className="w-full h-24 object-cover rounded-xl border border-[#D4A574]/30"
                />
                {!locked && (
                  <button
                    type="button"
                    onClick={() => removeGalleryFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#D4A574] file:text-black file:font-medium hover:file:bg-[#E6B887] disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Submit Button */}
      {!locked && (
        <Button
          type="submit"
          className="w-full bg-[#D4A574] hover:bg-[#E6B887] text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          size="lg"
        >
          {t('profileForm.submit', 'Profil speichern')}
        </Button>
      )}
    </form>
  );
}