# Meeting Room Booking ( Next.js, TypeScript, TanStack Query, styled-components )

Welcome to my internal meeting room booking platform. This README walks through
the architecture, the features, and the decisions and trade-offs made while
building it.

## Overview

An internal web app for company employees to browse meeting rooms, check
availability, and manage bookings — with real conflict validation and state that
survives a page refresh. There is no backend: the initial data is loaded from
local JSON, but the whole app is structured as if that data came from a real API,
so the local source could be swapped for HTTP later without touching the UI.

The stack:

    Next.js 16 (App Router) for the frontend, routing, and server/client boundaries
    TanStack Query for server-state caching, loading/error states, and cache invalidation after mutations
    nuqs for typed URL search-param state — every filter and the schedule view/date live in the URL
    styled-components for styling, with an SSR style registry
    React Hook Form + Zod for the booking form and its validation
    date-fns for overlap maths, week boundaries, and formatting
    Vitest + Testing Library for unit and integration tests
    localStorage as the persistence layer, hidden behind the fake API

## Demo

Project is hosted on: _add your Vercel URL_

Repository: _add your GitHub URL_

## Running it

    npm install
    npm run dev        # http://localhost:3000
    npm run build      # production build, also type-checks
    npm run test:run   # unit + integration tests
    npm run lint
    npm run seed       # regenerate src/data/bookings.json

Node >= 22.13 (`.nvmrc` pins 22).

## UI & Styling

    styled-components: a design-token theme (src/styles/theme.ts) exposed through ThemeProvider, with a createGlobalStyle layer on top of a tiny globals.css reset. The SSR registry (src/lib/registry.tsx) flushes critical CSS into <head> so there is no flash of unstyled content.
    Hand-built primitives: no component library. src/components/ui.tsx holds Button, Input, Select, Card, Badge, Skeleton, Spinner, EmptyState, ErrorState, etc., so the styling stays consistent and small.
    Responsive: card grids collapse to a single column, the bookings table becomes stacked cards under 768px, the nav wraps on small screens, and the schedule grid scrolls inside its own container.

## Key Features

### Next.js as the frontend, no backend

    Server Components by default: each route's page.tsx is a Server Component that sets page metadata and wraps a Client "view" component in <Suspense>.
    Client Components where it counts: anything interactive — data hooks, filters, forms, the calendar grid, anything using styled-components — is a Client Component, and that boundary is deliberate.
    No Route Handlers: the fake API is client-side (see below), so there are no app/api routes.

