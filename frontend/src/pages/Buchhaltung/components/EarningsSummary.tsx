import * as React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  month: { total: number; count: number };
  year:  { total: number; count: number };
  error?: string | null;
};

export default function EarningsSummary({ month, year, error }: Props) {
  const { t } = useTranslation();

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">{t('accounting.earnings.title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-sm text-gray-400">{t('accounting.earnings.month')}</div>
          <div className="text-2xl font-bold mt-1">{month.total.toLocaleString()} €</div>
          <div className="text-xs text-gray-400 mt-1">{t('accounting.earnings.acceptedCount', { count: month.count })}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-sm text-gray-400">{t('accounting.earnings.year')}</div>
          <div className="text-2xl font-bold mt-1">{year.total.toLocaleString()} €</div>
          <div className="text-xs text-gray-400 mt-1">{t('accounting.earnings.acceptedCount', { count: year.count })}</div>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      <p className="text-xs text-gray-500 mt-6">
        {t('accounting.earnings.note')}
      </p>
    </section>
  );
}
