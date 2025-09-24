import { Fragment } from "react";
import { Download, ExternalLink, Image as ImageIcon, Palette, Type as TypeIcon, Camera, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useTranslation } from "react-i18next";

/**
 * Brandguide – Pepe Shows
 * Dunkler Pepe‑Look, klare Sektionen, Downloads & Beispiele
 */

export default function Brandguide() {
  const { t } = useTranslation();
  return (
    <Fragment>
      {/* Hero */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-gray-800 inline-flex items-center gap-2 rounded-md py-2 pl-4 pr-3">
              <ImageIcon className="h-6 w-6 stroke-white" />
              <span className="text-white text-lg font-bold">{t("brandguide.hero.kicker")}</span>
            </div>
            <h1 className="text-white mt-6 text-5xl font-semibold leading-tight md:text-6xl">{t("brandguide.hero.title")}</h1>
            <p className="text-gray-300 mt-4 text-lg md:text-xl">
              {t("brandguide.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="bg-black py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <Header title={t("brandguide.logos.title")} subtitle={t("brandguide.logos.subtitle")} icon={<ImageIcon className="h-6 w-6" />} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <AspectRatio ratio={16 / 9}>
                <img src="/src/assets/Logos/Logo PepeShows schwarz.png" alt="Pepe Logo Vorschau" className="h-full w-full object-contain bg-white" />
              </AspectRatio>
              <CardTitle>{t("brandguide.logos.main.title")}</CardTitle>
              <CardText>{t("brandguide.logos.main.text")}</CardText>
              <CardActions>
                <Button asChild size="sm" className="rounded-full"><a href="/src/assets/Logos/PepeShowsLogo schwarz.svg" download><Download className="mr-2 h-4 w-4" />{t("brandguide.common.svg")}</a></Button>
                <Button asChild size="sm" className="rounded-full"><a href="/src/assets/Logos/Logo PepeShows schwarz.png" download><Download className="mr-2 h-4 w-4" />{t("brandguide.common.png")}</a></Button>
              </CardActions>
            </Card>

            <Card>
              <AspectRatio ratio={16 / 9}>
                <div className="flex h-full w-full items-center justify-center bg-black">
                  <img src="/src/assets/Logos/Logo PepeShows weiß.png" alt="Pepe Logo invertiert" className="h-16 w-auto" />
                </div>
              </AspectRatio>
              <CardTitle>{t("brandguide.logos.inverted.title")}</CardTitle>
              <CardText>{t("brandguide.logos.inverted.text")}</CardText>
              <CardActions>
                <Button asChild size="sm" className="rounded-full"><a href="/src/assets/Logos/PepeShows weiß.svg" download><Download className="mr-2 h-4 w-4" />{t("brandguide.common.svg")}</a></Button>
                <Button asChild size="sm" className="rounded-full"><a href="/src/assets/Logos/Logo PepeShows weiß.png" download><Download className="mr-2 h-4 w-4" />{t("brandguide.common.png")}</a></Button>
              </CardActions>
            </Card>

            <Card>
              <AspectRatio ratio={16 / 9}>
                <div className="flex h-full w-full items-center justify-center bg-white">
                  <img src="/src/assets/Logos/Logo PepeShows schwarz.png" alt="Pepe Logo schwarz" className="h-16 w-auto" />
                </div>
              </AspectRatio>
              <CardTitle>{t("brandguide.logos.mono.title")}</CardTitle>
              <CardText>{t("brandguide.logos.mono.text")}</CardText>
              <CardActions>
                <Button asChild size="sm" className="rounded-full"><a href="/src/assets/Logos/PepeShowsLogo schwarz.svg" download><Download className="mr-2 h-4 w-4" />{t("brandguide.common.svg")}</a></Button>
                <Button asChild size="sm" className="rounded-full"><a href="/src/assets/Logos/Logo PepeShows schwarz.png" download><Download className="mr-2 h-4 w-4" />{t("brandguide.common.png")}</a></Button>
              </CardActions>
            </Card>
          </div>
        </div>
      </section>

      {/* Farben */}
      <section className="bg-black py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <Header title={t("brandguide.colors.title")} subtitle={t("brandguide.colors.subtitle")} icon={<Palette className="h-6 w-6" />} />

          <div className="mx-auto grid max-w-3xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            <ColorSwatch name={t("brandguide.colors.primary")} hex="#1D3557" rgb="29, 53, 87" cmyk="100, 75, 25, 40" />
            <ColorSwatch name={t("brandguide.colors.white")} hex="#FFFFFF" rgb="255, 255, 255" cmyk="0, 0, 0, 0" border />
            <ColorSwatch name={t("brandguide.colors.black")} hex="#000000" rgb="0, 0, 0" cmyk="0, 0, 0, 100" />
          </div>
        </div>
      </section>

      {/* Typografie */}
      <section className="bg-black py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <Header title={t("brandguide.type.title")} subtitle={t("brandguide.type.subtitle")} icon={<TypeIcon className="h-6 w-6" />} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardTitle>{t("brandguide.type.headlines.title")}</CardTitle>
              <CardText>
                {t("brandguide.type.headlines.text")}
              </CardText>
              <CardActions>
                <Button asChild size="sm" variant="secondary" className="rounded-full"><a href="https://fonts.google.com/specimen/Nunito+Sans" target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />{t("brandguide.common.googleFonts")}</a></Button>
              </CardActions>
            </Card>

            <Card>
              <CardTitle>{t("brandguide.type.body.title")}</CardTitle>
              <CardText>{t("brandguide.type.body.text")}</CardText>
              <CardActions>
                <Button asChild size="sm" variant="secondary" className="rounded-full"><a href="https://fonts.google.com/specimen/Nunito+Sans" target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />{t("brandguide.common.googleFonts")}</a></Button>
              </CardActions>
            </Card>
          </div>
        </div>
      </section>

      {/* Bildsprache */}
      <section className="bg-black py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <Header title={t("brandguide.imagery.title")} subtitle={t("brandguide.imagery.subtitle")} icon={<Camera className="h-6 w-6" />} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <AspectRatio ratio={4 / 5}>
            <img
                src="/images/eventTypes/Streetshow.webp"
                alt={t("brandguide.imagery.alt.streetshow")}
                className="h-full w-full rounded-xl object-cover"
            />
            </AspectRatio>

            <AspectRatio ratio={4 / 5}>
            <img
                src="/images/teamSizes/Solo.webp"
                alt={t("brandguide.imagery.alt.solo")}
                className="h-full w-full rounded-xl object-cover"
            />
            </AspectRatio>

            <AspectRatio ratio={4 / 5}>
            <img
                src="/images/disciplines/Luftakrobatik.webp"
                alt={t("brandguide.imagery.alt.aerial")}
                className="h-full w-full rounded-xl object-cover"
            />
            </AspectRatio>
          </div>
        </div>
      </section>

      {/* Tonalität */}
      <section className="bg-black py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <Header title={t("brandguide.tone.title")} subtitle={t("brandguide.tone.subtitle")} icon={<MessageSquare className="h-6 w-6" />} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardTitle>{t("brandguide.tone.do.title")}</CardTitle>
              <ul className="text-gray-200 text-sm space-y-2 list-disc pl-5">
                <li>{t("brandguide.tone.do.i1")}</li>
                <li>{t("brandguide.tone.do.i2")}</li>
                <li>{t("brandguide.tone.do.i3")}</li>
              </ul>
            </Card>
            <Card>
              <CardTitle>{t("brandguide.tone.dont.title")}</CardTitle>
              <ul className="text-gray-200 text-sm space-y-2 list-disc pl-5">
                <li>{t("brandguide.tone.dont.i1")}</li>
                <li>{t("brandguide.tone.dont.i2")}</li>
                <li>{t("brandguide.tone.dont.i3")}</li>
              </ul>
            </Card>
            <Card>
              <CardTitle>{t("brandguide.tone.contact.title")}</CardTitle>
              <p className="text-gray-300 text-sm">{t("brandguide.tone.contact.help")}</p>
              <p className="text-gray-200 text-sm"><span className="font-semibold">{t("brandguide.common.email")}: </span>info@pepeshows.de</p>
              <p className="text-gray-200 text-sm"><span className="font-semibold">{t("brandguide.common.web")}: </span>www.pepeshows.de</p>
            </Card>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

// ——— Hilfs-Komponenten ———

function Header({ title, subtitle, icon }: { title: string; subtitle: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-6 text-center">
      <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-white">
        {icon}
        <span className="text-lg font-bold">{title}</span>
      </div>
      <p className="mx-auto max-w-3xl text-gray-300">{subtitle}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-gray-800 bg-[#0b0b0b] p-6">{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-2xl font-semibold text-white">{children}</h3>;
}

function CardText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-300">{children}</p>;
}

function CardActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex flex-wrap gap-2">{children}</div>;
}

function ColorSwatch({ name, hex, rgb, cmyk, border }: { name: string; hex: string; rgb: string; cmyk: string; border?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-gray-800 bg-[#0b0b0b] p-6">
      <div className={`mb-4 h-24 w-full rounded-xl ${border ? "border border-gray-200" : ""}`} style={{ backgroundColor: hex }} />
      <h4 className="text-lg font-semibold text-white">{name}</h4>
      <p className="text-sm text-gray-300">{t("brandguide.colors.hex")} {hex}</p>
      <p className="text-sm text-gray-300">{t("brandguide.colors.rgb")} {rgb}</p>
      <p className="text-sm text-gray-300">{t("brandguide.colors.cmyk")} {cmyk}</p>
    </div>
  );
}
