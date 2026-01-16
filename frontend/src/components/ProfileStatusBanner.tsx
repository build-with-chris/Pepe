import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, Clock, XCircle, AlertCircle, Pencil, ExternalLink } from "lucide-react";

interface ProfileStatusBannerProps {
  status: 'approved' | 'pending' | 'rejected' | 'unsubmitted';
  rejectionReason?: string | null;
  className?: string;
  onEdit?: () => void;
  onOpenGuidelines?: () => void;
  supportEmail?: string;
}

export function ProfileStatusBanner({
  status,
  rejectionReason,
  className = "",
  onEdit,
  onOpenGuidelines,
  supportEmail = "info@pepeshows.de"
}: ProfileStatusBannerProps) {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-700',
          textColor: 'text-green-300',
          title: 'Profile Approved',
          message: 'Your profile has been approved and is now visible to clients.'
        };
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-700',
          textColor: 'text-yellow-300',
          title: 'Profile Under Review',
          message: t('profileStatusBanner.pending.info')
        };
      case 'rejected':
        return {
          icon: XCircle,
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-700',
          textColor: 'text-red-300',
          title: t('profileStatusBanner.rejected.title'),
          message: t('profileStatusBanner.rejected.hint')
        };
      case 'unsubmitted':
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-700',
          textColor: 'text-gray-300',
          title: 'Complete Your Profile',
          message: t('profileStatusBanner.unsubmitted.hint')
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.textColor}`} />
        <div className="flex-1">
          <h3 className={`font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          <p className={`mt-1 text-sm ${config.textColor.replace('300', '200')}`}>
            {config.message}
          </p>
          
          {status === 'rejected' && rejectionReason && (
            <div className="mt-3 p-3 bg-red-950/50 border border-red-800/50 rounded">
              <p className="text-sm font-medium text-red-200">
                Reason:
              </p>
              <p className="text-sm text-red-300 mt-1">
                {rejectionReason}
              </p>
            </div>
          )}

          {status === 'rejected' && (
            <div className="mt-3 flex flex-wrap gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-800/30 hover:bg-red-800/50 border border-red-700/50 text-red-200 text-sm rounded transition"
                >
                  <Pencil className="w-4 h-4" />
                  {t('profileStatusBanner.actions.editNow')}
                </button>
              )}
              {onOpenGuidelines && (
                <button
                  onClick={onOpenGuidelines}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 text-gray-200 text-sm rounded transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('profileStatusBanner.actions.viewGuidelines')}
                </button>
              )}
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 text-gray-200 text-sm rounded transition"
              >
                <ExternalLink className="w-4 h-4" />
                {t('profileStatusBanner.actions.contactSupport')}
              </a>
            </div>
          )}

          {status === 'unsubmitted' && (
            <div className="mt-3 text-sm text-gray-400">
              <p>{t('profileStatusBanner.actions.startNow')}</p>
            </div>
          )}

          {status === 'pending' && (
            <div className="mt-3 text-sm text-yellow-400">
              <p>We will notify you once the review is complete.</p>
            </div>
          )}

          {status === 'approved' && (
            <div className="mt-3 text-sm text-green-400">
              <p>You can continue to update your profile as needed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}