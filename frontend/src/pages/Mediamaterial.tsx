import { Download, FileText, Image as ImageIcon, Video, FolderDown, Link as LinkIcon, Info } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

// Pepe Mediamaterial – Seite für Veranstalter
// Merged version: New design system + Original content from main branch

type DownloadLink = { label: string; href: string; external?: boolean };

export default function Mediamaterial() {
  const { t } = useTranslation();

  return (
    <main>
      {/* Hero Section - New Design with Original Content */}
      <section className="section-hero bg-gradient-dark">
        <div className="stage-container">
          <div className="hero-content text-center">
            <div className="inline-flex items-center gap-2 bg-pepe-ink border border-pepe-line rounded-lg px-4 py-2 mb-8">
              <ImageIcon className="h-6 w-6 text-pepe-gold" />
              <span className="text-pepe-white text-lg font-semibold">{t("mediamaterial.hero.kicker")}</span>
            </div>

            <h1 className="display-1 display-gradient mb-8">
              {t('mediamaterial.hero.title')}
            </h1>

            <p className="lead mb-12 max-w-3xl mx-auto">
              {t('mediamaterial.hero.subtitle')}
            </p>

            <div className="hero-actions">
              <Button asChild size="lg" className="btn-primary">
                <a href="/media/pepe_media_kit.zip" download>
                  <FolderDown className="mr-2 h-5 w-5" />
                  {t("mediamaterial.hero.buttons.zip")}
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="https://www.youtube.com/watch?v=dXHLaIkezTM" target="_blank" rel="noreferrer">
                  <Video className="mr-2 h-5 w-5" />
                  {t("mediamaterial.hero.buttons.trailer")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* General Media Section - New Design with Original Cards */}
      <section className="section">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('mediamaterial.general.title')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Logos */}
            <MediaCard
              title={t("mediamaterial.cards.logos.title")}
              description={t("mediamaterial.cards.logos.desc")}
              preview="/src/assets/LogoPepe.png"
              downloads={[
                { label: t("mediamaterial.cards.logos.zip"), href: "src/assets/Logos/PepeLogos.zip" },
                { label: t("mediamaterial.cards.logos.brandguide"), href: "/brandguide", external: true },
              ]}
            />

            {/* Titelbild */}
            <MediaCard
              title={t("mediamaterial.cards.header.title")}
              description={t("mediamaterial.cards.header.desc")}
              preview="/src/assets/PEPE.webp"
              downloads={[
                { label: t("mediamaterial.cards.header.h169"), href: "/images/Brandguide/Header Pepe 16:9.jpg" },
                { label: t("mediamaterial.cards.header.h54"), href: "/images/Brandguide/Header Pepe 5:4.jpg" },
              ]}
            />

            {/* Pressemappe */}
            <MediaCard
              title={t("mediamaterial.cards.press.title")}
              description={t("mediamaterial.cards.press.desc")}
              preview={<Info className="h-16 w-16 text-pepe-t48 mx-auto" />}
              downloads={[
                { label: t("mediamaterial.cards.press.page"), href: "/pressemappe", external: true },
                { label: t("mediamaterial.cards.press.rider"), href: "/technical-rider", external: true },
              ]}
            />

            {/* Trailer (Kurzclip) */}
            <MediaCard
              title={t("mediamaterial.cards.trailer.title")}
              description={t("mediamaterial.cards.trailer.desc")}
              video="/videos/Vorschauloop.webm"
              downloads={[
                { label: t("mediamaterial.cards.trailer.webm"), href: "/videos/Vorschauloop.webm" },
                { label: t("mediamaterial.cards.trailer.youtube"), href: "https://www.youtube.com/watch?v=dXHLaIkezTM", external: true },
              ]}
            />

            {/* QR-Code */}
            <MediaCard
              title={t("mediamaterial.cards.qr.title")}
              description={t("mediamaterial.cards.qr.desc")}
              preview="/media/general/qr-trailer.png"
              downloads={[
                { label: t("mediamaterial.cards.qr.png"), href: "/media/general/qr-trailer.png" },
                { label: t("mediamaterial.cards.qr.svg"), href: "/media/general/qr-trailer.svg" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Disciplines Section - New Design with Original Expandable Content */}
      <section className="section bg-pepe-ink">
        <div className="stage-container">
          <div className="section-header text-center mb-16">
            <h2 className="h1 mb-6">{t('mediamaterial.disciplines.title')}</h2>
            <p className="body-lg max-w-3xl mx-auto text-pepe-t80">
              {t('mediamaterial.disciplines.subtitle')}
            </p>
          </div>

          <div className="space-y-4 max-w-5xl mx-auto">
            <Disziplin
              name={t("mediamaterial.disciplines.items.cyr.name")}
              slug="cyr"
              teaser={t("mediamaterial.disciplines.items.cyr.teaser")}
              images={["/media/disciplines/cyr/cyr-1.jpg", "/media/disciplines/cyr/cyr-2.jpg", "/media/disciplines/cyr/cyr-3.jpg"]}
              downloads={[
                { label: t("mediamaterial.disciplines.items.cyr.zip"), href: "/media/disciplines/cyr/cyr-photos.zip" },
                { label: t("mediamaterial.disciplines.items.cyr.copy"), href: "/media/disciplines/cyr/cyr-copy.txt" },
                { label: t("mediamaterial.disciplines.items.cyr.poster"), href: "/media/disciplines/cyr/cyr-poster-a3.pdf" },
              ]}
            />

            <Disziplin
              name={t("mediamaterial.disciplines.items.jonglage.name")}
              slug="jonglage"
              teaser={t("mediamaterial.disciplines.items.jonglage.teaser")}
              images={["/media/disciplines/jonglage/j-1.jpg", "/media/disciplines/jonglage/j-2.jpg"]}
              downloads={[
                { label: t("mediamaterial.disciplines.items.jonglage.zip"), href: "/media/disciplines/jonglage/j-photos.zip" },
                { label: t("mediamaterial.disciplines.items.jonglage.copy"), href: "/media/disciplines/jonglage/j-copy.txt" },
              ]}
            />

            <Disziplin
              name={t("mediamaterial.disciplines.items.akrobatik.name")}
              slug="akrobatik"
              teaser={t("mediamaterial.disciplines.items.akrobatik.teaser")}
              images={["/media/disciplines/akrobatik/a-1.jpg", "/media/disciplines/akrobatik/a-2.jpg", "/media/disciplines/akrobatik/a-3.jpg"]}
              downloads={[
                { label: t("mediamaterial.disciplines.items.akrobatik.zip"), href: "/media/disciplines/akrobatik/a-photos.zip" },
                { label: t("mediamaterial.disciplines.items.akrobatik.copy"), href: "/media/disciplines/akrobatik/a-copy.txt" },
                { label: t("mediamaterial.disciplines.items.akrobatik.poster"), href: "/media/disciplines/akrobatik/a-poster-a3.pdf" },
              ]}
            />
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="btn-primary">
              <a href="/media/disciplines/all_disciplines.zip" download>
                <FolderDown className="mr-2 h-5 w-5" />
                {t("mediamaterial.disciplines.allZip")}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-dark">
        <div className="stage-container text-center">
          <h2 className="display-2 mb-8">Benötigst du weitere Informationen?</h2>
          <div className="hero-actions">
            <Button asChild size="xl" className="btn-primary">
              <a href="mailto:info@pepeshows.de">
                Kontakt aufnehmen
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

// ——— Helper Components with New Design Tokens ———

function MediaCard(props: {
  title: string;
  description: string;
  preview?: string | React.ReactNode;
  video?: string;
  icon?: "file";
  downloads: DownloadLink[];
}) {
  const { title, description, preview, video, icon, downloads } = props;

  return (
    <div className="card hover:border-pepe-gold/50 transition-all">
      <div className="card-body p-0 flex flex-col">
        <div className="mb-4 overflow-hidden rounded-t-xl">
          {preview ? (
            typeof preview === "string" ? (
              <AspectRatio ratio={16 / 9}>
                <img
                  src={preview}
                  alt={`${title} Vorschau`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </AspectRatio>
            ) : (
              <div className="flex h-40 items-center justify-center bg-pepe-black/50">
                {preview}
              </div>
            )
          ) : video ? (
            <AspectRatio ratio={16 / 9}>
              <video
                src={video}
                muted
                autoPlay
                loop
                playsInline
                aria-label={`${title} Vorschauvideo`}
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          ) : (
            <div className="flex h-40 items-center justify-center bg-pepe-black/50">
              {icon === "file" ? <FileText className="h-8 w-8 text-pepe-t48" /> : <ImageIcon className="h-8 w-8 text-pepe-t48" />}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <h3 className="h3 text-pepe-gold mb-2 text-center">{title}</h3>
          <p className="body-sm text-pepe-t80 mb-4 text-center">{description}</p>

          <div className="flex flex-wrap justify-center gap-2">
            {downloads.map((d, i) =>
              d.external ? (
                <Button key={i} asChild size="sm" variant="secondary">
                  <a href={d.href} target="_blank" rel="noreferrer">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    {d.label}
                  </a>
                </Button>
              ) : (
                <Button key={i} asChild size="sm">
                  <a href={d.href} download>
                    <Download className="mr-2 h-4 w-4" />
                    {d.label}
                  </a>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Disziplin(props: {
  name: string;
  slug: string;
  teaser: string;
  images: string[];
  downloads: DownloadLink[];
}) {
  const { name, teaser, images, downloads } = props;
  const { t } = useTranslation();

  return (
    <details className="group card hover:border-pepe-gold/50 transition-all">
      <summary className="cursor-pointer list-none p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="h2 text-pepe-gold">{name}</h3>
          <p className="body-md text-pepe-t80 mt-1">{teaser}</p>
          <span className="body-sm text-pepe-t60 mt-2 group-open:hidden">
            {t("mediamaterial.disciplines.expand")} ▼
          </span>
          <span className="body-sm text-pepe-t60 mt-2 hidden group-open:inline">
            {t("mediamaterial.disciplines.collapse")} ▲
          </span>
        </div>
      </summary>

      <div className="px-6 pb-6">
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {images.map((src, i) => (
            <AspectRatio key={i} ratio={4 / 5}>
              <img
                src={src}
                alt={t("mediamaterial.disciplines.imageAlt", { name, index: i + 1 })}
                className="h-full w-full rounded-lg object-cover border border-pepe-line"
                loading="lazy"
              />
            </AspectRatio>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {downloads.map((d, i) => (
            <Button key={i} asChild size="sm">
              <a href={d.href} download>
                <Download className="mr-2 h-4 w-4" />
                {d.label}
              </a>
            </Button>
          ))}
        </div>
      </div>
    </details>
  );
}
