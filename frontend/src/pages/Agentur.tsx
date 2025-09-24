import { useState } from "react"
import { Hero224 } from "@/components/hero224"

export default function Agentur() {
    return (
        <div
          className="relative flex flex-col items-center justify-center min-h-screen bg-black"
          onMouseMove={(e) => {
            const target = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - target.left;
            const y = e.clientY - target.top;
            ;(e.currentTarget as HTMLElement).style.setProperty("--mx", `${x}px`);
            ;(e.currentTarget as HTMLElement).style.setProperty("--my", `${y}px`);
          }}
        >
          {/* Mouse light effect overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: `radial-gradient(500px at var(--mx, 50%) var(--my, 50%), rgba(99,102,241,0.10), transparent 60%)`
            }}
          />
            <div className="mt-8 mb-12 md:mt-12 md:mb-16 lg:mt-16 lg:mb-24">
              <Hero224 />

              <section className="w-full px-6 md:px-12 lg:px-20 py-16 text-white space-y-12 text-left">
                <div className="space-y-4 text-lg leading-relaxed text-left">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">In unserem Team finden sich wahre Champions</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <li className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/90 shadow-md">🥇 7-facher Jonglage-Weltmeister</li>
                    <li className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/90 shadow-md">🌐 Cyr-Wheel-Weltmeisterin</li>
                    <li className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/90 shadow-md">💃 Breakdancer aus dem Olympia-Kader</li>
                    <li className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/90 shadow-md">🎩 Deutscher Meister der Zauberkunst</li>
                  </ul>
                  <p className="mt-6 text-lg text-white/80 italic border-l-4 border-indigo-500 pl-4">Wir bringen sie zusammen, um Events unvergesslich zu machen – präzise, eindrucksvoll und auf höchstem Niveau.</p>
                </div>

                <div className="relative border-t border-white/10 pt-8 text-left">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">Über uns</h2>
                  <p className="text-white/90 leading-relaxed text-lg">
                    Geleitet und organisiert wird PepeShows von <span className="font-semibold text-white">Michael Heiduk</span> und <span className="font-semibold text-white">Christoph Hermann</span> – beide selbst Artisten aus Leidenschaft.
                  </p>
                  <p className="text-white/80 leading-relaxed mt-4 text-lg">
                    Mit dieser doppelten Perspektive – <span className="italic text-white/90">Künstler</span> und <span className="italic text-white/90">Veranstalter</span> – wissen wir genau, worauf es ankommt: <span className="font-semibold text-white">Professionalität</span>, reibungslose Abläufe und Acts, die dein Publikum begeistern.
                  </p>

                  {/* Subtile Effekte */}
                  
                </div>
              </section>
            </div>
        </div>
    )
}