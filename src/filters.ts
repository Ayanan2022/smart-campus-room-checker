import type { Room } from '@/rooms';

// Pure filter. Does not mutate the input array.
// F1: keep rooms whose capacity is at least minCapacity.
// F2: keep rooms that contain every item in requiredEquipment.
// An empty filter (minCapacity 0, no equipment) keeps everything.
export function filterRooms(
  rooms: readonly Room[],
  minCapacity: number,
  requiredEquipment: readonly string[],
): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= minCapacity &&
      requiredEquipment.every((item) => room.equipment.includes(item)),
  );
}
