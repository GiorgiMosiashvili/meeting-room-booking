// ჯავშნის წესები — სუფთა ფუნქციები (React-ის, localStorage-ის, async-ის გარეშე).
// ერთსა და იმავე წესებს იყენებს ფორმაც და API-იც.
import type { Booking } from "@/types/booking";
import {
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  isSameDay,
  parseISO,
} from "date-fns";

export const BUSINESS_START_MIN = 8 * 60; // 08:00
export const BUSINESS_END_MIN = 24 * 60; // 24:00 (შუაღამე)
export const SLOT_MINUTES = 30; // :00 / :30 ბადე
export const MIN_DURATION_MIN = 15;
export const MAX_DURATION_MIN = 8 * 60; // 480

type RangesOverlap = (a: Date, b: Date, c: Date, d: Date) => boolean;

//  დამხმარეები /Helpers

// წუთები შუაღამიდან (ლოკალური დრო). 08:30 → 24:00.
export const minutesIntoDay = (d: Date) => {
  return d.getHours() * 60 + d.getMinutes();
};

// დრო ჯდება თუ არა 30-წუთიან Grid-ზე (და არ არის Invalid Date).
export function isOnGrid(d: Date) {
  return (
    !Number.isNaN(d.getTime()) &&
    d.getMinutes() % SLOT_MINUTES === 0 &&
    d.getSeconds() === 0 &&
    d.getMilliseconds() === 0
  );
}

// ჯავშნის ხანგრძლივობა წუთებში (end − start).
export const durationMinutes = (start: Date, end: Date) => {
  return differenceInMinutes(end, start);
};

// ორი დროის შუალედი ერთმანეთს ედება თუ არა (მიჯნა არ ითვლება).
export const rangesOverlap: RangesOverlap = (aStart, aEnd, bStart, bEnd) => {
  return aStart < bEnd && bStart < aEnd;
};

// ჯავშანი ეტევა თუ არა სამუშაო საათებში (08:00–24:00).
export function isWithinBusinessHours(start: Date, end: Date) {
  // დაწყება 08:00-ზე ადრე არ შეიძლება.
  if (minutesIntoDay(start) < BUSINESS_START_MIN) return false;

  // დასრულება იმავე დღეს.
  if (isSameDay(start, end)) {
    return minutesIntoDay(end) <= BUSINESS_END_MIN;
  }

  // დასრულება ზუსტად მეორე დღის 00:00-ზე "შუაღამემდე".
  if (differenceInCalendarDays(end, start) === 1 && minutesIntoDay(end) === 0) {
    return true;
  }

  // ნებისმიერი სხვა შემთხვევა შუაღამეს სცდება.
  return false;
}

// ჯავშანი შეიძლება შეიცვალოს/გაუქმდეს თუ დადასტურებულია და ჯერ არ დაწყებულა.
export function isBookingEditable(
  booking: Pick<Booking, "status" | "start">,
  now: Date = new Date(),
): boolean {
  return booking.status !== "cancelled" && parseISO(booking.start) > now;
}

// კონფლიქტის ტექსტი მომხმარებლისთვის.
export function describeConflict(b: Booking): string {
  const from = format(parseISO(b.start), "HH:mm");
  const to = format(parseISO(b.end), "HH:mm");
  return `This room is already booked from ${from} to ${to} ("${b.title}").`;
}

// ძირითადი წესები

// ეძებს იმავე ოთახის გადამფარავ ჯავშანს (გაუქმებულს და ignoreId-ს ტოვებს).
export function findConflict(
  candidate: { roomId: string; start: Date; end: Date },
  existing: Booking[],
  ignoreId?: string,
): Booking | null {
  for (const b of existing) {
    if (b.roomId !== candidate.roomId) continue;
    if (b.status === "cancelled") continue;
    if (ignoreId && b.id === ignoreId) continue;

    const bStart = parseISO(b.start);
    const bEnd = parseISO(b.end);

    if (rangesOverlap(candidate.start, candidate.end, bStart, bEnd)) {
      return b;
    }
  }

  return null;
}

// ამოწმებს ჯავშნის დროის ყველა წესს; აბრუნებს შეცდომების ტექსტებს (ცარიელი = ვალიდური).
export function validateBookingTimes(
  start: Date,
  end: Date,
  opts?: { now?: Date; allowPast?: boolean },
): string[] {
  const errors: string[] = [];

  // API-ს RHF+Zod წინ არ უდგას unparsed თარიღი ცალკე დავიჭიროთ.
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return ["Enter a valid start and end time."];
  }

  // დასასრული დასაწყისზე გვიან, დანარჩენ შემოწმებას აზრი არ აქვს.
  if (end <= start) {
    errors.push("End time must be after the start time.");
    return errors;
  }

  if (!isOnGrid(start) || !isOnGrid(end)) {
    errors.push("Bookings must start and end on the hour or half-hour.");
  }

  if (!isWithinBusinessHours(start, end)) {
    errors.push("Bookings must be between 08:00 and midnight.");
  }

  if (durationMinutes(start, end) < MIN_DURATION_MIN) {
    errors.push("Bookings must be at least 15 minutes long.");
  }

  if (durationMinutes(start, end) > MAX_DURATION_MIN) {
    errors.push("Bookings cannot be longer than 8 hours.");
  }

  const now = opts?.now ?? new Date();
  if (!opts?.allowPast && start < now) {
    errors.push("Bookings cannot start in the past.");
  }

  return errors;
}

// სრული შემოწმება: დროის წესები + ოთახის კონფლიქტი. ამას იძახებს ფორმა.
export function validateBooking(
  candidate: { roomId: string; start: Date; end: Date },
  existing: Booking[],
  opts?: { now?: Date; allowPast?: boolean; ignoreId?: string },
): { ok: boolean; errors: string[] } {
  const errors = validateBookingTimes(candidate.start, candidate.end, opts);

  // ოთახს ვამოწმებთ მხოლოდ მაშინ, თუ დრო უკვე გამართულია.
  if (errors.length === 0) {
    const clash = findConflict(candidate, existing, opts?.ignoreId);
    if (clash) errors.push(describeConflict(clash));
  }

  return { ok: errors.length === 0, errors };
}
