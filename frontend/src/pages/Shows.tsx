import { About1 } from "@/components/about1";
import { Gallery34 } from "@/components/gallery34";
import { Helmet } from "react-helmet-async";

export default function Shows() {
    return (
        <>
          <Helmet>
            <title>Shows & Formate – PepeShows</title>
            <meta
              name="description"
              content="Von kurzem Show-Highlight bis abendfüllendem Varieté: PepeShows liefert die passende Größe – Solo-Acts oder Ensembles, inklusive Regie, Musik & Kostüm. Einzigartige Konzepte für unvergessliche Momente."
            />
          </Helmet>
          <div className="flex flex-col items-center justify-center min-h-screen bg-black">
              <Gallery34 />
              <About1 />
          </div>
        </>
    )
}    