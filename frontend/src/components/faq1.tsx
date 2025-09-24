import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface Faq1Props {
  heading?: string;
  items?: FaqItem[];
}

const Faq1 = ({ heading, items }: Faq1Props) => {
  const { t } = useTranslation();

  const headingText = heading ?? t("faq1.heading");
  const itemsData: FaqItem[] =
    items ?? [
      { id: "faq-1", question: t("faq1.items.1.q"), answer: t("faq1.items.1.a") },
      { id: "faq-2", question: t("faq1.items.2.q"), answer: t("faq1.items.2.a") },
      { id: "faq-3", question: t("faq1.items.3.q"), answer: t("faq1.items.3.a") },
      { id: "faq-4", question: t("faq1.items.4.q"), answer: t("faq1.items.4.a") },
      { id: "faq-5", question: t("faq1.items.5.q"), answer: t("faq1.items.5.a") },
      { id: "faq-6", question: t("faq1.items.6.q"), answer: t("faq1.items.6.a") },
      { id: "faq-7", question: t("faq1.items.7.q"), answer: t("faq1.items.7.a") },
      { id: "faq-8", question: t("faq1.items.8.q"), answer: t("faq1.items.8.a") },
      { id: "faq-9", question: t("faq1.items.9.q"), answer: t("faq1.items.9.a") },
      { id: "faq-10", question: t("faq1.items.10.q"), answer: t("faq1.items.10.a") },
      { id: "faq-11", question: t("faq1.items.11.q"), answer: t("faq1.items.11.a") },
    ];
  return (
    <section className="py-32 bg-black text-white flex justify-center">
      <div className="w-full max-w-2xl px-4 text-center">
        <h1 className="mb-8 text-3xl font-bold md:mb-12 md:text-4xl">
          {headingText}
        </h1>
        <Accordion type="single" collapsible>
          {itemsData.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="font-semibold text-left hover:no-underline py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-300 text-left pb-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export { Faq1 };
