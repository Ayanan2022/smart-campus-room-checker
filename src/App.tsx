import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  DoorOpen,
  CheckCircle2,
  XCircle,
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

  const resultStyles = useMemo(() => {
    if (!submitted) return null;
    if (result.available) {
      return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    }
    return 'bg-rose-50 border-rose-200 text-rose-900';
  }, [submitted, result]);

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
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Clock className="h-4 w-4 flex-shrink-0" aria-hidden />
            <span>Current time: <strong>{minutesToHHMM(NOW)}</strong></span>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="h-4 w-4 flex-shrink-0" aria-hidden />
            Requirements
          </h2>

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
        </section>

        {noRooms ? (
          /* F4: empty state */
          <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <SearchX className="h-8 w-8 text-slate-400" aria-hidden />
              <p className="text-sm text-slate-600">
                No rooms match your requirements. Try fewer attendees or less equipment.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Room selector */}
            <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Building2 className="h-4 w-4 flex-shrink-0" aria-hidden />
                Select a room
              </h2>
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
                        onChange={() => {
                          setSelectedRoomId(room.id);
                          setResult(emptyResult());
                          setSubmitted(false);
                        }}
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
            </section>

            {/* Selected room bookings */}
            {selectedRoom && (
              <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ListChecks className="h-4 w-4 flex-shrink-0" aria-hidden />
                  Existing bookings — {selectedRoom.name}
                </h2>
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
              </section>
            )}

            {/* Time window check */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Check a time window</h2>

              <div className="space-y-3">
                <div>
                  <label htmlFor="start-time" className="mb-1 block text-sm font-medium text-slate-700">
                    Start time (HH:MM)
                  </label>
                  <input
                    id="start-time"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 11:00"
                    value={startInput}
                    onChange={(e) => setStartInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label htmlFor="end-time" className="mb-1 block text-sm font-medium text-slate-700">
                    End time (HH:MM)
                  </label>
                  <input
                    id="end-time"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 12:00"
                    value={endInput}
                    onChange={(e) => setEndInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

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

              {submitted && (
                <div
                  role="status"
                  className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-3 text-sm ${resultStyles ?? ''}`}
                >
                  {result.available ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" aria-hidden />
                  )}
                  <div>
                    <p className="font-semibold">
                      {result.available ? 'Available' : 'Unavailable'}
                    </p>
                    <p className="mt-0.5">{result.message}</p>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        <footer className="mt-6 text-center text-xs text-slate-400">
          Availability check only — no booking is created or stored.
        </footer>
      </div>
    </div>
  );
}
