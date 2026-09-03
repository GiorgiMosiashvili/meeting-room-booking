"use client";

// მონაცემთა "ბაზა" = localStorage. აქ ხდება საწყისი შევსება (seed) და
// წაკითხვა/ჩაწერა. მხოლოდ ეს ფაილი და seed JSON-ები ეხებიან localStorage-ს.
// პირველ გაშვებაზე JSON-იდან ივსება localStorage; შემდეგ localStorage არის ჭეშმარიტების წყარო.

import type { Booking, SeedBooking } from "@/types/booking";
import type { Room } from "@/types/rooms";
import type { Employee } from "@/types/employee";

import roomsSeed from "@/data/rooms.json";
import employeesSeed from "@/data/employees.json";
import bookingsSeed from "@/data/bookings.json";

// localStorage-ის გასაღებები.
const KEYS = {
  rooms: "mrb.rooms",
  employees: "mrb.employees",
  bookings: "mrb.bookings",
  seededVersion: "mrb.seededVersion",
} as const;

// seed-ის ვერსია. გაზარდე, რომ ბრაუზერში ძველი მონაცემები თავიდან ჩაიწეროს.
const SEED_VERSION = 1;

// ვმუშაობთ თუ არა ბრაუზერში (SSR-ის დროს window არ არსებობს).
const isBrowser = () => typeof window !== "undefined";

// კითხულობს და აანალიზებს მნიშვნელობას localStorage-იდან; შეცდომაზე fallback.
function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    console.warn(`localStorage read failed for "${key}"`, e);
    return fallback;
  }
}

// წერს მნიშვნელობას localStorage-ში (ადგილის ამოწურვაზე მხოლოდ აფრთხილებს).
function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`localStorage write failed for "${key}"`, e);
  }
}

// seed-ჩანაწერს (dayOffset + საათები) აქცევს რეალურ ჯავშნად ISO თარიღებით.
function resolveSeedBooking(rec: SeedBooking): Booking {
  const base = new Date();
  base.setDate(base.getDate() + rec.dayOffset);

  const [sh, sm] = rec.startTime.split(":").map(Number);
  const [eh, em] = rec.endTime.split(":").map(Number);

  const start = new Date(base);
  start.setHours(sh, sm, 0, 0);

  const end = new Date(base);
  if (eh >= 24) {
    // "24:00" → მეორე დღის 00:00.
    end.setHours(eh - 24, em, 0, 0);
    end.setDate(end.getDate() + 1);
  } else {
    end.setHours(eh, em, 0, 0);
  }

  const nowIso = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    roomId: rec.roomId,
    title: rec.title,
    organizerId: rec.organizerId,
    attendeeIds: rec.attendeeIds ?? [],
    start: start.toISOString(),
    end: end.toISOString(),
    description: rec.description,
    status: rec.status ?? "confirmed",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

// პირველ გაშვებაზე (ან ვერსიის შეცვლაზე) ავსებს localStorage-ს საწყისი მონაცემებით.
function seedIfNeeded(): void {
  if (!isBrowser()) return;
  if (read<number | null>(KEYS.seededVersion, null) === SEED_VERSION) return;

  write(KEYS.rooms, roomsSeed as Room[]);
  write(KEYS.employees, employeesSeed as Employee[]);
  write(KEYS.bookings, (bookingsSeed as SeedBooking[]).map(resolveSeedBooking));
  write(KEYS.seededVersion, SEED_VERSION);
}

// ოთახების სია.
export function getRooms(): Room[] {
  seedIfNeeded();
  return read<Room[]>(KEYS.rooms, []);
}

// თანამშრომლების სია.
export function getEmployees(): Employee[] {
  seedIfNeeded();
  return read<Employee[]>(KEYS.employees, []);
}

// ჯავშნების სია.
export function getBookings(): Booking[] {
  seedIfNeeded();
  return read<Booking[]>(KEYS.bookings, []);
}

// ინახავს ჯავშნების განახლებულ სიას.
export function saveBookings(next: Booking[]): void {
  write(KEYS.bookings, next);
}

// შლის ყველა მონაცემს, შემდეგ წაკითხვა თავიდან seed-ს გააკეთებს.
export function resetDb(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
}
