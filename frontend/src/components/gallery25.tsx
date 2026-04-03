import { motion } from "framer-motion";

const Gallery25 = () => {
  const column1Images = [
    { src: "/images/Gallery25/23rem1.webp", alt: "Artistin bei einer Live-Performance", height: "23rem" },
    { src: "/images/Gallery25/28rem1.webp", alt: "Akrobatik-Show auf der Bühne", height: "28rem" },
    { src: "/images/Gallery25/12rem1.webp", alt: "Künstler im Rampenlicht", height: "12rem" },
    { src: "/images/Gallery25/32rem4.webp", alt: "Spektakuläre Bühnenshow", height: "32rem" },
    { src: "/images/Gallery25/13rem3.webp", alt: "Performer bei einer Veranstaltung", height: "13rem" },
    { src: "/images/Gallery25/22rem2.webp", alt: "Artistik-Darbietung im Scheinwerferlicht", height: "22rem" },
  ];

  const column2Images = [
    { src: "/images/Gallery25/13rem1.svg", alt: "Grafisches Element der Galerie", height: "13rem" },
    { src: "/images/Gallery25/32rem1.webp", alt: "Atemberaubende Luftakrobatik", height: "32rem" },
    { src: "/images/Gallery25/18rem1.webp", alt: "Künstler während einer Show", height: "18rem" },
    { src: "/images/Gallery25/22.5rem2.png", alt: "Impression einer Gala-Veranstaltung", height: "22.5rem" },
    { src: "/images/Gallery25/32rem5.webp", alt: "Dynamische Bühnenperformance", height: "32rem" },
    { src: "/images/Gallery25/12rem2.webp", alt: "Moment aus einer Live-Show", height: "12rem" },
  ];

  const column3Images = [
    { src: "/images/Gallery25/32rem2.webp", alt: "Elegante Artistik-Performance", height: "32rem" },
    { src: "/images/Gallery25/32rem3.webp", alt: "Feuerkünstler bei Nacht", height: "32rem" },
    { src: "/images/Gallery25/23rem2.webp", alt: "Artistin in Aktion", height: "23rem" },
    { src: "/images/Gallery25/28rem2.webp", alt: "Varieté-Show Highlight", height: "28rem" },
    { src: "/images/Gallery25/18rem2.webp", alt: "Kreative Bühnenkunst", height: "18rem" },
  ];

  const column4Images = [
    { src: "/images/Gallery25/13rem2.webp", alt: "Event-Impression", height: "13rem" },
    { src: "/images/Gallery25/22.5rem1.png", alt: "Pepe Shows Eventfotografie", height: "22.5rem" },
    { src: "/images/Gallery25/22rem1.webp", alt: "Akrobat bei einer Vorführung", height: "22rem" },
    { src: "/images/Gallery25/13rem4.webp", alt: "Show-Atmosphäre", height: "13rem" },
    { src: "/images/Gallery25/32rem6.webp", alt: "Beeindruckende Abschluss-Performance", height: "32rem" },
  ];

  const renderColumn = (images: typeof column1Images, yDirection: number) => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {images.map((image, index) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: yDirection }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          key={index}
          style={{
            width: '100%',
            overflow: 'hidden',
            borderRadius: '1rem',
            height: image.height,
          }}
        >
          <img
            style={{
              height: '100%',
              width: '100%',
              borderRadius: '1rem',
              objectFit: 'cover',
            }}
            src={image.src}
            alt={image.alt}
            loading="lazy"
          />
        </motion.div>
      ))}
    </div>
  );

  return (
    <section style={{ padding: '2.5rem 0' }}>
      <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
        }}>
          {renderColumn(column1Images, 50)}
          {renderColumn(column2Images, -50)}
          {renderColumn(column3Images, 50)}
          {renderColumn(column4Images, -50)}
        </div>
      </div>
    </section>
  );
};

export { Gallery25 };
