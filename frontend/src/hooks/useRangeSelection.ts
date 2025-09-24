

import { useCallback, useMemo, useState } from "react";

export type UseRangeSelectionOptions = {
  /** Prevent selecting dates before this (e.g., startOfToday) */
  disabledBefore?: Date | null;
  /** Notify whenever the selection changes */
  onChange?: (start: Date | null, end: Date | null) => void;
};

export type UseRangeSelection = {
  rangeStart: Date | null;
  rangeEnd: Date | null;
  /** sets start (normalizes time to midnight) */
  setRangeStart: (d: Date | null) => void;
  /** sets end (normalizes time to midnight) */
  setRangeEnd: (d: Date | null) => void;
  /** clear selection */
  resetRange: () => void;
  /** click handler you can pass to the calendar */
  handleDayClick: (date: Date) => void;
};

function stripTime(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBefore(a: Date, b: Date) {
  return stripTime(a).getTime() < stripTime(b).getTime();
}

/**
 * Hook to manage a simple two-click range selection
 * Behavior:
 *  - 1st click sets start
 *  - 2nd click sets end (if before start, it swaps so start <= end)
 *  - 3rd click starts a new range beginning at the clicked day
 *  - clicking the same day twice makes a 1-day range (start === end)
 */
export function useRangeSelection(options: UseRangeSelectionOptions = {}): UseRangeSelection {
  const { disabledBefore = null, onChange } = options;

  const [rangeStart, _setStart] = useState<Date | null>(null);
  const [rangeEnd, _setEnd] = useState<Date | null>(null);

  const setRangeStart = useCallback((d: Date | null) => {
    const v = d ? stripTime(d) : null;
    _setStart(v);
    if (onChange) onChange(v, rangeEnd);
  }, [onChange, rangeEnd]);

  const setRangeEnd = useCallback((d: Date | null) => {
    const v = d ? stripTime(d) : null;
    _setEnd(v);
    if (onChange) onChange(rangeStart, v);
  }, [onChange, rangeStart]);

  const resetRange = useCallback(() => {
    _setStart(null);
    _setEnd(null);
    if (onChange) onChange(null, null);
  }, [onChange]);

  const handleDayClick = useCallback((day: Date) => {
    const date = stripTime(day);

    // guard: ignore disabled dates
    if (disabledBefore && isBefore(date, disabledBefore)) return;

    // no start yet → set start
    if (!rangeStart && !rangeEnd) {
      setRangeStart(date);
      return;
    }

    // start set, end not set → set end (normalize order, allow same-day range)
    if (rangeStart && !rangeEnd) {
      if (isSameDay(date, rangeStart)) {
        setRangeEnd(rangeStart); // 1-day range
        return;
      }
      if (isBefore(date, rangeStart)) {
        // swap so start <= end
        _setEnd(rangeStart);
        _setStart(date);
        if (onChange) onChange(date, rangeStart);
        return;
      }
      setRangeEnd(date);
      return;
    }

    // both set → start a new selection beginning at clicked date
    _setStart(date);
    _setEnd(null);
    if (onChange) onChange(date, null);
  }, [disabledBefore, onChange, rangeStart, rangeEnd, setRangeStart, setRangeEnd]);

  // memoize return to keep referential stability in consumers
  return useMemo(() => ({
    rangeStart,
    rangeEnd,
    setRangeStart,
    setRangeEnd,
    resetRange,
    handleDayClick,
  }), [rangeStart, rangeEnd, setRangeStart, setRangeEnd, resetRange, handleDayClick]);
}

export default useRangeSelection;