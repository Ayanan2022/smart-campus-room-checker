import { describe, it, expect } from 'vitest';
import { filterRooms } from '@/filters';
import { ROOMS, type Room } from '@/rooms';

describe('filterRooms', () => {
  describe('F1 — capacity', () => {
    it('includes a room when attendees exactly equal capacity', () => {
      // C-310 has capacity 12
      const result = filterRooms(ROOMS, 12, []);
      const ids = result.map((r) => r.id);
      expect(ids).toContain('C-310');
    });

    it('excludes a room when attendees are one more than capacity', () => {
      // C-310 has capacity 12 -> 13 should exclude it
      const result = filterRooms(ROOMS, 13, []);
      const ids = result.map((r) => r.id);
      expect(ids).not.toContain('C-310');
    });
  });

  describe('F2 — equipment', () => {
    it('requires both equipment items when two are specified', () => {
      // A-101 has [projector, whiteboard]; B-204 has [computers, projector];
      // D-015 has [projector, whiteboard, computers, microphone].
      // Requiring projector + whiteboard keeps A-101 and D-015, excludes B-204 and C-310.
      const result = filterRooms(ROOMS, 0, ['projector', 'whiteboard']);
      const ids = result.map((r) => r.id);
      expect(ids).toContain('A-101');
      expect(ids).toContain('D-015');
      expect(ids).not.toContain('B-204');
      expect(ids).not.toContain('C-310');
    });

    it('returns an empty array when no room matches the equipment', () => {
      const result = filterRooms(ROOMS, 0, ['stadium-seating']);
      expect(result).toEqual([]);
    });
  });

  describe('input integrity', () => {
    it('does not mutate the input array', () => {
      const input: Room[] = ROOMS.map((r) => ({ ...r, equipment: [...r.equipment], bookings: [...r.bookings] }));
      const snapshot = input.map((r) => ({ ...r, equipment: [...r.equipment], bookings: [...r.bookings] }));
      filterRooms(input, 20, ['projector']);
      expect(input).toEqual(snapshot);
      expect(input.length).toBe(snapshot.length);
    });
  });
});
