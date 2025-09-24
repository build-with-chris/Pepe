import { Contact7 } from "@/components/contact7";
import { Logos3 } from "@/components/logos3";
import { Cta10 } from "@/components/cta10";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export default function Kontakt() {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>Kontakt – PepeShows</title>
        <meta
          name="description"
          content="Nehmen Sie Kontakt mit PepeShows auf – wir beraten Sie persönlich zu Shows, Künstlern und individuellen Event-Konzepten. Jetzt Anfrage stellen oder direkt anrufen."
        />
      </Helmet>
      <div className="flex flex-col items-stretch justify-center min-h-screen w-full mx-auto px-6 md:px-12 lg:px-20 gap-12">
        <a href="/anfragen" className="w-full block">
          <Cta10
            buttons={{
              primary: { text: t("contactCta.button"), url: "/anfragen" },
            }}
            rightAddon={
              <DotLottieReact
                src="https://lottie.host/2c55587e-b41b-4714-b82f-f8f8807e88f9/aLh74vbsuU.lottie"
                loop
                autoplay
                style={{ width: "60px", height: "60px" }}
              />
            }
          />
        </a>
        <div className="w-full -mt-30">
          <Contact7 />
        </div>
        <div className="w-full">
          <Logos3 />
        </div>
      </div>

      {/* Floating Call Button (mobile only) */}
      <a
        href="tel:+4915904891419"
        className="fixed bottom-4 right-4 z-[9999] flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg md:hidden"
        aria-label={t("contactCta.callAria")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.684l1.12 3.367a1 1 0 01-.27 1.023l-2.12 2.12a16.001 16.001 0 006.586 6.586l2.12-2.12a1 1 0 011.023-.27l3.367 1.12a1 1 0 01.684.95V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z"
          />
        </svg>
      </a>
    </>
  );
}