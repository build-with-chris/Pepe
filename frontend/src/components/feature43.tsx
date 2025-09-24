import {
  BatteryCharging,
  GitPullRequest,
  Layers,
  RadioTower,
  SquareKanban,
  WandSparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Reason {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Feature43Props {
  heading?: string;
  reasons?: Reason[];
}

const Feature43 = ({ heading, reasons }: Feature43Props) => {
  const { t } = useTranslation();

  const headingText = heading ?? t("feature43.heading");

  const defaultReasons: Reason[] = [
    {
      title: t("feature43.reasons.1.title"),
      description: t("feature43.reasons.1.description"),
      icon: <WandSparkles className="size-6" />,
    },
    {
      title: t("feature43.reasons.2.title"),
      description: t("feature43.reasons.2.description"),
      icon: <Layers className="size-6" />,
    },
    {
      title: t("feature43.reasons.3.title"),
      description: t("feature43.reasons.3.description"),
      icon: <SquareKanban className="size-6" />,
    },
    {
      title: t("feature43.reasons.4.title"),
      description: t("feature43.reasons.4.description"),
      icon: <GitPullRequest className="size-6" />,
    },
    {
      title: t("feature43.reasons.5.title"),
      description: t("feature43.reasons.5.description"),
      icon: <BatteryCharging className="size-6" />,
    },
    {
      title: t("feature43.reasons.6.title"),
      description: t("feature43.reasons.6.description"),
      icon: <RadioTower className="size-6" />,
    },
  ];

  const reasonsData = reasons ?? defaultReasons;

  return (
    <section className="mt-20">
      <div className="container">
        <div className="mb-10 md:mb-20">
          <h2 className="mb-2 text-center text-3xl font-semibold lg:text-5xl">
            {headingText}
          </h2>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {reasonsData.map((reason, i) => (
            <div key={i} className="flex flex-col">
              <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-white text-black">
                {reason.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{reason.title}</h3>
              <p className="text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Feature43 };
