import { useState, useCallback } from 'react';

interface UseRangeSelectionOptions {
  disabledBefore?: Date;
}

interface UseRangeSelectionReturn {
  rangeStart: Date | null;
  rangeEnd: Date | null;
  setRangeStart: (date: Date | null) => void;
  setRangeEnd: (date: Date | null) => void;
  handleDayClick: (date: Date) => void;
}

const useRangeSelection = (options: UseRangeSelectionOptions = {}): UseRangeSelectionReturn => {
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const handleDayClick = useCallback((date: Date) => {
    // Check if date is disabled
    if (options.disabledBefore && date < options.disabledBefore) {
      return;
    }

    // If no range start, set it
    if (!rangeStart) {
      setRangeStart(date);
      setRangeEnd(null);
      return;
    }

    // If range start exists but no end, set end
    if (rangeStart && !rangeEnd) {
      // Ensure end is after start
      if (date >= rangeStart) {
        setRangeEnd(date);
      } else {
        // If clicking before start, reset and use as new start
        setRangeStart(date);
        setRangeEnd(null);
      }
      return;
    }

    // If both start and end exist, reset and start new selection
    setRangeStart(date);
    setRangeEnd(null);
  }, [rangeStart, rangeEnd, options.disabledBefore]);

  return {
    rangeStart,
    rangeEnd,
    setRangeStart,
    setRangeEnd,
    handleDayClick,
  };
};

export default useRangeSelection;