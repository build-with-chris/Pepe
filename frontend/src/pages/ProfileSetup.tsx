import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase";
import { uploadProfileImage, uploadGalleryImages } from "@/lib/storage/upload";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { ProfileForm } from "../components/ProfileForm";
import { ProfileStatusBanner } from "../components/ProfileStatusBanner";
import { useTranslation } from "react-i18next";
import { fetchWithRetry, ValidationError, AuthError, ForbiddenError, ConflictError, NetworkError, NotFoundError } from "@/lib/http";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

const PROFILE_BUCKET = import.meta.env.VITE_SUPABASE_PROFILE_BUCKET || "profiles";
const baseUrl = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number>(700);
  const [priceMax, setPriceMax] = useState<number>(900);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendArtistId, setBackendArtistId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [backendDebug, setBackendDebug] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bio, setBio] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending' | 'rejected' | 'unsubmitted'>('unsubmitted');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const unlockBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !token) return;
      try {
        let me: any | null = null;
      try {
        const res = await fetchWithRetry(`${baseUrl}/api/artists/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        me = await res.json();
      } catch (err) {
        if (err instanceof ForbiddenError || err instanceof NotFoundError) {
          try {
            await fetchWithRetry(`${baseUrl}/api/artists/me/ensure`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            const res2 = await fetchWithRetry(`${baseUrl}/api/artists/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            me = await res2.json();
          } catch {
            return;
          }
        } else if (err instanceof AuthError || err instanceof NetworkError) {
          return;
        } else {
          return;
        }
      }
      if (!me) return;

        const isProbablyEmail = (s: string | null | undefined) => !!s && /.+@.+\..+/.test(s);
        const metaName = (user?.user_metadata?.full_name || user?.user_metadata?.name || "").toString().trim();
        let incomingName = (me.name || "").toString().trim();
        if (!incomingName || isProbablyEmail(incomingName)) {
          incomingName = metaName || incomingName;
        }

        setName(incomingName || "");
        setAddress(me.address || "");
        const rawAddr = (me.address || "").toString();
        if (rawAddr) {
          const parts = rawAddr.split(",").map((p: string) => p.trim()).filter(Boolean);
          let _street = ""; let _postal = ""; let _city = ""; let _country = "";
          if (parts.length >= 1) _street = parts[0];
          if (parts.length >= 2) {
            const m = parts[1].match(/^(\d{4,5})\s+(.*)$/);
            if (m) { _postal = m[1]; _city = m[2]; } else { _city = parts[1]; }
          }
          if (parts.length >= 3) _country = parts[2];
          if (_street) setStreet(_street);
          if (_postal) setPostalCode(_postal);
          if (_city) setCity(_city);
          if (_country) setCountry(_country);
        }
        setPhoneNumber(me.phone_number || "");
        setDisciplines(me.disciplines || []);
        setPriceMin(me.price_min ?? 700);
        setPriceMax(me.price_max ?? 900);
        setBio(me.bio || "");
        setProfileImageUrl(me.profile_image_url || null);
        setGalleryUrls(Array.isArray(me.gallery_urls) ? me.gallery_urls : []);
        setApprovalStatus((me.approval_status as any) ?? 'unsubmitted');
        setRejectionReason(me.rejection_reason ?? null);
        setFieldErrors({});
        if (me.id) {
        setBackendArtistId(String(me.id));
        const st = (me.approval_status as string) || 'unsubmitted';
        setLocked(st === 'pending' || st === 'approved');   
      }
      } catch (err) {
        setBackendDebug(`Load backend profile failed: ${err}`);
      }
    };
    loadProfile();
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !street || !postalCode || !city || !country || !phoneNumber || disciplines.length === 0) {
      setError(t('profileSetup.errors.fillRequired'));
      return;
    }
    if (priceMin > priceMax) {
      setError(t('profileSetup.errors.minGtMax'));
      return;
    }

    if (!backendArtistId) {
      await fetchWithRetry(`${baseUrl}/api/artists/me/ensure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      }).catch(() => null);
    }

    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      if (!user?.email) throw new Error(t('profileSetup.errors.userEmailMissing'));

      let effectiveId = backendArtistId || "new-id";
      const sb = await getSupabase();
      let imageUrl = await uploadProfileImage(
        profileImageFile,
        effectiveId,
        PROFILE_BUCKET,
        sb,
        setProfileImageUrl,
        setBackendDebug,
        profileImageUrl
      );

      let mergedGalleryUrls = await uploadGalleryImages(
        galleryFiles,
        effectiveId,
        PROFILE_BUCKET,
        sb,
        galleryUrls,
        setGalleryUrls
      );

      const nextStatus = approvalStatus === 'approved' ? 'approved' : 'pending';

      const fullAddress = `${street}, ${postalCode} ${city}, ${country}`.trim();
      setAddress(fullAddress);

      const payload: any = {
        name,
        address: fullAddress,
        phone_number: phoneNumber,
        price_min: priceMin,
        price_max: priceMax,
        disciplines,
        bio: bio.toString(),
        gallery_urls: mergedGalleryUrls,
        approval_status: nextStatus,
      };
      if (imageUrl) payload.profile_image_url = imageUrl;

      const saveRes = await fetchWithRetry(`${baseUrl}/api/artists/me/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const saved = await saveRes.json().catch(() => null);

      if (saved) {
        setName(saved.name || "");
        setAddress(saved.address || "");
        const savedAddr = (saved.address || "").toString();
        if (savedAddr) {
          const parts = savedAddr.split(",").map((p: string) => p.trim()).filter(Boolean);
          let _street = ""; let _postal = ""; let _city = ""; let _country = "";
          if (parts.length >= 1) _street = parts[0];
          if (parts.length >= 2) {
            const m = parts[1].match(/^(\d{4,5})\s+(.*)$/);
            if (m) { _postal = m[1]; _city = m[2]; } else { _city = parts[1]; }
          }
          if (parts.length >= 3) _country = parts[2];
          setStreet(_street);
          setPostalCode(_postal);
          setCity(_city);
          setCountry(_country);
        }
        setPhoneNumber(saved.phone_number || "");
        setDisciplines(Array.isArray(saved.disciplines) ? saved.disciplines : []);
        setPriceMin(saved.price_min ?? priceMin);
        setPriceMax(saved.price_max ?? priceMax);
        setBio(saved.bio || "");
        setProfileImageUrl(saved.profile_image_url || imageUrl || null);
        setGalleryUrls(Array.isArray(saved.gallery_urls) ? saved.gallery_urls : mergedGalleryUrls);
        setGalleryFiles([]);
        setApprovalStatus((saved.approval_status as any) ?? nextStatus);
        setRejectionReason(saved.rejection_reason ?? null);
      }

      setSuccess(true);
      setFieldErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (nextStatus === 'pending') setRejectionReason(null);
      setLocked(true);
    } catch (err: any) {
        if (err instanceof ValidationError) {
          const mapKey = (k: string) => ({
            name: 'name',
            street: 'street',
            postal_code: 'postalCode',
            city: 'city',
            country: 'country',
            phone_number: 'phoneNumber',
            disciplines: 'disciplines',
            price_min: 'priceMin',
            price_max: 'priceMax',
            bio: 'bio',
            address: 'address',
          } as Record<string, string>)[k] || k;

          const details = err.details || {};
          const next: Record<string, string> = {};
          Object.keys(details).forEach((k) => {
            const v = details[k];
            const key = mapKey(k);
            if (Array.isArray(v)) {
              next[key] = v.join(', ');
            } else if (typeof v === 'string') {
              next[key] = v;
            } else if (v && typeof v === 'object') {
              const first = Object.values(v).find((x) => typeof x === 'string');
              if (typeof first === 'string') next[key] = first;
            }
          });
          setFieldErrors(next);
          setError(t('profileSetup.errors.fillRequired'));
        } else if (err instanceof AuthError) {
          setError(t('profileSetup.errors.notLoggedIn'));
        } else if (err instanceof ForbiddenError) {
          setError('Du hast keine Berechtigung für diese Aktion.');
        } else if (err instanceof ConflictError) {
          setError('Konflikt – Eintrag ist verknüpft und kann nicht geändert werden.');
        } else if (err instanceof NetworkError) {
          setError(err.message);
        } else {
          setError(t('profileSetup.errors.saveFailed'));
        }
        setBackendDebug(prev => `Sync error: ${err?.message || err}${prev ? "\n" + prev : ""}`);
      } finally {
      setLoading(false);
    }
  };

  const handleDeleteArtist = async () => {
    if (!token) {
      setError(t('profileSetup.errors.notLoggedIn'));
      return;
    }
    const sure = window.confirm(t('profileSetup.delete.confirm'));
    if (!sure) return;
    setLoading(true);
    try {
      let artistId = backendArtistId;
      if (!artistId) {
        await fetchWithRetry(`${baseUrl}/api/artists/me/ensure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }).catch(() => {});
        const meRes = await fetchWithRetry(`${baseUrl}/api/artists/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null as any);
        if (meRes) {
          const me = await meRes.json().catch(() => null);
          if (me?.id) {
            artistId = String(me.id);
            setBackendArtistId(artistId);
          }
        }
      }
      if (!artistId) {
        throw new Error(t('profileSetup.errors.noArtistLinked'));
      }

      await fetchWithRetry(`${baseUrl}/api/artists/${artistId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBackendArtistId(null);
      setName("");
      setAddress("");
      setStreet("");
      setPostalCode("");
      setCity("");
      setCountry("");
      setPhoneNumber("");
      setDisciplines([]);
      setPriceMin(700);
      setPriceMax(900);
      setBio("");
      setProfileImageUrl(null);
      setProfileImageFile(null);
      setGalleryFiles([]);
      setGalleryUrls([]);
      setApprovalStatus('unsubmitted');
      setRejectionReason(null);
      setLocked(false);
      setSuccess(false);
      setError(null);
      setBackendDebug((prev) => `${t('profileSetup.delete.done')}.\n${prev || ''}`.trim());
    } catch (err: any) {
      setError(`${t('profileSetup.delete.failed')}: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const profile = {
    name,
    address,
    street,
    postalCode,
    city,
    country,
    phoneNumber,
    disciplines,
    priceMin,
    priceMax,
    bio,
    profileImageUrl,
    galleryUrls,
    galleryFiles,
  };

  const setProfileAdapter = (next: any) => {
    if (typeof next.name !== "undefined") setName(next.name);
    if (typeof next.address !== "undefined") setAddress(next.address);
    if (typeof next.street !== "undefined") setStreet(next.street);
    if (typeof next.postalCode !== "undefined") setPostalCode(next.postalCode);
    if (typeof next.city !== "undefined") setCity(next.city);
    if (typeof next.country !== "undefined") setCountry(next.country);
    if (typeof next.phoneNumber !== "undefined") setPhoneNumber(next.phoneNumber);
    if (typeof next.disciplines !== "undefined") setDisciplines(next.disciplines as string[]);
    if (typeof next.priceMin !== "undefined") setPriceMin(next.priceMin as number);
    if (typeof next.priceMax !== "undefined") setPriceMax(next.priceMax as number);
    if (typeof next.bio !== "undefined") setBio(next.bio as string);
    if (typeof next.profileImageUrl !== "undefined") setProfileImageUrl(next.profileImageUrl as string | null);
    if (typeof next.galleryUrls !== "undefined") setGalleryUrls(next.galleryUrls as string[]);

    if (typeof next.profileImageFile !== "undefined" && next.profileImageFile) {
      const file = next.profileImageFile as File;
      setProfileImageFile(file);
      try {
        const preview = URL.createObjectURL(file);
        setProfileImageUrl(preview);
      } catch {}
    }

    if (typeof next.galleryFiles !== "undefined" && next.galleryFiles) {
      const files = next.galleryFiles as File[];
      setGalleryFiles(files);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('profileSetup.title')}</h1>
            <p className="text-gray-400 mt-1">Verwalte dein Künstlerprofil und Informationen</p>
          </div>
          {locked && (
            <Button
              ref={unlockBtnRef}
              id="unlock-profile-button"
              onClick={() => {
                setLocked(false);
                setSuccess(false);
              }}
              className="bg-[#D4A574] hover:bg-[#E6B887] text-black font-medium"
              aria-label={t('profileSetup.editAria')}
            >
              <Pencil className="w-4 h-4 mr-2" />
              {t('profileSetup.edit')}
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm px-4 py-3 text-red-300" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 backdrop-blur-sm px-4 py-3 text-green-300" role="status" aria-live="polite">
            {t('profileSetup.success.saved')}
          </div>
        )}

        {/* Status Banner */}
        <ProfileStatusBanner
          status={approvalStatus}
          rejectionReason={rejectionReason}
          className="rounded-xl"
          onEdit={() => { setLocked(false); setSuccess(false); }}
          onOpenGuidelines={() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }}
          supportEmail="info@pepeshows.de"
        />

        {/* Profile Form - now uses Card components internally */}
        <div className="relative">
          <ProfileForm
            profile={profile}
            setProfile={setProfileAdapter}
            locked={locked}
            onSubmit={handleSubmit}
            fieldErrors={fieldErrors}
          />
          {locked && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
              <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 text-white max-w-md text-center shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-[#D4A574]/10 flex items-center justify-center mx-auto mb-4">
                  <Pencil className="w-6 h-6 text-[#D4A574]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Profil bearbeiten</h3>
                <p className="mb-6 text-gray-400">{t('profileSetup.lockedHint')}</p>
                <Button
                  ref={unlockBtnRef}
                  id="unlock-profile-button"
                  onClick={() => { setLocked(false); setSuccess(false); }}
                  className="bg-[#D4A574] hover:bg-[#E6B887] text-black font-medium"
                  aria-label={t('profileSetup.editAria')}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {t('profileSetup.edit')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400 mb-1">Gefahrenzone</h3>
              <p className="text-sm text-gray-400 mb-4">{t('profileSetup.delete.help')}</p>
              <Button
                variant="outline"
                onClick={handleDeleteArtist}
                disabled={loading}
                className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('profileSetup.delete.cta')}
              </Button>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {backendDebug && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-xs whitespace-pre-wrap text-gray-400">
            <strong className="text-gray-300">{t('profileSetup.debug.title')}</strong>
            <div className="mt-2">{backendDebug}</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}