// ჯავშნის "საჩვენებელი" სტატუსი (status ველისგან განსხვავებით, დროზეც აგებული).
// გამოიყენება რაოდენობების დათვლასა და სიის დალაგებაში.
import { parseISO } from "date-fns";
import type { Booking } from "@/types/booking";

export type DisplayStatus = "confirmed" | "past" | "cancelled";

export function classifyBooking(
  b: Booking,
  now: Date = new Date(),
): DisplayStatus {
  if (b.status === "cancelled") return "cancelled";
  if (parseISO(b.end) <= now) return "past";
  return "confirmed";
}

// თითო ოთახზე რაოდენობები (confirmed/past/cancelled) — ფილტრის ინდიკატორისთვის.
export function countsByRoom(
  bookings: Booking[],
): Record<string, Record<DisplayStatus, number>> {
  const out: Record<string, Record<DisplayStatus, number>> = {};
  for (const b of bookings) {
    const bucket = (out[b.roomId] ??= { confirmed: 0, past: 0, cancelled: 0 });
    bucket[classifyBooking(b)]++;
  }
  return out;
}
