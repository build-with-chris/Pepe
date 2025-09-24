"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logos3 } from "@/components/logos3";
import { useTranslation } from "react-i18next";

const Gallery23 = () => {
  const { t } = useTranslation();

  const images = [
    { id: 1, code: "#0031", title: t("gallery23.images.1"), image: "/images/eventTypes/Firmenfeier.webp" },
    { id: 2, code: "#0045", title: t("gallery23.images.2"), image: "/images/eventTypes/Incentive.webp" },
    { id: 3, code: "#0023", title: t("gallery23.images.3"), image: "/images/disciplines/Moderation.webp" },
    { id: 4, code: "#0007", title: t("gallery23.images.4"), image: "/images/disciplines/Luftakrobatik.webp" },
    { id: 5, code: "#0003", title: t("gallery23.images.5"), image: "/images/teamSizes/Solo.webp" },
  ];

  const [activeImage, setActiveImage] = useState<number | null>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % images.length;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-black text-white mb-10 mx-5 cv-auto">
      <div className="container p-4 md:p-8 lg:p-10">
        <div className="relative flex flex-col items-center gap-8 md:gap-12 bg-black p-5 py-10 md:p-10 md:py-20 md:flex-row md:items-start">
          <div className="flex h-142 flex-col justify-center items-center text-center w-full md:flex-1 md:min-w-0 md:pr-10">
            <h1 className="max-w-lg font-calSans text-white">
              <span className="block text-3xl lg:hidden">{t("gallery23.headingMobile")}</span>
              <span className="hidden lg:block text-4xl">{t("gallery23.headingDesktop")}</span>
            </h1>
            <p className="text-md mt-10 max-w-2xl text-gray-300">
              {t("gallery23.subtitle")}
            </p>
            <Link to="/kontakt" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button
                variant="secondary"
                className="group mt-10 flex w-fit items-center justify-center gap-2 rounded-full tracking-tight bg-white text-black hover:bg-gray-200"
              >
                {t("gallery23.cta")}
                <ArrowRight className="size-4 -rotate-45 transition-all ease-out group-hover:rotate-0" />
              </Button>
            </Link>
            <div className="lg:mt-8 w-full md:max-w-[36rem] md:self-center overflow-hidden">
              <Logos3 />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 w-full md:flex-1 md:min-w-0 md:max-w-[36rem] lg:max-w-[44rem]">
            {images.map((image, index) => {
              const first = image.title.split(" ")[0] || image.title;
              const second = image.title.split(" ")[1] || "";
              return (
                <div key={image.id} className="w-full self-stretch max-w-full">
                  <motion.div
                    initial={{ height: "3rem" }}
                    animate={{ height: activeImage === index ? "auto" : "3rem" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    onClick={() => setActiveImage(index)}
                    onHoverStart={() => setActiveImage(index)}
                    className="group relative cursor-pointer overflow-hidden rounded-4xl border w-full self-stretch max-w-full aspect-[4/3] md:aspect-[5/4] lg:aspect-[16/10]"
                  >
                    {/* Always-visible top overlay title */}
                    <div className="absolute inset-x-0 top-0 z-10 flex items-start">
                      <h3 className="m-2 md:m-3 text-white text-base md:text-lg lg:text-xl font-bold drop-shadow">
                        {first}
                        {second && (
                          <span className="font-playfair italic"> {second} </span>
                        )}
                      </h3>
                    </div>
                    {/* Top gradient for title readability */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 md:h-20 bg-gradient-to-b from-black/60 to-transparent" />
                    <AnimatePresence>
                      {activeImage === index && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute h-full w-full bg-gradient-to-t from-black/70 to-transparent"
                        />
                      )}
                    </AnimatePresence>
                    <img
                      src={image.image}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      width={480}
                      height={360}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
                      className={
                        "size-full object-cover " +
                        ((image.id === 3 || image.id === 5) ? "[object-position:center_15%]" : "object-center")
                      }
                      alt={image.title}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const DashedBorderH = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg {...props} fill="none" xmlns="http://www.w3.org/2000/svg">
      <line
        opacity="0.2"
        x1="1571.5"
        y1="0.570312"
        x2="0.683594"
        y2="0.570271"
        stroke="white"
        strokeDasharray="5 5"
      />
    </svg>
  );
};
const DashedBorderV = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg {...props} fill="none" xmlns="http://www.w3.org/2000/svg">
      <line
        opacity="0.2"
        x1="0.631348"
        y1="0.208984"
        x2="0.631311"
        y2="828.348"
        stroke="white"
        strokeDasharray="5 5"
      />
    </svg>
  );
};

export { Gallery23 };