### Data layer — structured like a real API

    The rule: a component never imports a .json file or touches localStorage. Those appear only inside src/data/.
    The path: component -> src/hooks/* (thin useQuery/useMutation wrappers) -> src/lib/api/* (functions that return Promises, add 300–600ms latency, can throw a typed ApiError, and do all filtering/sorting/validation) -> src/data/db.ts (seeds localStorage from JSON once, then read/write) -> localStorage.
    Swapping in a real API: rewrite the bodies of src/lib/api/* to call fetch(). The DTO types in src/types/* are explicit, so the hooks and UI do not change.

### Rooms

    A searchable, filterable list (name, minimum capacity, amenities, floor) — all filters reflected in the URL, so a filtered view is shareable and survives a refresh.
    A detail page per room with full info and that room's upcoming bookings.

### Calendar / Schedule

    A hand-built CSS-grid time grid (no calendar library). Day view puts rooms in columns; week view puts the seven days in columns for one selected room.
    Column headers and the hour column are sticky, and the grid scrolls inside a viewport-capped container, so the page itself never moves.
    Click an empty slot to start a booking prefilled with that room and time; click a booking block to open its detail. A red line marks the current time. Prev/next and "Today" navigate; the view and date are in the URL.

### Bookings

    Full CRUD: create, view, edit (upcoming only), and cancel (which sets status to cancelled and keeps the record).
    Validation is a set of pure functions in src/lib/booking-rules.ts — overlap detection, business-hours / grid / duration checks, and the editable-window rule — shared by the form and the fake API.
    The create/edit form runs those rules live as you type and explains exactly why a slot is invalid before you can submit; the API re-checks and is the backstop, with toasts on failure.

### Dashboard

    An at-a-glance view: rooms in use right now vs free, today's utilisation, bookings today, what's happening now, the next few bookings, and the busiest rooms this week.
    Every widget deep-links into the relevant filtered view (a room, the schedule for today, bookings filtered by room), which is the payoff of keeping state in the URL.

### URL as the source of truth

    All Rooms and Bookings filters, the Schedule view/date/room, and dashboard deep links are encoded in the URL via nuqs. Filter changes use router.replace so the back button is not polluted, and the search input is debounced before it writes.

## Development Workflow

### Seed data generation

    npm run seed runs a deterministic generator (scripts/generate-seed.mjs, seeded PRNG) that writes src/data/bookings.json — about 65 bookings spanning last week to two weeks ahead, with a mix of past, ongoing, future, and cancelled entries and no same-room overlaps.
    bookings.json stores day offsets and times, not absolute dates. db.ts resolves them to real timestamps the first time a browser seeds localStorage, so the deployed demo never goes stale no matter when a reviewer opens it.

### Tooling

    ESLint (next/core-web-vitals) + Prettier, wired up on day one; .gitattributes forces LF line endings.
    Vitest is configured with the threads pool (the default forks pool times out spawning workers on this machine's project drive).

## Challenges and Solutions

### The server/client component boundary

    Challenge: with the App Router, deciding what renders on the server vs the client, given the data can only live in the browser.
    Solution: route files stay Server Components for metadata and Suspense; a single Client "view" component per route owns all interactivity. Any client page that reads the URL via nuqs must be wrapped in <Suspense>, or the static prerender fails with "useSearchParams should be wrapped in a suspense boundary".

### Keeping the fake API believable

    Challenge: make "swap in a real API later" a genuine one-file change, not a rewrite.
    Solution: the api layer takes filter/sort/pagination as arguments and does that work itself, returns Promises with artificial latency, and throws a typed ApiError with a code (VALIDATION / NOT_FOUND / CONFLICT / NETWORK). Components only ever see the hook.

### The booking-detail modal (intercepting routes)

    Challenge: I built the detail view as an intercepting-route modal (@modal slot + (.)bookings/[bookingId]) so it overlays the list but is a full page on direct navigation. The [bookingId] dynamic segment also captured /bookings/new, so creating a booking showed "Booking 'new' not found".
    Solution: given the deadline, I removed the modal and made booking detail a plain full page. The clean fix would be to nest detail under /bookings/view/[id] so the dynamic segment can't shadow /new.

### Bookings that end at midnight

    Challenge: business hours run to 24:00, but midnight is 00:00 of the next day in JavaScript.
    Solution: the business-hours check accepts an end that is either same-day up to 23:59 or exactly next-day 00:00, and the seed resolver maps "24:00" to next-day midnight. This edge is covered by unit tests.

## Assumptions & Trade-offs

    Single office, local time — no timezone handling.
    Business hours 08:00–24:00; bookings start and end on the hour or half-hour.
    Duration 15 minutes to 8 hours (the 15-minute minimum is a separate check from the 30-minute grid so the grid can be relaxed later).
    A room cannot have two overlapping non-cancelled bookings.
    "Upcoming" means the start is in the future; only bookings that have not started can be edited or cancelled.
    Source-code comments are written in Georgian (author preference).
    FAILURE_RATE in src/lib/api/client.ts is 0 for the deploy — raise it to exercise the error UI.

## Known Issues / With More Time

    No dark theme (light only).
    The week view shows one room at a time; a room-by-day availability overview would be a good addition.
    Re-add the booking-detail modal under /bookings/view/[id].
    More component-level tests (render a list, apply a filter, assert the rows change); current tests cover the pure rules and the API/persistence layer.
    Drag-to-create on the calendar.

## Tests

    src/lib/booking-validation.test.ts — the overlap and time-rule functions (touching edges, containment, cancelled ignored, the midnight case, off-grid, past, duration bounds).
    src/lib/api/bookings.test.ts — integration through api -> db -> localStorage: create persists, overlap is rejected as CONFLICT, past is rejected as VALIDATION, cancel keeps the record, edit-after-start is refused, list filters work.
    src/lib/dashboard.test.ts — the dashboard aggregation helpers.
