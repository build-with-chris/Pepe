import * as React from "react";
import { useTranslation } from "react-i18next";

export type RegisteredInvoice = {
  id: number;
  storage_path: string;
  status?: string;
  amount_cents?: number | null;
  currency?: string | null;
  invoice_date?: string | null;
  created_at?: string | null;
  signed_url?: string; // optional, wenn vorhanden
};

type Props = {
  rows: RegisteredInvoice[];
  error: string | null;
  fmtAmount: (cents?: number | null, currency?: string | null) => string;
  onOpen?: (row: RegisteredInvoice) => void; // optional
};

export default function RegisteredTable({ rows, error, fmtAmount }: Props) {
  const { t } = useTranslation();

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">{t('accounting.registered.title')}</h2>
      <div className="bg-gray-900 border border-gray-800 rounded p-4">
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {rows.length === 0 ? (
          <p className="text-gray-400 text-sm">{t('accounting.registered.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-gray-300 border-b border-gray-800">
                  <th className="py-2 pr-4">{t('accounting.registered.th.created')}</th>
                  <th className="py-2 pr-4">{t('accounting.registered.th.file')}</th>
                  <th className="py-2 pr-4">{t('accounting.registered.th.date')}</th>
                  <th className="py-2 pr-4">{t('accounting.registered.th.amount')}</th>
                  <th className="py-2 pr-4">{t('accounting.registered.th.status')}</th>
                  <th className="py-2 pr-4">{t('accounting.registered.th.action')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-gray-800">
                    <td className="py-2 pr-4 text-gray-300">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                    <td className="py-2 pr-4">
                      <div className="truncate max-w-[360px] text-gray-200" title={r.storage_path}>{r.storage_path}</div>
                    </td>
                    <td className="py-2 pr-4 text-gray-300">{r.invoice_date || '—'}</td>
                    <td className="py-2 pr-4 text-gray-300">{fmtAmount(r.amount_cents, r.currency)}</td>
                    <td className="py-2 pr-4">
                      <span className={
                        r.status === 'paid' ? 'text-green-300' :
                        r.status === 'rejected' ? 'text-red-300' :
                        r.status === 'verified' ? 'text-amber-300' : 'text-gray-300'
                      }>
                        {t(`accounting.registered.status.${(r.status || 'uploaded').toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {r.signed_url ? (
                        <a href={r.signed_url} className="text-blue-300 hover:underline" target="_blank" rel="noreferrer">
                          {t('accounting.registered.open')}
                        </a>
                      ) : <span className="text-gray-500">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}