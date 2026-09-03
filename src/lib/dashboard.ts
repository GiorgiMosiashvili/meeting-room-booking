// დაშბორდის სუფთა დამხმარეები (გამოთვლა, არა UI). იტესტება ცალკე.
import { isSameDay, parseISO } from "date-fns";
import type { Booking } from "@/types/booking";
import { BUSINESS_END_MIN, BUSINESS_START_MIN } from "@/lib/booking-rules";

const BUSINESS_MIN_PER_DAY = BUSINESS_END_MIN - BUSINESS_START_MIN; // 960

// გაუქმებულის გარეშე.
export const liveBookings = (bookings: Booking[]) =>
  bookings.filter((b) => b.status !== "cancelled");

// ოთახების id-ები, სადაც ახლა მიმდინარეობს შეხვედრა.
export function roomIdsInUse(
  bookings: Booking[],
  now: Date = new Date(),
): Set<string> {
  const ids = new Set<string>();
  for (const b of liveBookings(bookings)) {
    if (parseISO(b.start) <= now && now < parseISO(b.end)) ids.add(b.roomId);
  }
  return ids;
}

// ერთი დღის დაჯავშნილი წუთები, სამუშაო ფანჯარაში ჩამოჭრილი.
export function bookedMinutesOnDay(bookings: Booking[], day: Date): number {
  let total = 0;
  for (const b of liveBookings(bookings)) {
    const s = parseISO(b.start);
    const e = parseISO(b.end);
    if (!isSameDay(s, day)) continue;
    const startMin = Math.max(
      BUSINESS_START_MIN,
      s.getHours() * 60 + s.getMinutes(),
    );
    const endMin = isSameDay(e, day)
      ? Math.min(BUSINESS_END_MIN, e.getHours() * 60 + e.getMinutes())
      : BUSINESS_END_MIN;
    total += Math.max(0, endMin - startMin);
  }
  return total;
}

// დღის დატვირთვა პროცენტში (0–100).
export function utilisationPct(
  bookings: Booking[],
  roomCount: number,
  day: Date,
): number {
  const capacity = roomCount * BUSINESS_MIN_PER_DAY;
  if (capacity === 0) return 0;
  return Math.round((bookedMinutesOnDay(bookings, day) / capacity) * 100);
}

// ჯავშნების რაოდენობა თითო ოთახზე (რანჟირებისთვის).
export function bookingCountByRoom(
  bookings: Booking[],
): Record<string, number> {
  const m: Record<string, number> = {};
  for (const b of liveBookings(bookings)) {
    m[b.roomId] = (m[b.roomId] ?? 0) + 1;
  }
  return m;
}

// მომავალი ჯავშნები, დროის მიხედვით დალაგებული.
export function upcoming(
  bookings: Booking[],
  now: Date = new Date(),
  limit = 5,
): Booking[] {
  return liveBookings(bookings)
    .filter((b) => parseISO(b.start) > now)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, limit);
}
