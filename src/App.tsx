import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  DoorOpen,
  ListChecks,
  Users,
  Monitor,
  Building2,
  SearchX,
} from 'lucide-react';
import {
  checkRoomAvailability,
  minutesToHHMM,
  parseTimeInputs,
  MAX_DURATION_MINUTES,
  type AvailabilityResult,
} from '@/availability';
import { ROOMS, CURRENT_TIME, ALL_EQUIPMENT, type Room } from '@/rooms';
import { filterRooms } from '@/filters';
import { Card } from '@/components/Card';
import { TimeField } from '@/components/TimeField';
import { ResultBanner } from '@/components/ResultBanner';

const NOW = CURRENT_TIME;

function emptyResult(): AvailabilityResult {
  return { available: false, reason: 'empty', message: '' };
}

export default function App() {
  const [attendees, setAttendees] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS[0]?.id ?? '');
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [result, setResult] = useState<AvailabilityResult>(emptyResult);
  const [submitted, setSubmitted] = useState(false);

  const minCapacity = Number(attendees) || 0;
  const matchingRooms = useMemo(
    () => filterRooms(ROOMS, minCapacity, selectedEquipment),
    [minCapacity, selectedEquipment],
  );

  const matchingIds = useMemo(
    () => new Set(matchingRooms.map((r) => r.id)),
    [matchingRooms],
  );

  // F5: if the selected room is filtered out, clear the selection + old result.
  useEffect(() => {
    if (!matchingIds.has(selectedRoomId)) {
      setSelectedRoomId(matchingRooms[0]?.id ?? '');
      setResult(emptyResult());
      setSubmitted(false);
    }
  }, [matchingIds, selectedRoomId, matchingRooms]);

  const selectedRoom: Room | undefined = useMemo(
    () => matchingRooms.find((r) => r.id === selectedRoomId),
    [matchingRooms, selectedRoomId],
  );

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item],
    );
  };

  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setResult(emptyResult());
    setSubmitted(false);
  };

  const handleCheck = () => {
    if (!selectedRoom) return;
    setSubmitted(true);
    const parsed = parseTimeInputs(startInput, endInput);
    if ('available' in parsed) {
      setResult(parsed);
      return;
    }
    setResult(
      checkRoomAvailability(selectedRoom, parsed.start, parsed.end, NOW),
    );
  };

  const handleReset = () => {
    setStartInput('');
    setEndInput('');
    setSubmitted(false);
    setResult(emptyResult());
  };

  const noRooms = matchingRooms.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-slate-700">
            <DoorOpen className="h-5 w-5" aria-hidden />
            <span className="text-sm font-medium uppercase tracking-wide">Smart Campus</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">Room Availability</h1>
          <p className="mt-2 text-sm text-slate-600">
            Find a free room and check whether it&apos;s available for a time window. No booking is created.
          </p>
        </header>

        {/* Current time */}
        <Card>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Clock className="h-4 w-4 flex-shrink-0" aria-hidden />
            <span>Current time: <strong>{minutesToHHMM(NOW)}</strong></span>
          </div>
        </Card>

        {/* Filters */}
        <Card title="Requirements" icon={<Users className="h-4 w-4 flex-shrink-0" aria-hidden />}>
          <div>
            <label htmlFor="attendees" className="mb-1 block text-sm font-medium text-slate-700">
              Number of attendees
            </label>
            <input
              id="attendees"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="e.g. 15"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <fieldset className="mt-4">
            <legend className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Monitor className="h-4 w-4 flex-shrink-0" aria-hidden />
              Equipment
            </legend>
            <div className="flex flex-wrap gap-2">
              {ALL_EQUIPMENT.map((item) => {
                const checked = selectedEquipment.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      checked
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={checked}
                      onChange={() => toggleEquipment(item)}
                    />
                    <span
                      className={`h-4 w-4 flex-shrink-0 rounded border transition-colors ${
                        checked
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300 bg-white'
                      }`}
                      aria-hidden
                    />
                    <span className="capitalize">{item}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </Card>

        {noRooms ? (
          /* F4: empty state */
          <Card>
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <SearchX className="h-8 w-8 text-slate-400" aria-hidden />
              <p className="text-sm text-slate-600">
                No rooms match your requirements. Try fewer attendees or less equipment.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Room selector */}
            <Card title="Select a room" icon={<Building2 className="h-4 w-4 flex-shrink-0" aria-hidden />}>
              <div className="space-y-2">
                {matchingRooms.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  return (
                    <label
                      key={room.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="room"
                        className="peer sr-only"
                        checked={isSelected}
                        onChange={() => selectRoom(room.id)}
                      />
                      <span
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2 transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                        }`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{room.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Capacity {room.capacity}
                          {room.blocked ? ' · Blocked' : ''}
                        </p>
                        {room.equipment.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {room.equipment.map((eq) => (
                              <span
                                key={eq}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] capitalize text-slate-600"
                              >
                                {eq}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>

            {/* Selected room bookings */}
            {selectedRoom && (
              <Card
                title={`Existing bookings — ${selectedRoom.name}`}
                icon={<ListChecks className="h-4 w-4 flex-shrink-0" aria-hidden />}
              >
                {selectedRoom.bookings.length === 0 ? (
                  <p className="text-sm text-slate-500">No existing bookings.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {selectedRoom.bookings.map((b, i) => (
                      <li
                        key={`${b.start}-${b.end}-${i}`}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                      >
                        <span className="text-slate-700">Booking {i + 1}</span>
                        <span className="font-mono text-slate-900">{minutesToHHMM(b.start)}–{minutesToHHMM(b.end)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {/* Time window check */}
            <Card title="Check a time window" className="">
              <div className="space-y-3">
                <TimeField
                  id="start-time"
                  label="Start time (HH:MM)"
                  placeholder="e.g. 11:00"
                  value={startInput}
                  onChange={setStartInput}
                />

                <TimeField
                  id="end-time"
                  label="End time (HH:MM)"
                  placeholder="e.g. 12:00"
                  value={endInput}
                  onChange={setEndInput}
                />

                <p className="text-xs text-slate-500">
                  Max {MAX_DURATION_MINUTES} minutes. Start must be after {minutesToHHMM(NOW)}. Use 24:00 for end of day.
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCheck}
                    disabled={!selectedRoom}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Check availability
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-slate-300 px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <ResultBanner result={result} submitted={submitted} />
            </Card>
          </>
        )}

        <footer className="mt-6 text-center text-xs text-slate-400">
          Availability check only — no booking is created or stored.
        </footer>
      </div>
    </div>
  );
}
