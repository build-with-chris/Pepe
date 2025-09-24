"use client";

import { motion } from "framer-motion";
import React from "react";

const Gallery25 = () => {
  const column1Images = [
    { src: "/images/Gallery25/23rem1.webp", alt: "23rem1", lgHeightClass: "lg:h-[23rem]" },
    { src: "/images/Gallery25/28rem1.webp", alt: "28rem1", lgHeightClass: "lg:h-[28rem]" },
    { src: "/images/Gallery25/12rem1.webp", alt: "12rem1", lgHeightClass: "lg:h-[12rem]" },
    { src: "/images/Gallery25/32rem4.webp", alt: "32rem4", lgHeightClass: "lg:h-[32rem]" },
    { src: "/images/Gallery25/13rem3.webp", alt: "13rem3", lgHeightClass: "lg:h-[13rem]" },
    { src: "/images/Gallery25/22rem2.webp", alt: "22rem2", lgHeightClass: "lg:h-[22rem]" },
  ];

  const column2Images = [
    { src: "/images/Gallery25/13rem1.svg", alt: "13rem1", lgHeightClass: "lg:h-[13rem]" },
    { src: "/images/Gallery25/32rem1.webp", alt: "32rem1", lgHeightClass: "lg:h-[32rem]" },
    { src: "/images/Gallery25/18rem1.webp", alt: "18rem1", lgHeightClass: "lg:h-[18rem]" },
    { src: "/images/Gallery25/22.5rem2.png", alt: "22.5rem2", lgHeightClass: "lg:h-[22.5rem]" },
    { src: "/images/Gallery25/32rem5.webp", alt: "32rem5", lgHeightClass: "lg:h-[32rem]" },
    { src: "/images/Gallery25/12rem2.webp", alt: "12rem2", lgHeightClass: "lg:h-[12rem]" },
  ];

  const column3Images = [
    { src: "/images/Gallery25/32rem2.webp", alt: "32rem2", lgHeightClass: "lg:h-[32rem]" },
    { src: "/images/Gallery25/32rem3.webp", alt: "32rem3", lgHeightClass: "lg:h-[32rem]" },
    { src: "/images/Gallery25/23rem2.webp", alt: "23rem2", lgHeightClass: "lg:h-[23rem]" },
    { src: "/images/Gallery25/28rem2.webp", alt: "28rem2", lgHeightClass: "lg:h-[28rem]" },
    { src: "/images/Gallery25/18rem2.webp", alt: "18rem2", lgHeightClass: "lg:h-[18rem]" },
  ];

  const column4Images = [
    { src: "/images/Gallery25/13rem2.webp", alt: "13rem2", lgHeightClass: "lg:h-[13rem]" },
    { src: "/images/Gallery25/22.5rem1.png", alt: "22.5rem1", lgHeightClass: "lg:h-[22.5rem]" },
    { src: "/images/Gallery25/22rem1.webp", alt: "22rem1", lgHeightClass: "lg:h-[22rem]" },
    { src: "/images/Gallery25/13rem4.webp", alt: "13rem4", lgHeightClass: "lg:h-[13rem]" },
    { src: "/images/Gallery25/32rem6.webp", alt: "32rem6", lgHeightClass: "lg:h-[32rem]" },
  ];

  return (
    <section className="py-10">
      <div className="relative container">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 */}
          <div className="grid gap-4">
            {column1Images.map((image, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 50,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                key={index}
                className={`w-full overflow-hidden rounded-2xl bg-muted h-auto ${image.lgHeightClass}`}
              >
                <img
                  className="h-full w-full rounded-2xl object-contain lg:object-cover"
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="grid gap-4">
            {column2Images.map((image, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: -50,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                key={index}
                className={`w-full overflow-hidden rounded-2xl bg-muted h-auto ${image.lgHeightClass}`}
              >
                <img
                  className="h-full w-full rounded-2xl object-contain lg:object-cover"
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>

          {/* Column 3 */}
          <div className="grid gap-4">
            {column3Images.map((image, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 50,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                key={index}
                className={`w-full overflow-hidden rounded-2xl bg-muted h-auto ${image.lgHeightClass}`}
              >
                <img
                  className="h-full w-full rounded-2xl object-contain lg:object-cover"
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>

          {/* Column 4 */}
          <div className="grid gap-4">
            {column4Images.map((image, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: -50,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                key={index}
                className={`w-full overflow-hidden rounded-2xl bg-muted h-auto ${image.lgHeightClass}`}
              >
                <img
                  className="h-full w-full rounded-2xl object-contain lg:object-cover"
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Gallery25 };
