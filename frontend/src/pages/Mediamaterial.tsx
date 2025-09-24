import { Fragment } from "react";
import { Download, FileText, Image as ImageIcon, Video, FolderDown, Link as LinkIcon, Info } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

// Pepe Mediamaterial – Seite für Veranstalter
// Hinweis: Lege deine Dateien in /public/media/... ab (siehe Pfade unten).
// Passe die Links/Dateinamen unten an deine echten Assets an.

export default function Mediamaterial() {
  const { t } = useTranslation();

  return (
    <Fragment>
      {/* Header / Hero */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
            <div className="bg-gray-800 inline-flex items-center gap-2 rounded-md py-2 pl-4 pr-3">
              <ImageIcon className="h-6 w-6 stroke-white" />
              <span className="text-white text-lg font-bold">{t("mediamaterial.hero.kicker")}</span>
            </div>
            <h1 className="text-white mt-6 text-5xl font-semibold leading-tight md:text-6xl whitespace-pre-line">
              {t("mediamaterial.hero.title")}
            </h1>
            <p className="text-gray-300 mt-4 text-xl md:text-2xl">
              {t("mediamaterial.hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-full">
                <a href="/media/pepe_media_kit.zip" download>
                  <FolderDown className="mr-2 h-5 w-5" />
                  {t("mediamaterial.hero.buttons.zip")}
                </a>
              </Button>
              <Button asChild variant="secondary" className="rounded-full">
                <a href="https://www.youtube.com/watch?v=dXHLaIkezTM" target="_blank" rel="noreferrer">
                  <Video className="mr-2 h-5 w-5" />
                  {t("mediamaterial.hero.buttons.trailer")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Allgemeines Material */}
      <section className="bg-black py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-white mb-6 text-3xl font-semibold md:text-4xl text-center">{t("mediamaterial.general.title")}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto justify-items-center">
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
              preview="src/assets/PEPE.png"
              downloads={[
                { label: t("mediamaterial.cards.header.h169"), href: "/images/Brandguide/Header Pepe 16:9.jpg" },
                { label: t("mediamaterial.cards.header.h54"), href: "/images/Brandguide/Header Pepe 5:4.jpg" },
              ]}
            />

            {/* Pressemappe */}
            <MediaCard
              title={t("mediamaterial.cards.press.title")}
              description={t("mediamaterial.cards.press.desc")}
              preview={<Info className="h-16 w-16 text-gray-500 mx-auto" />}
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

      {/* Disziplinen */}
      <section className="bg-black pb-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-white mb-6 text-3xl font-semibold md:text-4xl text-center">{t("mediamaterial.disciplines.title")}</h2>
          <p className="text-gray-300 mb-8 max-w-3xl text-lg text-center mx-auto">
            {t("mediamaterial.disciplines.subtitle")}
          </p>

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

          <div className="mt-10 flex justify-center">
            <Button asChild className="rounded-full">
              <a href="/media/disciplines/all_disciplines.zip" download>
                <FolderDown className="mr-2 h-5 w-5" />
                {t("mediamaterial.disciplines.allZip")}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

// ——— Hilfs-Komponenten ———

type DownloadLink = { label: string; href: string; external?: boolean };

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
    <div className="rounded-2xl border border-gray-800 bg-[#0b0b0b] p-5 w-full text-center">
      <div className="mb-4 overflow-hidden rounded-xl">
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
            <div className="flex h-40 items-center justify-center">
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
          <div className="flex h-40 items-center justify-center bg-gray-900">
            {icon === "file" ? <FileText className="h-8 w-8 text-gray-500" /> : <ImageIcon className="h-8 w-8 text-gray-500" />}
          </div>
        )}
      </div>
      <h3 className="text-white text-xl font-semibold text-center">{title}</h3>
      <p className="text-gray-300 mt-1 text-sm text-center">{description}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {downloads.map((d, i) =>
          d.external ? (
            <Button key={i} asChild size="sm" variant="secondary" className="rounded-full">
              <a href={d.href} target="_blank" rel="noreferrer">
                <LinkIcon className="mr-2 h-4 w-4" />
                {d.label}
              </a>
            </Button>
          ) : (
            <Button key={i} asChild size="sm" className="rounded-full">
              <a href={d.href} download>
                <Download className="mr-2 h-4 w-4" />
                {d.label}
              </a>
            </Button>
          )
        )}
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
    <details className="group rounded-2xl border border-gray-800 bg-[#0b0b0b] p-5 open:bg-[#0f0f0f]">
      <summary className="flex cursor-pointer list-none flex-col items-center gap-2">
        <div>
          <h3 className="text-white text-2xl font-semibold text-center">{name}</h3>
          <p className="text-gray-400 mt-1 text-sm text-center">{teaser}</p>
        </div>
        <span className="text-gray-400 text-sm group-open:hidden">{t("mediamaterial.disciplines.expand")}</span>
        <span className="text-gray-400 text-sm hidden group-open:inline">{t("mediamaterial.disciplines.collapse")}</span>
      </summary>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 justify-center justify-items-center">
        {images.map((src, i) => (
          <AspectRatio key={i} ratio={4 / 5}>
            <img
              src={src}
              alt={t("mediamaterial.disciplines.imageAlt", { name, index: i + 1 })}
              className="h-full w-full rounded-lg object-cover"
              loading="lazy"
            />
          </AspectRatio>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {downloads.map((d, i) => (
          <Button key={i} asChild size="sm" className="rounded-full">
            <a href={d.href} download>
              <Download className="mr-2 h-4 w-4" />
              {d.label}
            </a>
          </Button>
        ))}
      </div>
    </details>
  );
}
