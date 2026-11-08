# Room Availability

A room availability checker for a smart campus. Filter rooms by capacity and
equipment, select a matching room, and check whether a time window is free.
No booking is created — this is a read-only availability check.

## Setup

```bash
npm install
```

## Run the dev server

```bash
npm run dev
```

## Run the tests

```bash
npm test
```

## Build for production

```bash
npm run build
```

## Project structure

```
src/
├── App.tsx                 Root component: filters, room selector, time check
├── main.tsx                App entry point
├── index.css               Tailwind base styles
├── availability.ts         Pure booking rules: canBook, checkRoomAvailability
├── availability.test.ts    Unit tests for availability rules
├── rooms.ts                Room data (id, name, capacity, equipment, bookings)
├── filters.ts              Pure filter logic: filterRooms (capacity + equipment)
├── filters.test.ts         Unit tests for filter logic
├── App.test.tsx            Integration/UI tests (React Testing Library)
├── test-setup.ts           Vitest setup (jest-dom matchers)
├── components/
│   ├── Card.tsx            Reusable section card wrapper
│   ├── TimeField.tsx       Labeled time input (Start / End)
│   └── ResultBanner.tsx    Available / Unavailable result box
└── vite-env.d.ts           Vite type declarations
```

## How it works

1. **Filters** — Enter a number of attendees and check required equipment.
   `filterRooms()` keeps only rooms that meet both criteria.
2. **Room selection** — Matching rooms appear as selectable cards. Each shows
   name, capacity, equipment, and blocked status.
3. **Availability check** — Enter a start and end time (HH:MM, 24-hour).
   `checkRoomAvailability()` validates the time window against the selected
   room's own bookings and blocked status.
4. **Empty state** — When no rooms match the filters, a message appears and the
   check button is hidden.
