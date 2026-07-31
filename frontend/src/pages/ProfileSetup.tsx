import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadProfileImage, uploadGalleryImages, UploadError } from "@/lib/storage/blobUpload";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { ProfileForm } from "../components/ProfileForm";
import { ProfileStatusBanner } from "../components/ProfileStatusBanner";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { FIELD_LABELS, missingRequiredFields, profileCompleteness } from "@/components/profile/options";
import { useTranslation } from "react-i18next";
import { fetchWithRetry, ValidationError, AuthError, ForbiddenError, ConflictError, NetworkError, NotFoundError } from "@/lib/http";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

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
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [calculatedGage, setCalculatedGage] = useState<number | null>(null);
  // Gage criteria
  const [stageExperience, setStageExperience] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [circusEducation, setCircusEducation] = useState(false);
  const [awardsLevel, setAwardsLevel] = useState("keine");
  const [pepeYears, setPepeYears] = useState(0);
  const [pepeExclusivity, setPepeExclusivity] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendArtistId, setBackendArtistId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [backendDebug, setBackendDebug] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bio, setBio] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending' | 'rejected' | 'unsubmitted'>('unsubmitted');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Der Assistent leitet seinen Einstiegsschritt aus den fehlenden
  // Pflichtangaben ab, und zwar einmal beim Einhängen. Rendert er, bevor
  // `/api/artists/me` geantwortet hat, sieht er ein leeres Profil und landet
  // immer in Schritt 1 — der gespeicherte Stand wäre da, aber unsichtbar.
  const [profileLoaded, setProfileLoaded] = useState(false);

  const unlockBtnRef = useRef<HTMLButtonElement | null>(null);
  const profileImageBlobUrlRef = useRef<string | null>(null);

  // Verwaltung der Blob-URL für das Profilbild
  const profileImageBlobUrl = useMemo(() => {
    // Alte Blob-URL aufräumen, wenn vorhanden
    if (profileImageBlobUrlRef.current) {
      URL.revokeObjectURL(profileImageBlobUrlRef.current);
      profileImageBlobUrlRef.current = null;
    }
    
    // Neue Blob-URL erstellen, wenn eine Datei vorhanden ist
    if (profileImageFile) {
      const url = URL.createObjectURL(profileImageFile);
      profileImageBlobUrlRef.current = url;
      return url;
    }
    return null;
  }, [profileImageFile]);

  // Aufräumen beim Unmount
  useEffect(() => {
    return () => {
      if (profileImageBlobUrlRef.current) {
        URL.revokeObjectURL(profileImageBlobUrlRef.current);
        profileImageBlobUrlRef.current = null;
      }
    };
  }, []);

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
        setPriceMin(me.price_min ?? null);
        setPriceMax(me.price_max ?? null);
        setCalculatedGage(me.calculated_gage ?? null);
        // Gage criteria
        setStageExperience(me.stage_experience || "");
        setEmploymentType(me.employment_type || "");
        setCircusEducation(!!me.circus_education);
        setAwardsLevel(me.awards_level || "keine");
        setPepeYears(me.pepe_years ?? 0);
        setPepeExclusivity(!!me.pepe_exclusivity);
        setBio(me.bio || "");
        setInstagram(me.instagram || "");
        // Prüfe, ob die URL eine Blob-URL ist - wenn ja, ignorieren wir sie, da sie ungültig ist
        const imageUrl = me.profile_image_url || null;
        if (imageUrl && imageUrl.startsWith('blob:')) {
          setProfileImageUrl(null);
        } else {
          setProfileImageUrl(imageUrl);
        }
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
      } finally {
        // Auch die Abbruchwege oben laufen hier durch. Sonst bliebe die Seite
        // bei einem fehlgeschlagenen Laden dauerhaft im Ladezustand hängen.
        setProfileLoaded(true);
      }
    };
    loadProfile();
  }, [user, token]);

  /**
   * Artist-ID beschaffen — das erste Glied der Onboarding-Kette.
   *
   * Wirft, wenn keine ID zustande kommt. Der Aufrufer darf dann nichts
   * hochladen und nichts speichern: Ohne ID gibt es keinen Datensatz, an dem
   * Bild oder Profil hängen könnten.
   */
  const ensureArtistId = async (): Promise<string> => {
    if (backendArtistId) return backendArtistId;

    setBackendDebug('Artist-Datensatz wird angelegt...');
    const res = await fetchWithRetry(`${baseUrl}/api/artists/me/ensure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const me = await res.json().catch(() => null);
    const id = me?.id;
    if (!id) {
      throw new Error(
        'Dein Künstlerprofil konnte nicht angelegt werden. Bitte melde dich neu an und versuche es erneut.'
      );
    }

    // Auch im State ablegen, damit ein zweiter Versuch nicht erneut anlegt.
    // Der Rückgabewert wird trotzdem gebraucht: setState wirkt erst im nächsten
    // Render, `backendArtistId` waere hier unten noch null.
    setBackendArtistId(String(id));
    return String(id);
  };

  /**
   * Speichern — einmal als Entwurf, einmal als Einreichung.
   *
   * Der Unterschied steckt in einem einzigen Feld: `approval_status` geht nur
   * mit, wenn `submit` gesetzt ist. Das Backend rührt den Status nur an, wenn
   * das Feld im Payload steht (`update_my_profile`), also braucht der Entwurf
   * keine eigene Route.
   *
   * Bilder wandern auch im Entwurf hoch. Sonst wäre die Vorschau nach einem
   * Neuladen leer, obwohl man gerade ein Bild gewählt hat.
   *
   * Gibt `true` zurück, wenn gespeichert wurde. Der Assistent wechselt den
   * Schritt nur dann; sonst bleibt man stehen und sieht den Grund in `error`.
   */
  const persist = async ({ submit }: { submit: boolean }): Promise<boolean> => {
    setError(null);

    // Pflichtprüfung nur beim Einreichen. Ein halb gefüllter Entwurf ist der
    // Normalfall — die Liste kommt aus `options.ts`, damit sie nicht an zwei
    // Stellen auseinanderlaufen kann.
    if (submit) {
      const missing = missingRequiredFields({ name, phoneNumber, street, postalCode, city, country, disciplines });
      if (missing.length > 0) {
        const labels = missing.map((f) => FIELD_LABELS[f] ?? f);
        setError(`${t('profileSetup.errors.fillRequired')}: ${labels.join(', ')}`);
        return false;
      }
    }

    if (!token) {
      setError(t('profileSetup.errors.notLoggedIn'));
      return false;
    }

    setLoading(true);
    try {
      if (!user?.email) throw new Error(t('profileSetup.errors.userEmailMissing'));

      // Erst die Artist-ID sichern, dann hochladen, dann speichern.
      //
      // Vorher lief `ensure` mit `.catch(() => null)` und der Ablauf ging mit
      // `effectiveId = backendArtistId || "new-id"` weiter. Scheiterte `ensure`,
      // landeten Bilder unter `artists/new-id/…` und das Profil wurde trotzdem
      // gespeichert — eine halbe Anmeldung, die niemandem auffiel
      // (SPEC-4, Befund O4). Jetzt bricht es hier ab, mit Grund.
      const effectiveId = await ensureArtistId();

      // Upload profile image via backend
      let imageUrl = await uploadProfileImage(
        profileImageFile,
        effectiveId,
        setProfileImageUrl,
        setBackendDebug,
        profileImageUrl,
        token
      );

      // Upload gallery images via backend
      let mergedGalleryUrls = await uploadGalleryImages(
        galleryFiles,
        effectiveId,
        galleryUrls,
        setGalleryUrls,
        setBackendDebug,
        token
      );

      const nextStatus = submit ? (approvalStatus === 'approved' ? 'approved' : 'pending') : undefined;

      // Positionsformat beibehalten: Beim Laden wird die Adresse an den Kommas
      // wieder auseinandergenommen. Ist noch gar nichts eingetragen, geht das
      // Feld nicht mit — sonst stünde ", ," in der Datenbank.
      const fullAddress = `${street}, ${postalCode} ${city}, ${country}`.trim();
      const hasAddress = [street, postalCode, city, country].some((part) => part.trim());
      if (hasAddress) setAddress(fullAddress);

      const payload: any = {
        name,
        phone_number: phoneNumber,
        disciplines,
        bio: bio.toString(),
        instagram: instagram.trim() || undefined,
        gallery_urls: mergedGalleryUrls,
        // Gage criteria (price_min/max are calculated server-side)
        stage_experience: stageExperience || undefined,
        employment_type: employmentType || undefined,
        circus_education: circusEducation,
        awards_level: awardsLevel,
        pepe_years: pepeYears,
        pepe_exclusivity: pepeExclusivity,
      };
      if (hasAddress) payload.address = fullAddress;
      // Der einzige Unterschied zwischen Entwurf und Einreichen.
      if (nextStatus) payload.approval_status = nextStatus;
      // Nur echte URLs speichern, keine Blob-URLs
      if (imageUrl && !imageUrl.startsWith('blob:')) {
        payload.profile_image_url = imageUrl;
      }

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
        setCalculatedGage(saved.calculated_gage ?? calculatedGage);
        // Gage criteria
        if (saved.stage_experience !== undefined) setStageExperience(saved.stage_experience || "");
        if (saved.employment_type !== undefined) setEmploymentType(saved.employment_type || "");
        if (saved.circus_education !== undefined) setCircusEducation(!!saved.circus_education);
        if (saved.awards_level !== undefined) setAwardsLevel(saved.awards_level || "keine");
        if (saved.pepe_years !== undefined) setPepeYears(saved.pepe_years ?? 0);
        if (saved.pepe_exclusivity !== undefined) setPepeExclusivity(!!saved.pepe_exclusivity);
        setBio(saved.bio || "");
        setInstagram(saved.instagram || "");
        // Prüfe, ob die URL eine Blob-URL ist - wenn ja, ignorieren wir sie
        const savedImageUrl = saved.profile_image_url || imageUrl || null;
        if (savedImageUrl && savedImageUrl.startsWith('blob:')) {
          setProfileImageUrl(null);
        } else {
          setProfileImageUrl(savedImageUrl);
        }
        setGalleryUrls(Array.isArray(saved.gallery_urls) ? saved.gallery_urls : mergedGalleryUrls);
        setGalleryFiles([]);
        setApprovalStatus((saved.approval_status as any) ?? nextStatus ?? approvalStatus);
        setRejectionReason(saved.rejection_reason ?? null);
      }

      setFieldErrors({});
      // Ein Entwurf ist kein Ereignis: keine Erfolgsmeldung, kein Sprung nach
      // oben, und das Profil bleibt offen. Der Assistent führt selbst weiter.
      if (submit) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (nextStatus === 'pending') setRejectionReason(null);
        setLocked(true);
      }
      return true;
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
        } else if (err instanceof UploadError) {
          // Die Servermeldung nennt Grösse, Inhaltstyp oder fehlende
          // Berechtigung konkret — die ist hilfreicher als ein Sammeltext.
          setError(err.message);
        } else if (err?.message) {
          // Auch der Abbruch aus `ensureArtistId` landet hier. Vorher lief der
          // Ablauf in diesem Fall stumm weiter (SPEC-4, Befund O4).
          setError(err.message);
        } else {
          setError(t('profileSetup.errors.saveFailed'));
        }
        setBackendDebug(prev => `Sync error: ${err?.message || err}${prev ? "\n" + prev : ""}`);
        return false;
      } finally {
      setLoading(false);
    }
  };

  /** Stand sichern, ohne die Prüfung anzustossen. */
  const saveDraft = () => persist({ submit: false });

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await persist({ submit: true });
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
      setPriceMin(null);
      setPriceMax(null);
      setCalculatedGage(null);
      setStageExperience("");
      setEmploymentType("");
      setCircusEducation(false);
      setAwardsLevel("keine");
      setPepeYears(0);
      setPepeExclusivity(false);
      setBio("");
      setInstagram("");
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

  // Verwende die Blob-URL für die Vorschau, wenn eine Datei vorhanden ist, sonst die gespeicherte URL
  // Prüfe auch, ob die gespeicherte URL eine ungültige Blob-URL ist
  const effectiveProfileImageUrl = profileImageBlobUrl || (profileImageUrl && !profileImageUrl.startsWith('blob:') ? profileImageUrl : null);

  const profile = {
    name,
    address,
    street,
    postalCode,
    city,
    country,
    phoneNumber,
    disciplines,
    bio,
    instagram,
    profileImageUrl: effectiveProfileImageUrl,
    galleryUrls,
    galleryFiles,
    // Gage criteria
    stageExperience,
    employmentType,
    circusEducation,
    awardsLevel,
    pepeYears,
    pepeExclusivity,
    // Calculated (read-only)
    calculatedGage,
    priceMin,
    priceMax,
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
    if (typeof next.bio !== "undefined") setBio(next.bio as string);
    if (typeof next.instagram !== "undefined") setInstagram(next.instagram as string);
    // Gage criteria
    if (typeof next.stageExperience !== "undefined") setStageExperience(next.stageExperience as string);
    if (typeof next.employmentType !== "undefined") setEmploymentType(next.employmentType as string);
    if (typeof next.circusEducation !== "undefined") setCircusEducation(next.circusEducation as boolean);
    if (typeof next.awardsLevel !== "undefined") setAwardsLevel(next.awardsLevel as string);
    if (typeof next.pepeYears !== "undefined") setPepeYears(next.pepeYears as number);
    if (typeof next.pepeExclusivity !== "undefined") setPepeExclusivity(next.pepeExclusivity as boolean);
    if (typeof next.profileImageUrl !== "undefined") setProfileImageUrl(next.profileImageUrl as string | null);
    if (typeof next.galleryUrls !== "undefined") setGalleryUrls(next.galleryUrls as string[]);

    // Auch `null` muss ankommen: Der Assistent leert damit die Auswahl wieder
    // („Entfernen"). Vorher fiel jeder falsy Wert durch, und ein entferntes
    // Bild kam beim nächsten Speichern zurück.
    if (typeof next.profileImageFile !== "undefined") {
      setProfileImageFile((next.profileImageFile as File | null) ?? null);
      // Die Blob-URL wird durch useMemo verwaltet, hier wird keine gesetzt.
    }

    if (typeof next.galleryFiles !== "undefined" && next.galleryFiles) {
      const files = next.galleryFiles as File[];
      setGalleryFiles(files);
    }
  };

  // Der Assistent ist für die erste Anmeldung da. Wer schon eingereicht hat und
  // nur eine Telefonnummer nachtragen will, soll nicht durch vier Schritte
  // laufen — für den bleibt das Formular.
  const useWizard = approvalStatus === 'unsubmitted' && !locked;

  const completeness = profileCompleteness(profile, profile);

  return (
    <DashboardLayout title={t('profileSetup.title')}>
      <div className="space-y-6">
        {/* Header with actions. Der Untertitel spricht vom Verwalten — das
            passt zum Bearbeiten, nicht zur ersten Anmeldung. Im Assistenten
            steht ohnehin in jedem Schritt, worum es geht. */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {!useWizard && (
            <p className="text-gray-400">{t('profileSetup.subtitle', { defaultValue: 'Verwalte dein Künstlerprofil und Informationen' })}</p>
          )}
          {locked && (
            <Button
              ref={unlockBtnRef}
              id="unlock-profile-button"
              onClick={() => {
                setLocked(false);
                setSuccess(false);
              }}
              className="bg-pepe-gold hover:bg-pepe-gold-hover text-black font-medium"
              aria-label={t('profileSetup.editAria')}
            >
              <Pencil className="w-4 h-4 mr-2" />
              {t('profileSetup.edit')}
            </Button>
          )}
        </div>

        {/* Error Message — der Assistent zeigt den Fehler selbst, direkt über
            seiner Steuerung. Zweimal derselbe Kasten hilft niemandem. */}
        {error && !useWizard && (
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

        {/* Status Banner. Im Assistenten sagt er dasselbe wie der Schritt
            darunter — „noch nicht eingereicht" steht dort schon im Fortschritt.
            Drei Überschriften vor der ersten Frage sind zwei zu viel. */}
        {!useWizard && (
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
        )}

        {!profileLoaded ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-gray-400" role="status">
            Dein Profil wird geladen…
          </p>
        ) : useWizard ? (
          <ProfileWizard
            profile={profile}
            setProfile={setProfileAdapter}
            email={user?.email}
            saving={loading}
            error={error}
            onSaveDraft={saveDraft}
            onSubmit={handleSubmit}
          />
        ) : (
        <>
        {/* Fortschritt. Steht nur beim Formular, denn der Assistent hat einen
            eigenen Balken. Hier ist der Ort, an dem ein nachgereichtes Foto
            angestossen wird — nach dem Einreichen ist die Pflicht erfüllt, das
            Profil aber selten fertig. */}
        <section
          aria-label="Vollständigkeit deines Profils"
          className="ui-surface rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-medium leading-snug text-white">Dein Profil</h2>
            <p className="tabular-nums text-sm text-gray-400">{completeness.percent} % ausgefüllt</p>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={completeness.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Vollständigkeit deines Profils"
          >
            <div
              className="h-full rounded-full bg-pepe-gold transition-[width] duration-300"
              style={{ width: `${completeness.percent}%` }}
            />
          </div>
          {completeness.todo.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-400">
              {completeness.todo.map((item) => (
                <li key={item.key}>{item.label}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-400">Alles ausgefüllt. Mehr braucht es nicht.</p>
          )}
        </section>

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
              <div className="bg-pepe-surface border border-white/10 rounded-2xl p-8 text-white max-w-md text-center shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-pepe-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Pencil className="w-6 h-6 text-pepe-gold" />
                </div>
                <h3 className="mb-2 text-lg font-semibold leading-snug">Profil bearbeiten</h3>
                <p className="mb-6 text-gray-400">{t('profileSetup.lockedHint')}</p>
                <Button
                  ref={unlockBtnRef}
                  id="unlock-profile-button"
                  onClick={() => { setLocked(false); setSuccess(false); }}
                  className="bg-pepe-gold hover:bg-pepe-gold-hover text-black font-medium"
                  aria-label={t('profileSetup.editAria')}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {t('profileSetup.edit')}
                </Button>
              </div>
            </div>
          )}
        </div>
        </>
        )}

        {/* Danger Zone. Nicht während der Anmeldung: Wer sich gerade einträgt,
            braucht keinen Knopf zum Löschen direkt unter „Weiter". */}
        {!useWizard && (
        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold leading-snug text-red-400">Gefahrenzone</h3>
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
        )}

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