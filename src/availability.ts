export interface Booking {
  start: number;
  end: number;
}

export type AvailabilityReason =
  | 'empty'
  | 'bad-format'
  | 'order'
  | 'range'
  | 'past'
  | 'duration'
  | 'blocked'
  | 'overlap'
  | 'available';

export interface AvailabilityResult {
  available: boolean;
  reason: AvailabilityReason;
  message: string;
}

export const MAX_DURATION_MINUTES = 120;
export const END_OF_DAY = 1440;

export function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseHHMM(value: string): number | null {
  const trimmed = value.trim();
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h * 60 + m;
}

export function parseHHMMWith2400(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '24:00') return END_OF_DAY;
  return parseHHMM(trimmed);
}

export type ParsedTimes = { start: number; end: number };
export type ParseResult = ParsedTimes | AvailabilityResult;

// Single source of truth for empty/format validation of raw text inputs.
export function parseTimeInputs(
  startInput: string,
  endInput: string,
): ParseResult {
  if (startInput.trim() === '' || endInput.trim() === '') {
    return { available: false, reason: 'empty', message: 'Please enter both a start time and an end time.' };
  }
  const start = parseHHMMWith2400(startInput);
  const end = parseHHMMWith2400(endInput);
  if (start === null || end === null) {
    return { available: false, reason: 'bad-format', message: 'Times must be in HH:MM format (e.g. 09:30).' };
  }
  return { start, end };
}

// Pure rule function. Does not mutate inputs.
export function canBook(
  start: number,
  end: number,
  now: number,
  blocked: boolean,
  existing: readonly Booking[]
): AvailabilityResult {
  if (start < 0 || end > END_OF_DAY) {
    return { available: false, reason: 'range', message: 'Times must be within 00:00-24:00.' };
  }
  if (start >= end) {
    return { available: false, reason: 'order', message: 'End time must be after start time.' };
  }
  if (start <= now) {
    return { available: false, reason: 'past', message: `Start must be after ${minutesToHHMM(now)} (current time).` };
  }
  const duration = end - start;
  if (duration > MAX_DURATION_MINUTES) {
    return { available: false, reason: 'duration', message: `Duration must be ${MAX_DURATION_MINUTES} minutes or less (you entered ${duration} minutes).` };
  }
  if (blocked) {
    return { available: false, reason: 'blocked', message: 'Room is currently blocked and cannot be booked.' };
  }
  for (const b of existing) {
    if (start < b.end && b.start < end) {
      return {
        available: false,
        reason: 'overlap',
        message: `Overlaps existing booking ${minutesToHHMM(b.start)}-${minutesToHHMM(b.end)}.`,
      };
    }
  }
  return { available: true, reason: 'available', message: 'The room is available for this time.' };
}
