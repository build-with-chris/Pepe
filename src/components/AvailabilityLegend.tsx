import * as React from "react";
import { useTranslation } from "react-i18next";

const AvailabilityLegend: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-[28rem] md:max-w-[36rem] mb-4 p-3 border border-white/20 rounded bg-transparent text-white text-sm">
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded border border-green-500"></div>
          <span>{t('calendar.legend.available')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded border border-red-500"></div>
          <span>{t('calendar.legend.unavailable')}</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityLegend;