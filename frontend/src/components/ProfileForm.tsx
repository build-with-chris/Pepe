import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User, MapPin, Music, Euro, FileText, ImageIcon, Images, Upload, X } from "lucide-react";

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
      {/* Two Column Layout for Basic Info and Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4A574]/10">
                <User className="w-5 h-5 text-[#D4A574]" />
              </div>
              <div>
                <CardTitle>{t('profileForm.sections.basicData', 'Grunddaten')}</CardTitle>
                <CardDescription>Deine persönlichen Informationen</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('profileForm.labels.name')} <span className="text-[#D4A574]">*</span>
              </Label>
              <Input
                type="text"
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ name: e.target.value })}
                disabled={locked}
                placeholder="Vollständiger Name"
              />
              {fieldErrors.name && (
                <p className="text-red-400 text-sm">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                {t('profileForm.labels.phone')} <span className="text-[#D4A574]">*</span>
              </Label>
              <Input
                type="tel"
                id="phoneNumber"
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ phoneNumber: e.target.value })}
                disabled={locked}
                placeholder="+49 123 456 789"
              />
              {fieldErrors.phoneNumber && (
                <p className="text-red-400 text-sm">{fieldErrors.phoneNumber}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4A574]/10">
                <MapPin className="w-5 h-5 text-[#D4A574]" />
              </div>
              <div>
                <CardTitle>{t('profileForm.sections.address', 'Adresse')}</CardTitle>
                <CardDescription>Dein Standort für Buchungen</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">
                {t('profileForm.labels.street')} <span className="text-[#D4A574]">*</span>
              </Label>
              <Input
                type="text"
                id="street"
                value={profile.street}
                onChange={(e) => setProfile({ street: e.target.value })}
                disabled={locked}
                placeholder="Straße und Hausnummer"
              />
              {fieldErrors.street && (
                <p className="text-red-400 text-sm">{fieldErrors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="postalCode">
                  {t('profileForm.labels.postalCode')} <span className="text-[#D4A574]">*</span>
                </Label>
                <Input
                  type="text"
                  id="postalCode"
                  value={profile.postalCode}
                  onChange={(e) => setProfile({ postalCode: e.target.value })}
                  disabled={locked}
                  placeholder="PLZ"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="city">
                  {t('profileForm.labels.city')} <span className="text-[#D4A574]">*</span>
                </Label>
                <Input
                  type="text"
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile({ city: e.target.value })}
                  disabled={locked}
                  placeholder="Stadt"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                {t('profileForm.labels.country')} <span className="text-[#D4A574]">*</span>
              </Label>
              <Input
                type="text"
                id="country"
                value={profile.country}
                onChange={(e) => setProfile({ country: e.target.value })}
                disabled={locked}
                placeholder="Deutschland"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disciplines Card - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#D4A574]/10">
              <Music className="w-5 h-5 text-[#D4A574]" />
            </div>
            <div>
              <CardTitle>
                {t('profileForm.sections.disciplines')} <span className="text-[#D4A574]">*</span>
              </CardTitle>
              <CardDescription>Wähle deine Spezialgebiete aus</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableDisciplines.map((discipline) => (
              <label
                key={discipline}
                className={cn(
                  "flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 text-center",
                  profile.disciplines.includes(discipline)
                    ? "bg-[#D4A574] text-black font-medium border-2 border-[#D4A574] shadow-lg shadow-[#D4A574]/20"
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
            <p className="text-red-400 text-sm mt-3">{fieldErrors.disciplines}</p>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout for Pricing and Bio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Range Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4A574]/10">
                <Euro className="w-5 h-5 text-[#D4A574]" />
              </div>
              <div>
                <CardTitle>{t('profileForm.sections.pricing')}</CardTitle>
                <CardDescription>Deine Preisvorstellungen</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priceMin">
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
                placeholder="500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceMax">
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
                placeholder="2000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bio Card - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4A574]/10">
                <FileText className="w-5 h-5 text-[#D4A574]" />
              </div>
              <div>
                <CardTitle>{t('profileForm.sections.aboutMe')}</CardTitle>
                <CardDescription>Erzähle den Kunden von dir</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ bio: e.target.value })}
              disabled={locked}
              rows={5}
              className="resize-none"
              placeholder="Beschreibe deine Erfahrung, Spezialitäten und was dich einzigartig macht..."
            />
            {fieldErrors.bio && (
              <p className="text-red-400 text-sm mt-2">{fieldErrors.bio}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout for Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Image Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4A574]/10">
                <ImageIcon className="w-5 h-5 text-[#D4A574]" />
              </div>
              <div>
                <CardTitle>{t('profileForm.sections.profileImage')}</CardTitle>
                <CardDescription>Dein Hauptprofilbild</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.profileImageUrl && (
              <div className="flex justify-center">
                <img
                  src={profile.profileImageUrl}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-2xl border-2 border-white/10"
                />
              </div>
            )}
            <label className={cn(
              "flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-xl cursor-pointer transition-all duration-200",
              "hover:border-[#D4A574]/50 hover:bg-white/5",
              locked && "opacity-50 cursor-not-allowed"
            )}>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Bild auswählen oder hierher ziehen</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG bis 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={locked}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>

        {/* Gallery Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#D4A574]/10">
                <Images className="w-5 h-5 text-[#D4A574]" />
              </div>
              <div>
                <CardTitle>{t('profileForm.sections.gallery')}</CardTitle>
                <CardDescription>Zeige deine besten Auftritte</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing and New Gallery Images */}
            {(profile.galleryUrls.length > 0 || profile.galleryFiles.length > 0) && (
              <div className="grid grid-cols-3 gap-3">
                {profile.galleryUrls.map((url, index) => (
                  <div key={`url-${index}`} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border border-white/10"
                    />
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => removeGalleryUrl(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {profile.galleryFiles.map((file, index) => (
                  <div key={`file-${index}`} className="relative group aspect-square">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border border-[#D4A574]/30"
                    />
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <label className={cn(
              "flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-xl cursor-pointer transition-all duration-200",
              "hover:border-[#D4A574]/50 hover:bg-white/5",
              locked && "opacity-50 cursor-not-allowed"
            )}>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Bilder hinzufügen</span>
              <span className="text-xs text-gray-500 mt-1">Mehrere Dateien möglich</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                disabled={locked}
                className="hidden"
              />
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      {!locked && (
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#D4A574] hover:bg-[#E6B887] text-black font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-[#D4A574]/20"
            size="lg"
          >
            {t('profileForm.submit', 'Profil speichern')}
          </Button>
        </div>
      )}
    </form>
  );
}
