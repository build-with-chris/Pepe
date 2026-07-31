/**
 * Zwei Vorschauen auf das eigene Profil: was der Kunde sieht und was die
 * Agentur sieht.
 *
 * Die Felder sind nicht geraten, sondern aus den Endpunkten abgelesen:
 *
 * - **Kunde**: `GET /api/artists` gibt öffentlich nur `name`, `disciplines`,
 *   `profile_image_url`, `bio`, `instagram` und `gallery_urls` heraus, und das
 *   auch erst nach der Freigabe. Adresse, Telefon und Gage sind dort *nicht*
 *   enthalten.
 * - **Agentur**: `GET /api/admin/artists` liefert zusätzlich E-Mail, Telefon,
 *   Adresse und die berechnete Gagenspanne.
 *
 * Deshalb sind es zwei Karten und nicht eine: Ohne die Trennung weiss ein
 * Künstler nicht, welche seiner Angaben öffentlich werden. Das ist bei Adresse
 * und Telefonnummer keine Kleinigkeit.
 */

import { Eye, ImageOff, Instagram, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/dates';

export interface PreviewProfile {
  name: string;
  bio: string;
  disciplines: string[];
  profileImageUrl: string | null;
  galleryUrls: string[];
  instagram?: string | null;
  // Nur für die Agentur-Sicht
  email?: string | null;
  phoneNumber?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  priceMin?: number | null;
  priceMax?: number | null;
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white/5 text-center">
      <ImageOff className="h-7 w-7 text-gray-600" aria-hidden="true" />
      <p className="px-3 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function CardShell({
  icon: Icon,
  title,
  hint,
  tone,
  children,
}: {
  icon: React.ElementType;
  title: string;
  hint: string;
  tone: 'public' | 'internal';
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        'rounded-2xl border p-4 sm:p-5',
        tone === 'public' ? 'border-pepe-gold/25 bg-pepe-gold/5' : 'border-white/10 bg-white/5'
      )}
    >
      <header className="mb-4 flex items-start gap-2.5">
        <Icon
          className={cn(
            'mt-0.5 h-5 w-5 flex-shrink-0',
            tone === 'public' ? 'text-pepe-gold' : 'text-gray-400'
          )}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-snug text-white sm:text-base">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-400">{hint}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

/**
 * Was auf der öffentlichen Künstlerseite landet.
 *
 * Nachbau von `ArtistCardFinal`: Bild, Name, die ersten zwei Disziplinen, Bio.
 */
export function CustomerPreviewCard({ profile }: { profile: PreviewProfile }) {
  const disciplines = profile.disciplines.slice(0, 2);
  const restCount = Math.max(0, profile.disciplines.length - disciplines.length);

  return (
    <CardShell
      icon={Eye}
      title="So sehen dich Kunden"
      hint="Öffentlich auf pepeshows.de, sobald du freigegeben bist."
      tone="public"
    >
      <div className="mx-auto max-w-[240px] overflow-hidden rounded-xl border border-white/10 bg-pepe-surface">
        <div className="aspect-[3/4] w-full">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt={`Profilbild von ${profile.name || 'dir'}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <Placeholder label="Ohne Profilbild bleibt hier eine graue Fläche" />
          )}
        </div>

        <div className="p-4">
          <p className="truncate font-display text-lg font-semibold text-white">
            {profile.name || 'Dein Name'}
          </p>

          {disciplines.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {disciplines.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-pepe-gold/30 px-2 py-0.5 text-xs text-pepe-gold"
                >
                  {d}
                </span>
              ))}
              {restCount > 0 && (
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-gray-400">
                  +{restCount}
                </span>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-gray-500">Noch keine Disziplin gewählt</p>
          )}

          {profile.bio?.trim() ? (
            <p className="mt-3 line-clamp-4 text-sm text-gray-300">{profile.bio}</p>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              Noch keine Vorstellung. Kunden lesen hier zuerst.
            </p>
          )}

          {profile.instagram?.trim() && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
              <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
              {profile.instagram}
            </p>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-500">
        {profile.galleryUrls.length > 0
          ? `Dazu ${profile.galleryUrls.length} ${profile.galleryUrls.length === 1 ? 'Bild' : 'Bilder'} in der Galerie`
          : 'Noch keine Galeriebilder'}
      </p>

      {/* Der Punkt, der ohne diese Karte unsichtbar bleibt. */}
      <p className="mt-3 rounded-lg bg-white/5 p-2.5 text-xs text-gray-400">
        Adresse, Telefonnummer und Gage stehen hier <strong className="text-gray-200">nicht</strong>.
        Die sieht nur die Agentur.
      </p>
    </CardShell>
  );
}

/** Was die Agentur zur Prüfung und für Buchungen sieht. */
export function AdminPreviewCard({ profile }: { profile: PreviewProfile }) {
  const address = [
    profile.street,
    [profile.postalCode, profile.city].filter(Boolean).join(' '),
    profile.country,
  ]
    .filter((part) => part && part.trim())
    .join(', ');

  const rows: { icon: React.ElementType; label: string; value: string; tight?: boolean }[] = [
    { icon: Mail, label: 'E-Mail', value: profile.email?.trim() || '—', tight: true },
    { icon: Phone, label: 'Telefon', value: profile.phoneNumber?.trim() || '—' },
    { icon: MapPin, label: 'Adresse', value: address || '—' },
  ];

  const hasRange = typeof profile.priceMin === 'number' || typeof profile.priceMax === 'number';

  return (
    <CardShell
      icon={ShieldCheck}
      title="So sieht dich die Agentur"
      hint="Nur intern, für Prüfung und Buchungsanfragen."
      tone="internal"
    >
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
          {profile.profileImageUrl ? (
            <img
              src={profile.profileImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Placeholder label="kein Bild" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{profile.name || 'Dein Name'}</p>
          <p className="mt-0.5 text-sm text-gray-400">
            {profile.disciplines.length > 0 ? profile.disciplines.join(', ') : 'keine Disziplin'}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-2.5">
        {rows.map(({ icon: Icon, label, value, tight }) => (
          <div key={label} className="flex items-start gap-2 text-sm">
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
            <dt className="sr-only">{label}</dt>
            <dd
              className={cn(
                'min-w-0',
                tight ? 'break-all' : 'break-words',
                value === '—' ? 'text-gray-500' : 'text-gray-200'
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-xs uppercase tracking-wider text-gray-500">Gagenspanne</p>
        <p className="mt-1 tabular-nums text-gray-200">
          {hasRange ? (
            `${formatMoney(profile.priceMin)} – ${formatMoney(profile.priceMax)}`
          ) : (
            <span className="text-sm text-gray-500">
              Wird aus deinen Angaben berechnet, sobald Erfahrung und Anstellung stehen.
            </span>
          )}
        </p>
      </div>
    </CardShell>
  );
}

/** Beide Karten nebeneinander, auf schmalen Schirmen untereinander. */
export function ProfilePreview({ profile }: { profile: PreviewProfile }) {
  return (
    <div className="ui-surface grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      <CustomerPreviewCard profile={profile} />
      <AdminPreviewCard profile={profile} />
    </div>
  );
}

export default ProfilePreview;
