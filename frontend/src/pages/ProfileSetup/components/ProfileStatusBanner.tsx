import React from "react";
import { useTranslation } from "react-i18next";

export type ProfileStatus = 'approved' | 'pending' | 'rejected' | 'unsubmitted';

export interface ProfileStatusBannerProps {
  status: ProfileStatus;
  rejectionReason?: string | null;
  className?: string;
  /** Optional: called when user wants to start editing */
  onEdit?: () => void;
  /** Optional: open guidelines/help */
  onOpenGuidelines?: () => void;
  /** Optional: support email for a mailto link */
  supportEmail?: string;
}

export function ProfileStatusBanner({ status, rejectionReason, className, onEdit, onOpenGuidelines, supportEmail }: ProfileStatusBannerProps) {
  const { t } = useTranslation();

  if (status === 'approved') return null;

  const isRejected = status === 'rejected';
  const container = `${className ?? ''} rounded-lg border p-4 ${
    isRejected ? 'bg-red-50 border-red-300 text-red-800' : 'bg-amber-50 border-amber-300 text-amber-900'
  }`;

  const primaryBtn = 'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm';
  const editBtnCls = isRejected
    ? `${primaryBtn} border-red-400/60 text-red-800 hover:bg-red-100`
    : `${primaryBtn} border-amber-400/60 text-amber-900 hover:bg-amber-100`;
  const ghostBtn = 'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:underline';

  return (
    <div
      className={container}
      role={isRejected ? 'alert' : 'status'}
      aria-live={isRejected ? 'assertive' : 'polite'}
    >
      {status === 'pending' && (
        <div>
          <p className="mb-2">{t('profileStatusBanner.pending.info')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {onOpenGuidelines && (
              <button type="button" onClick={onOpenGuidelines} className={editBtnCls}>
                {t('profileStatusBanner.actions.viewGuidelines')}
              </button>
            )}
            {supportEmail && (
              <a href={`mailto:${supportEmail}`} className={ghostBtn}>
                {t('profileStatusBanner.actions.contactSupport')}
              </a>
            )}
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div>
          <p className="font-semibold">{t('profileStatusBanner.rejected.title')}</p>
          {rejectionReason && (
            <p className="mt-1">{t('profileStatusBanner.rejected.reason', { reason: rejectionReason })}</p>
          )}
          <p className="mt-2">{t('profileStatusBanner.rejected.hint')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {onEdit && (
              <button type="button" onClick={onEdit} className={editBtnCls}>
                {t('profileStatusBanner.actions.editNow')}
              </button>
            )}
            {onOpenGuidelines && (
              <button type="button" onClick={onOpenGuidelines} className={ghostBtn}>
                {t('profileStatusBanner.actions.viewGuidelines')}
              </button>
            )}
            {supportEmail && (
              <a href={`mailto:${supportEmail}`} className={ghostBtn}>
                {t('profileStatusBanner.actions.contactSupport')}
              </a>
            )}
          </div>
        </div>
      )}

      {status === 'unsubmitted' && (
        <div>
          <p className="mb-2">{t('profileStatusBanner.unsubmitted.hint')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {onEdit && (
              <button type="button" onClick={onEdit} className={editBtnCls}>
                {t('profileStatusBanner.actions.startNow')}
              </button>
            )}
            {onOpenGuidelines && (
              <button type="button" onClick={onOpenGuidelines} className={ghostBtn}>
                {t('profileStatusBanner.actions.viewGuidelines')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
