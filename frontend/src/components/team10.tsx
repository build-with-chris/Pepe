import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const members = [
  { id: "michiHeiduk", name: "Michi Heiduk", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp" },
  { id: "chrisHermann", name: "Chris Hermann", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp" },

  { id: "danielaMeier", name: "Daniela Meier", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp" },
  { id: "jakobVoeckler", name: "Jakob Vöckler", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp" },
  { id: "jonasDuerrbeck", name: "Jonas Dürrbeck", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp" },
  { id: "carmenLueck", name: "Carmen Lück", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-7.webp" },
  { id: "lukasBrandl", name: "Lukas Brandl", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-8.webp" },
  { id: "thomasDietz", name: "Thomas Dietz", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp" },
  { id: "olesKoval", name: "Oles Koval", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp" },
  { id: "julianBellini", name: "Julian Bellini", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp" },
  { id: "jawadRajpoot", name: "Jawad Rajpoot", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp" },
  { id: "serhardPerhat", name: "Serhard Perhat", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-7.webp" },
  { id: "flo", name: "Flo", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-8.webp" },
  { id: "henryHernandez", name: "Henry Hernandez", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp" },
  { id: "gabrielDrouin", name: "Gabriel Drouin", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp" },
  { id: "svetlanaWotschel", name: "Svetlana Wotschel", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp" },
  { id: "sankofaCrew", name: "Sankofa Crew", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp" },
  { id: "janaRippel", name: "Jana Rippel", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp" },
  { id: "sarah", name: "Sarah", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp" },
  { id: "jannick", name: "Jannick", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-7.webp" },
  { id: "daniThalmaier", name: "Dani Thalmaier", image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-8.webp" }
];

const Team10 = () => {
  const { t } = useTranslation();

  return (
    <section className=" py-32">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
          <div className="max-w-xl">
            <h2 className="mb-5 text-4xl md:text-5xl">{t("team10.heading")}</h2>
            <p className="mb-12 text-muted-foreground md:text-lg">{t("team10.subheading")}</p>
            <Link to="/signup">
              <Button size="lg">{t("team10.cta")}</Button>
            </Link>
          </div>
          <div className="mt-10 lg:mt-0 lg:ml-12 w-full max-w-sm">
            <div className="rounded-full bg-stone-600 p-2 flex items-center justify-center">
              <DotLottieReact
                src="https://lottie.host/3edc2d4f-1b3f-47f0-baa3-49612e82c139/22dFCNJuHi.lottie"
                loop
                autoplay
              />
            </div>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {members.map((member, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Avatar className="size-10 border border-border">
                <AvatarImage src={member.image} />
              </Avatar>
              <div>
                <h3 className="text-sm font-medium">{member.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t(`team10.roles.${member.id}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Team10 };
