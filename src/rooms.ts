import type { Booking } from '@/availability';

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly equipment: readonly string[];
  readonly blocked: boolean;
  readonly bookings: readonly Booking[];
}

export const ROOMS: readonly Room[] = [
  {
    id: 'A-101',
    name: 'Lecture Room A-101',
    capacity: 30,
    equipment: ['projector', 'whiteboard'],
    blocked: false,
    bookings: [{ start: 600, end: 660 }],
  },
  {
    id: 'B-204',
    name: 'Computer Lab B-204',
    capacity: 20,
    equipment: ['computers', 'projector'],
    blocked: false,
    bookings: [{ start: 720, end: 780 }],
  },
  {
    id: 'C-310',
    name: 'Seminar Room C-310',
    capacity: 12,
    equipment: ['whiteboard'],
    blocked: false,
    bookings: [{ start: 840, end: 900 }],
  },
  {
    id: 'D-015',
    name: 'Workshop Room D-015',
    capacity: 40,
    equipment: ['projector', 'whiteboard', 'computers', 'microphone'],
    blocked: true,
    bookings: [{ start: 660, end: 720 }],
  },
] as const;

export const CURRENT_TIME = 540;

export const ALL_EQUIPMENT: readonly string[] = [
  ...new Set(ROOMS.flatMap((room) => room.equipment)),
] as readonly string[];
