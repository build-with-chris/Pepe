import * as React from "react";
import { useTranslation, Trans } from "react-i18next";
import type { AvailabilitySlot } from "@/services/availabilityApi";
import { toLocalDate, formatISODate, getDateRange } from "@/utils/calendar";

type RangeActionsPanelProps = {
  rangeStart: Date | null;
  rangeEnd: Date | null;
  setRangeStart: (d: Date | null) => void;
  setRangeEnd: (d: Date | null) => void;
  processingRange: boolean;
  setProcessingRange: (v: boolean) => void;
  available: AvailabilitySlot[];
  addAvailability: (date: Date) => Promise<void>;
  removeAvailability: (slot: AvailabilitySlot) => Promise<void>;
};

const RangeActionsPanel: React.FC<RangeActionsPanelProps> = ({
  rangeStart,
  rangeEnd,
  setRangeStart,
  setRangeEnd,
  processingRange,
  setProcessingRange,
  available,
  addAvailability,
  removeAvailability,
}) => {
  const { t } = useTranslation();

  if (!rangeStart && !rangeEnd) return null;

  // nur Start ausgewählt
  if (rangeStart && !rangeEnd) {
    return (
      <div className="mx-auto w-full max-w-[28rem] md:max-w-[36rem] mb-3 p-3 border border-white/30 rounded bg-transparent text-white flex items-center justify-between gap-2">
        <div><strong>{t('calendar.range.selectEnd')}</strong></div>
        <button
          className="underline text-sm"
          onClick={() => { setRangeStart(null); setRangeEnd(null); }}
        >
          {t('calendar.range.cancel')}
        </button>
      </div>
    );
  }

  // Start + Ende ausgewählt
  if (rangeStart && rangeEnd) {
    const datesInRange = getDateRange(rangeStart, rangeEnd);
    const isoRange = datesInRange.map(d => formatISODate(d));
    const availableInRange = isoRange.filter(d => (available ?? []).some(s => s.date === d));
    const allAvailable = availableInRange.length === isoRange.length;
    const noneAvailable = availableInRange.length === 0;
    const start = rangeStart.toLocaleDateString();
    const end = rangeEnd.toLocaleDateString();

    return (
      <div className="mx-auto w-full max-w-[28rem] md:max-w-[36rem] mb-3 p-3 border border-white/30 rounded bg-transparent text-white flex flex-col gap-2">
        <div>
          <Trans i18nKey="calendar.range.selected" values={{ start, end }} components={{ strong: <strong /> }} />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {allAvailable && (
            <button
              className="px-3 py-1 bg-red-600 rounded"
              disabled={processingRange}
              onClick={async () => {
                setProcessingRange(true);
                try {
                  for (const iso of isoRange) {
                    const slot = (available ?? []).find(s => s.date === iso);
                    if (slot) await removeAvailability(slot);
                  }
                } finally {
                  setProcessingRange(false);
                  setRangeStart(null);
                  setRangeEnd(null);
                }
              }}
            >
              {t('calendar.range.deleteForRange', { start, end })}
            </button>
          )}

          {noneAvailable && (
            <button
              className="px-3 py-1 bg-green-600 rounded"
              disabled={processingRange}
              onClick={async () => {
                setProcessingRange(true);
                try {
                  for (const iso of isoRange) {
                    await addAvailability(toLocalDate(iso) as Date);
                  }
                } finally {
                  setProcessingRange(false);
                  setRangeStart(null);
                  setRangeEnd(null);
                }
              }}
            >
              {t('calendar.range.addForRange', { start, end })}
            </button>
          )}

          {!allAvailable && !noneAvailable && (
            <>
              <button
                className="px-3 py-1 bg-green-600 rounded"
                disabled={processingRange}
                onClick={async () => {
                  setProcessingRange(true);
                  try {
                    for (const iso of isoRange) {
                      if (!(available ?? []).some(s => s.date === iso)) {
                        await addAvailability(toLocalDate(iso) as Date);
                      }
                    }
                  } finally {
                    setProcessingRange(false);
                    setRangeStart(null);
                    setRangeEnd(null);
                  }
                }}
              >
                {t('calendar.range.setAllAvailable')}
              </button>

              <button
                className="px-3 py-1 bg-red-600 rounded"
                disabled={processingRange}
                onClick={async () => {
                  setProcessingRange(true);
                  try {
                    for (const iso of isoRange) {
                      const slot = (available ?? []).find(s => s.date === iso);
                      if (slot) await removeAvailability(slot);
                    }
                  } finally {
                    setProcessingRange(false);
                    setRangeStart(null);
                    setRangeEnd(null);
                  }
                }}
              >
                {t('calendar.range.removeAll')}
              </button>
            </>
          )}

          <button
            className="ml-auto underline text-sm"
            onClick={() => { setRangeStart(null); setRangeEnd(null); }}
          >
            {t('calendar.range.cancel')}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default RangeActionsPanel;