import { useMemo, useState } from 'react';
import { Clock, DoorOpen, CheckCircle2, XCircle, ListChecks } from 'lucide-react';
import {
  canBook,
  minutesToHHMM,
  MAX_DURATION_MINUTES,
  parseTimeInputs,
  type AvailabilityResult,
  type Booking,
} from '@/availability';

const NOW = 540; // 09:00
const INITIAL_BOOKINGS: Booking[] = [{ start: 600, end: 660 }]; // 10:00-11:00

function emptyResult(): AvailabilityResult {
  return { available: false, reason: 'empty', message: '' };
}

export default function App() {
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<AvailabilityResult>(emptyResult);
  const [submitted, setSubmitted] = useState(false);

  const bookings = INITIAL_BOOKINGS;

  const handleCheck = () => {
    setSubmitted(true);
    const parsed = parseTimeInputs(startInput, endInput);
    if ('available' in parsed) {
      setResult(parsed);
      return;
    }
    setResult(canBook(parsed.start, parsed.end, NOW, blocked, bookings));
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-6">
          <div className="flex items-center gap-2 text-slate-700">
            <DoorOpen className="h-5 w-5" aria-hidden />
            <span className="text-sm font-medium uppercase tracking-wide">Smart Campus</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">Room A-101 Availability</h1>
          <p className="mt-2 text-sm text-slate-600">
            Check whether Room A-101 is free for a time window. No booking is created.
          </p>
        </header>

        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Clock className="h-4 w-4" aria-hidden />
            <span>Current time: <strong>{minutesToHHMM(NOW)}</strong></span>
          </div>

          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="text-sm font-medium text-slate-800">Room is blocked</span>
            <span className="sr-only">Toggle whether the room is blocked</span>
            <input
              type="checkbox"
              className="peer sr-only"
              checked={blocked}
              onChange={(e) => setBlocked(e.target.checked)}
            />
            <span
              className="relative h-6 w-11 flex-shrink-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-rose-500"
              aria-hidden
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  blocked ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </label>
        </section>

        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ListChecks className="h-4 w-4" aria-hidden />
            Existing bookings
          </h2>
          <ul className="space-y-1.5">
            {bookings.map((b, i) => (
              <li
                key={`${b.start}-${b.end}-${i}`}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="text-slate-700">Booking {i + 1}</span>
                <span className="font-mono text-slate-900">{minutesToHHMM(b.start)}–{minutesToHHMM(b.end)}</span>
              </li>
            ))}
          </ul>
        </section>

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
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 active:bg-blue-800"
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

        <footer className="mt-6 text-center text-xs text-slate-400">
          Availability check only — no booking is created or stored.
        </footer>
      </div>
    </div>
  );
}
