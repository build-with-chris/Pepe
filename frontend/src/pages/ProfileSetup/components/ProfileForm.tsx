import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { disciplinesOptions } from "@/constraints/disciplines";
import GalleryUploader from "@/components/GalleryUploader";
import { downscaleImage } from "@/lib/storage/upload";

export type ProfileFormProps = {
  profile: any;
  setProfile: (profile: any) => void;
  locked: boolean;
  onSubmit: (e: React.FormEvent) => void;
  fieldErrors?: Record<string, string>;
};

export function ProfileForm({ profile, setProfile, locked, onSubmit, fieldErrors = {} }: ProfileFormProps) {
  const { t } = useTranslation();
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const isBlank = (v: any) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
  const errors = {
    name: isBlank(profile.name),
    street: isBlank(profile.street),
    postalCode: isBlank(profile.postalCode),
    city: isBlank(profile.city),
    country: isBlank(profile.country),
    phoneNumber: isBlank(profile.phoneNumber),
    disciplines: !Array.isArray(profile.disciplines) || profile.disciplines.length === 0,
  } as const;

  const toggleDiscipline = (d: string) => {
    const current = Array.isArray(profile.disciplines) ? profile.disciplines : [];
    const next = current.includes(d)
      ? current.filter((x: string) => x !== d)
      : [...current, d];
    setProfile({ disciplines: next });
  };

  return (
    <form
      onSubmit={(e) => {
        onSubmit(e);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      {/* Basisdaten */}
      <section className="md:col-span-2 rounded-lg border border-gray-800 bg-gray-900 p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-300">{t('profileForm.sections.basicData')}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Name */}
          <div>
            <label className="mb-1 block font-medium text-gray-300">{t('profileForm.labels.name')}*</label>
            <input
              type="text"
              value={profile.name ?? ""}
              onChange={(e) => setProfile({ name: e.target.value })}
              className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400"
              required
              disabled={locked}
              aria-invalid={errors.name || undefined}
            />
            {(fieldErrors.name || errors.name) && (
              <p id="name-error" className="mt-1 text-sm text-red-400">{fieldErrors.name || t('profileSetup.errors.required')}</p>
            )}
          </div>
          {/* Adresse */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="mb-1 block font-medium text-gray-300">{t('profileForm.labels.street')}*</label>
              <input
                type="text"
                value={profile.street ?? ""}
                onChange={(e) => setProfile({ street: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400"
                required
                disabled={locked}
                aria-invalid={errors.street || undefined}
              />
              {(fieldErrors.street || errors.street) && (
                <p id="street-error" className="mt-1 text-sm text-red-400">{fieldErrors.street || t('profileSetup.errors.required')}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block font-medium text-gray-300">{t('profileForm.labels.postalCode')}*</label>
              <input
                type="text"
                value={profile.postalCode ?? ""}
                onChange={(e) => setProfile({ postalCode: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400"
                required
                disabled={locked}
                aria-invalid={errors.postalCode || undefined}
              />
              {(fieldErrors.postalCode || errors.postalCode) && (
                <p id="postal-error" className="mt-1 text-sm text-red-400">{fieldErrors.postalCode || t('profileSetup.errors.required')}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block font-medium text-gray-300">{t('profileForm.labels.city')}*</label>
              <input
                type="text"
                value={profile.city ?? ""}
                onChange={(e) => setProfile({ city: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400"
                required
                disabled={locked}
                aria-invalid={errors.city || undefined}
              />
              {(fieldErrors.city || errors.city) && (
                <p id="city-error" className="mt-1 text-sm text-red-400">{fieldErrors.city || t('profileSetup.errors.required')}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block font-medium text-gray-300">{t('profileForm.labels.country')}*</label>
              <input
                type="text"
                value={profile.country ?? ""}
                onChange={(e) => setProfile({ country: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400"
                required
                disabled={locked}
                aria-invalid={errors.country || undefined}
              />
              {(fieldErrors.country || errors.country) && (
                <p id="country-error" className="mt-1 text-sm text-red-400">{fieldErrors.country || t('profileSetup.errors.required')}</p>
              )}
            </div>
          </div>
          {/* Telefonnummer */}
          <div>
            <label className="mb-1 block font-medium text-gray-300">{t('profileForm.labels.phone')}*</label>
            <input
              type="tel"
              value={profile.phoneNumber ?? ""}
              onChange={(e) => setProfile({ phoneNumber: e.target.value })}
              className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400"
              required
              disabled={locked}
              aria-invalid={errors.phoneNumber || undefined}
            />
            {(fieldErrors.phoneNumber || errors.phoneNumber) && (
              <p id="phone-error" className="mt-1 text-sm text-red-400">{fieldErrors.phoneNumber || t('profileSetup.errors.required')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Disziplinen */}
      <section className="md:col-span-2 rounded-lg border border-gray-800 bg-gray-900 p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-300">{t('profileForm.sections.disciplines')}</h2>
        <div className="flex flex-wrap gap-2">
          {disciplinesOptions.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => toggleDiscipline(d)}
              disabled={locked}
              className={`rounded border px-3 py-1 ${Array.isArray(profile.disciplines) && profile.disciplines.includes(d)
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-gray-700 bg-gray-800 text-white hover:bg-gray-700"}`}
            >
              {t(`artists.disciplines.${d}`, d)}
            </button>
          ))}
        </div>
        {(fieldErrors.disciplines || errors.disciplines) && (
          <p id="disciplines-error" className="mt-2 text-sm text-red-400">{fieldErrors.disciplines || t('profileSetup.errors.required')}</p>
        )}
      </section>

      {/* Preisrahmen */}
      <section className="md:col-span-2 rounded-lg border border-gray-800 bg-gray-900 p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-300">{t('profileForm.sections.pricing')}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium text-gray-300">{t('profileForm.labels.priceMin')}*</label>
            <input
              type="number"
              value={profile.priceMin ?? 0}
              onChange={(e) => setProfile({ priceMin: Number(e.target.value) })}
              className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400"
              min={0}
              required
              disabled={locked}
            />
            <p className="mt-1 text-sm text-gray-400">
              {t('profileForm.help.priceMin')}
            </p>
          </div>
          <div>
            <label className="mb-1 block font-medium text-gray-300">{t('profileForm.labels.priceMax')}*</label>
            <input
              type="number"
              value={profile.priceMax ?? 0}
              onChange={(e) => setProfile({ priceMax: Number(e.target.value) })}
              className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400"
              min={profile.priceMin ?? 0}
              required
              disabled={locked}
            />
            <p className="mt-1 text-sm text-gray-400">
              {t('profileForm.help.priceMax')}
            </p>
            {profile.priceMin > profile.priceMax && (
              <p className="mt-1 text-sm text-red-400">{t('profileSetup.errors.minGtMax')}</p>
            )}
            {(fieldErrors.priceMin || fieldErrors.priceMax) && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.priceMin || fieldErrors.priceMax}</p>
            )}
          </div>
        </div>
      </section>

      {/* Profilbild (Preview) */}
      <section className="rounded-lg border border-gray-800 bg-gray-900 p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-300">{t('profileForm.sections.profileImage')}</h2>
        {profile.profileImageUrl ? (
          <img src={profile.profileImageUrl} alt={t('profileForm.alt.profileImage')} className="mt-2 h-24 rounded object-cover" />
        ) : (
          <p className="text-sm text-gray-400">{t('profileForm.help.noProfileImage')}</p>
        )}
        <p className="mt-3 text-xs text-gray-500">
          {t('profileForm.help.profileImageUpload')}
        </p>
      <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const scaled = await downscaleImage(file, 1600, 0.85);
            setProfile({ profileImageFile: scaled });
          }
        }}
        disabled={locked}
        className="mt-3 block w-full text-sm text-gray-400 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white hover:file:bg-blue-500 disabled:file:opacity-50"
        />
      </section>

      {/* Galerie */}
      <section className="rounded-lg border border-gray-800 bg-gray-900 p-5 shadow-sm md:col-span-2">
        <h2 className="mb-4 text-lg font-semibold text-gray-300">{t('profileForm.sections.gallery')}</h2>
     <GalleryUploader
        galleryUrls={profile.galleryUrls || []}
        setGalleryUrls={(value) => {
          const next = typeof value === "function"
            ? (value as (prev: string[]) => string[])(profile.galleryUrls || [])
            : (value as string[]);
          setProfile({ galleryUrls: next });
        }}
        galleryFiles={profile.galleryFiles || []}
        setGalleryFiles={(files) => setProfile({ galleryFiles: files })}
        disabled={locked}
        max={9}
      />
      </section>

      {/* Über mich */}
      <section className="md:col-span-2 rounded-lg border border-gray-800 bg-gray-900 p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-300">{t('profileForm.sections.aboutMe')}</h2>
        <p className="mb-2 text-sm text-gray-400">{t('profileForm.help.aboutMe')}</p>
        <textarea
          value={profile.bio ?? ""}
          onChange={(e) => setProfile({ bio: e.target.value })}
          disabled={locked}
          className="h-28 w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400"
        />
      </section>

      {/* Submit */}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={locked}
          className="w-full rounded-lg bg-gray-800 py-3 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {t('profileForm.actions.save')}
        </button>
      </div>
    </form>
  );
}