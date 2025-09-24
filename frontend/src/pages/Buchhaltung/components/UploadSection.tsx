import * as React from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";

export type InvoiceFile = { name: string; url: string; size?: number; created_at?: string };

type Props = {
  amount: string; setAmount: (v: string) => void;
  invoiceDate: string; setInvoiceDate: (v: string) => void;
  note: string; setNote: (v: string) => void;
  uploading: boolean; invError: string | null;
  canUpload: boolean;
  onPick: () => void;                 // öffnet hidden <input type="file">
  onRefreshList: () => void;          // listInvoices(...)
  invoices: InvoiceFile[];
};

export default function UploadSection({
  amount, setAmount, invoiceDate, setInvoiceDate, note, setNote,
  uploading, invError, canUpload, onPick, onRefreshList, invoices
}: Props) {
  const { t } = useTranslation();
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3">{t('accounting.upload.title')}</h2>
      <div className="bg-gray-900 border border-gray-800 rounded p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">{t('accounting.upload.amount')}</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('accounting.upload.amountPlaceholder')}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{t('accounting.upload.date')}</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{t('accounting.upload.note')}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('accounting.upload.noteOptional')}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-3">
          {t('accounting.upload.hint', { code: <code>user/&lt;deine-UID&gt;</code> })}
          Lade hier deine Rechnungen zu bestätigten Gigs hoch (PDF, JPG, PNG, WEBP). Dateien werden im privaten Ordner <code>user/&lt;deine-UID&gt;</code> gespeichert.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPick}
            disabled={!canUpload || uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {t('accounting.upload.pick')}
          </button>

          <span className="text-xs text-gray-400">{t('accounting.upload.fileTypes')}</span>

          <button
            type="button"
            onClick={onRefreshList}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm border border-gray-700"
          >
            {t('accounting.upload.listRefresh')}
          </button>

          {uploading && <span className="text-gray-400 text-sm">{t('accounting.upload.uploading')}</span>}
        </div>

        {invError && <p className="text-red-400 text-sm mt-2">{invError}</p>}

        <div className="mt-4">
          <h3 className="font-medium mb-2">{t('accounting.upload.archive')}</h3>
          {invoices.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('accounting.upload.empty')}</p>
          ) : (
            <ul className="space-y-2">
              {invoices.map((f) => (
                <li key={f.name} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2">
                  <div className="truncate pr-3">
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">
                      {f.name}
                    </a>
                    {f.size ? <span className="text-gray-400 text-xs ml-2">({Math.round((f.size ?? 0)/1024)} KB)</span> : null}
                  </div>
                  <a href={f.url} target="_blank" rel="noreferrer" className="text-sm text-gray-300 hover:text-white">
                    {t('accounting.upload.open')}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}