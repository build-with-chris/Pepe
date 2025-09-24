import React from 'react';
import { Button } from '../../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface ProgressBarProps {
  stepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  stepIndex,
  totalSteps,
  onPrev,
  onNext,
}) => {
  const { t } = useTranslation();
  if (stepIndex < 0) {
    return null;
  }
  // Calculate which image to show based on current step
  const progressPercent =
  totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

return (
  <div className="lg:w-4/5 md:w-4/5 mx-auto px-4 py-2 sm:w-full">
    {/* Ladebalken */}
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-blue-600 h-4 rounded-full transition-all"
        style={{ width: `${progressPercent}%` }}
      ></div>
    </div>
    {/* Navigation unter dem Balken */}
    <div className="flex items-center justify-between mt-3">
  <Button
    variant="secondary"
    onClick={onPrev}
    aria-label={t('booking.progress.backAria')}
  >
    <ArrowLeft className="h-5 w-5" />
    <span className="ml-2 hidden md:inline">{t('booking.progress.back')}</span>
  </Button>
  <span className="text-sm font-medium whitespace-nowrap ml-auto">
    {t('booking.progress.stepOf', { current: stepIndex + 1, total: totalSteps })}
  </span>
</div>
  </div>
);
}
export default ProgressBar;