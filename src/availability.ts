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
  if (trimmed === '24:00') return 1440;
  return parseHHMM(trimmed);
}

// Pure rule function. Does not mutate inputs.
export function canBook(
  start: number,
  end: number,
  now: number,
  blocked: boolean,
  existing: readonly Booking[]
): AvailabilityResult {
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return { available: false, reason: 'bad-format', message: 'Enter valid times in HH:MM format.' };
  }
  if (start < 0 || end > 1440) {
    return { available: false, reason: 'range', message: 'Times must be within 00:00-24:00.' };
  }
  if (start >= end) {
    return { available: false, reason: 'order', message: 'End time must be after start time.' };
  }
  if (start <= now) {
    return { available: false, reason: 'past', message: `Start must be after ${minutesToHHMM(now)} (current time).` };
  }
  if (end - start > MAX_DURATION_MINUTES) {
    return { available: false, reason: 'duration', message: `Duration must be 120 minutes or less (you entered ${end - start} minutes).` };
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
  return { available: true, reason: 'available', message: 'Room A-101 is available for this time.' };
}
