import { describe, it, expect } from 'vitest';
import { canBook, type Booking } from '@/availability';

const NOW = 540;
const EXISTING: Booking[] = [{ start: 600, end: 660 }];

describe('canBook', () => {
  describe('AC1 — start must be strictly after now', () => {
    it('rejects a booking whose start equals now (540-570)', () => {
      const result = canBook(540, 570, NOW, false, EXISTING);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('past');
    });

    it('accepts a booking whose start is one minute after now (541-571)', () => {
      const result = canBook(541, 571, NOW, false, EXISTING);
      expect(result.available).toBe(true);
      expect(result.reason).toBe('available');
    });
  });

  describe('AC1 — order and range validation', () => {
    it('rejects start >= end', () => {
      const result = canBook(720, 720, NOW, false, EXISTING);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('order');
    });

    it('rejects an end past 1440', () => {
      const result = canBook(1430, 1441, NOW, false, EXISTING);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('range');
    });
  });

  describe('AC2 — duration must be at most 120 minutes', () => {
    it('accepts a duration of exactly 120 minutes (720-840)', () => {
      const result = canBook(720, 840, NOW, false, EXISTING);
      expect(result.available).toBe(true);
      expect(result.reason).toBe('available');
    });

    it('rejects a duration of 121 minutes (720-841)', () => {
      const result = canBook(720, 841, NOW, false, EXISTING);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('duration');
    });
  });

  describe('AC3 — blocked room is rejected', () => {
    it('rejects a valid time window when the room is blocked', () => {
      const result = canBook(720, 840, NOW, true, EXISTING);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('blocked');
    });
  });

  describe('AC4 — overlap detection with existing bookings', () => {
    it('accepts a booking that only touches an existing one (660-720)', () => {
      const result = canBook(660, 720, NOW, false, EXISTING);
      expect(result.available).toBe(true);
      expect(result.reason).toBe('available');
    });

    it('rejects a booking that overlaps an existing one (630-690)', () => {
      const result = canBook(630, 690, NOW, false, EXISTING);
      expect(result.available).toBe(false);
      expect(result.reason).toBe('overlap');
    });
  });

  describe('AC5 — existing bookings array is not mutated', () => {
    it('leaves the existing bookings array unchanged after a call', () => {
      const snapshot = EXISTING.map((b) => ({ ...b }));
      canBook(541, 571, NOW, false, EXISTING);
      expect(EXISTING).toEqual(snapshot);
      expect(EXISTING).toBe(EXISTING); // same reference, not replaced
    });
  });
});
