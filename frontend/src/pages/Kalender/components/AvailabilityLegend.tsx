

import * as React from "react";
import { useTranslation } from "react-i18next";

const AvailabilityLegend: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-[28rem] md:max-w-[36rem] text-sm mb-4 flex items-center justify-center gap-6 text-white">
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500/90" />
        <span>{t('calendar.legend.available')}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-red-500/80" />
        <span>{t('calendar.legend.unavailable')}</span>
      </div>
    </div>
  );
};

export default AvailabilityLegend;