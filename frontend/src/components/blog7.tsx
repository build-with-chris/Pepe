import { ArrowRight } from "lucide-react";
import LogoPepe from '../assets/LogoPepe.png'
import PepeArts from '../assets/Pepearts.png'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface Post {
  id: string;
  title: string;
  summary: string;
  label: string;
  author: string;
  published: string;
  url: string;
  image: string;
}

interface Blog7Props {
  tagline: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  posts: Post[];
}

const Blog7 = ({
  heading = "Pepes Dreifaltigkeit",
  description = "Pepe wurde in München gegründet, um die Zirkusszene zu pushen. Heute sind wir ein starkes Netzwerk mit Base in der Stadt. Unsere Base? Der Pepe Geodome im Ostpark – hier trifft sich unser Kernteam regelmäßig zum Profitraining und für neue Ideen.",
  buttonText = "Mehr über uns",
  buttonUrl = "/kontakt",
  posts = [
    {
      id: "post-1",
      title: "PepeShows",
      summary:
        "Kommerzielle Auftritte für Events aller Größen – von der Firmenfeier bis zur großen Gala. Wir finden den passenden Act und machen dein Event unvergesslich.",
      label: "Shows",
      author: "Pepe Team",
      published: "1 Jan 2025",
      url: "/anfragen",
      image: LogoPepe,
    },
    {
      id: "post-2",
      title: "Pepe Arts",
      summary:
        "Kulturelle Projekte und Kooperationen – von Varieté über Festivals bis hin zu interdisziplinären Formaten.",
      label: "Kultur",
      author: "Pepe Team",
      published: "1 Jan 2025",
      url: "www.pepearts.de",
      image: PepeArts,
    },
    {
      id: "post-3",
      title: "Pepe Dome",
      summary:
        "Unsere Ausbildungsstätte und Ort für Wachstum. Im Pepe Geodome im Ostpark trainiert unser Kernteam, probt neue Ideen und entwickelt Acts weiter.",
      label: "Ausbildung",
      author: "Pepe Team",
      published: "1 Jan 2025",
      url: "/",
      image: "https://media.vrbo.com/lodging/108000000/107050000/107047700/107047637/7571fd4e.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
    },
  ],
}: Blog7Props) => {
  return (
    <section className="py-10">
      <div className="container mx-auto flex flex-col items-center gap-16 lg:px-16">
        <div className="text-center">
          <h2 className="mb-3 text-3xl font-semibold text-pretty md:mb-4 md:text-4xl lg:mb-6 lg:max-w-3xl lg:text-5xl">
            {heading}
          </h2>
          <p className="text-muted-foreground md:text-base lg:max-w-2xl lg:text-lg">
            {description}
          </p>
          <Button variant="link" className="w-full sm:w-auto" asChild>
            <a href={buttonUrl} target="_blank">
              {buttonText}
              <ArrowRight className="ml-2 size-4" />
            </a>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="grid grid-rows-[auto_auto_1fr_auto] pt-0"
            >
              <div className="aspect-16/9 w-full bg-black overflow-hidden flex items-center justify-center">
                <a
                  href={post.url}
                  target="_blank"
                  className="transition-opacity duration-200 fade-in hover:opacity-70"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-[70%] w-auto object-contain object-center mx-auto"
                  />
                </a>
              </div>
              <CardHeader>
                <h3 className="text-lg font-semibold hover:underline md:text-xl">
                  <a href={post.url} target="_blank">
                    {post.title}
                  </a>
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.summary}</p>
              </CardContent>
              <CardFooter>
                <a
                  href={post.url}
                  target="_blank"
                  className="flex items-center text-foreground hover:underline"
                >
                  Mehr erfahren
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Blog7 };
