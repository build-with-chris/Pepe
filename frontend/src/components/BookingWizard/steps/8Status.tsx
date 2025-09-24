import React from 'react';
import type { BookingData } from '../types';
import InfoBox from '../parts/Infobox';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export interface StepNumberGuestsAndStatusProps {
  data: BookingData;
  onChange: (update: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const StepNumberGuestsAndStatus: React.FC<StepNumberGuestsAndStatusProps> = ({
  data,
  onChange,
  onNext,
  onPrev,
}) => {
  const statusOptionsList = [
    { value: 'Erstplanung', label: 'Erstplanung' },
    { value: 'Angebotsvergleich', label: 'Angebotsvergleich' },
    { value: 'Bereit zum Buchen', label: 'Bereit zum Buchen' },
    { value: 'Schneller Bedarf', label: 'Schneller Bedarf' },
  ];

  return (
    <div className="p-0 w-full mx-auto md:max-w-4/5 flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl text-center mb-3 font-extrabold">Wie ist dein aktueller Planungsstatus?</h2>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        {statusOptionsList.map(option => (
          <Button
            key={option.value}
            variant={data.planning_status === option.value ? 'secondary' : 'default'}
            className="justify-center py-8 text-lg font-medium h-20"
            onClick={() => {
              onChange({ planning_status: option.value });
              onNext();
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Erklärung – Desktop & Tablet */}
      <div className="hidden md:block w-full max-w-sm mt-4">
        <InfoBox
          title="Warum wir das fragen"
          text={
            <>Dein Planungsstatus hilft uns, die Dringlichkeit und Detailtiefe unserer Vorschläge anzupassen – ob du noch in der Ideenphase bist oder schon fast buchen möchtest.</>
          }
        />
      </div>

      {/* Erklärung – Mobile: nur Accordion */}
      <div className="md:hidden w-full max-w-sm mt-3">
        <Accordion type="single" collapsible>
          <AccordionItem value="why-planning-status">
            <AccordionTrigger>
              Warum wir nach dem Planungsstatus fragen
            </AccordionTrigger>
            <AccordionContent>
              Dein Planungsstatus hilft uns, die Dringlichkeit und Detailtiefe unserer Vorschläge anzupassen – ob du noch in der Ideenphase bist oder schon fast buchen möchtest.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default StepNumberGuestsAndStatus;
