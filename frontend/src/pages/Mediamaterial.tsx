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

          {/* Featured Cards - Pressemappe & Technical Rider */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Pressemappe - Featured */}
            <div className="card hover:border-pepe-gold transition-all bg-gradient-to-br from-pepe-ink to-pepe-black">
              <div className="card-body p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-pepe-gold/10 rounded-xl">
                    <Info className="h-10 w-10 text-pepe-gold" />
                  </div>
                  <div>
                    <h3 className="h2 text-pepe-gold">{t("mediamaterial.cards.press.title")}</h3>
                    <p className="body-md text-pepe-t80 mt-1">{t("mediamaterial.cards.press.desc")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="btn-primary flex-1">
                    <a href="/pressemappe" target="_blank" rel="noreferrer">
                      <LinkIcon className="mr-2 h-5 w-5" />
                      {t("mediamaterial.cards.press.page")}
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="flex-1">
                    <a href="/technical-rider" target="_blank" rel="noreferrer">
                      <LinkIcon className="mr-2 h-5 w-5" />
                      {t("mediamaterial.cards.press.rider")}
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Trailer - Featured */}
            <div className="card hover:border-pepe-gold transition-all">
              <div className="card-body p-0 flex flex-col">
                <AspectRatio ratio={16 / 9}>
                  <video
                    src="/videos/Vorschauloop.webm"
                    muted
                    autoPlay
                    loop
                    playsInline
                    aria-label="Trailer Vorschauvideo"
                    className="h-full w-full object-cover rounded-t-xl"
                  />
                </AspectRatio>
                <div className="p-6">
                  <h3 className="h3 text-pepe-gold mb-2">{t("mediamaterial.cards.trailer.title")}</h3>
                  <p className="body-sm text-pepe-t80 mb-4">{t("mediamaterial.cards.trailer.desc")}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <a href="/videos/Vorschauloop.webm" download>
                        <Download className="mr-2 h-4 w-4" />
                        {t("mediamaterial.cards.trailer.webm")}
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <a href="https://www.youtube.com/watch?v=dXHLaIkezTM" target="_blank" rel="noreferrer">
                        <Video className="mr-2 h-4 w-4" />
                        {t("mediamaterial.cards.trailer.youtube")}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regular Cards - Logos & Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
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

