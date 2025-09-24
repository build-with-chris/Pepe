import * as React from "react";
import { useTranslation, Trans } from "react-i18next";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const GuideAccordion: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Accordion type="single" collapsible className="mb-5 rounded-md border border-white/40 bg-transparent">
      <AccordionItem value="guide">
        <AccordionTrigger className="px-4 text-white">{t('calendar.guide.title')}</AccordionTrigger>
        <AccordionContent className="px-4 pb-4 leading-relaxed text-white">
          <p className="mb-2">
            <Trans
              i18nKey="calendar.guide.autoAvailability"
              components={{
                strong: <strong />,
                green: <span className="text-green-400 font-medium" />
              }}
            />
          </p>
          <p className="mb-2">
            <Trans
              i18nKey="calendar.guide.blockDay"
              components={{
                strong: <strong />,
                red: <span className="text-red-400 font-medium" />
              }}
            />
          </p>
          <p className="mb-0">
            <Trans
              i18nKey="calendar.guide.backToAvailable"
              components={{
                strong: <strong />,
                green: <span className="text-green-400 font-medium" />
              }}
            />
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GuideAccordion;