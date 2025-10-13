// Calendar utility functions for date handling

export function toLocalDate(dateInput: Date | string): Date {
  if (typeof dateInput === 'string') {
    // Parse ISO date string to local date
    const date = new Date(dateInput);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }
  return new Date(dateInput);
}

export function formatISODate(date: Date): string {
  // Format date as ISO string (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoString: string): Date {
  // Parse ISO date string (YYYY-MM-DD) to Date object
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(date: Date, locale = 'en-US'): string {
  // Format date for display purposes
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(date: Date, locale = 'en-US'): string {
  // Format time for display purposes
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return formatISODate(date) === formatISODate(today);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatISODate(date1) === formatISODate(date2);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day;
  result.setDate(diff);
  return result;
}

export function endOfWeek(date: Date): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  return result;
}

export function getDateRange(startDate: Date, endDate: Date): Date[] {
  // Generate array of dates between start and end (inclusive)
  const dates: Date[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}