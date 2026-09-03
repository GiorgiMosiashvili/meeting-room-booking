import { describe, it, expect } from "vitest";
import type { Booking } from "@/types/booking";
import {
  BUSINESS_START_MIN,
  BUSINESS_END_MIN,
  SLOT_MINUTES,
  MIN_DURATION_MIN,
  MAX_DURATION_MIN,
  minutesIntoDay,
  isOnGrid,
  durationMinutes,
  isWithinBusinessHours,
  rangesOverlap,
  findConflict,
  validateBookingTimes,
  validateBooking,
} from "./booking-rules";

// Local-time constructor — keeps every case deterministic regardless of the
// runner's TZ, which matters because isOnGrid / minutesIntoDay / date-fns'
// calendar-day math all work in local time. Month is 1-indexed here.
const at = (y: number, m: number, d: number, h = 0, min = 0, s = 0, ms = 0) =>
  new Date(y, m - 1, d, h, min, s, ms);

const booking = (over: Partial<Booking> = {}): Booking =>
  ({
    id: "existing-1",
    roomId: "room-1",
    title: "Existing meeting",
    status: "confirmed",
    start: at(2026, 9, 10, 9, 0).toISOString(),
    end: at(2026, 9, 10, 10, 0).toISOString(),
    ...over,
  }) as Booking;

// A well-formed candidate: on grid, inside hours, 1h long, comfortably future.
const goodCandidate = {
  roomId: "room-1",
  start: at(2026, 9, 10, 13, 0),
  end: at(2026, 9, 10, 14, 0),
};
const beforeAll = { now: at(2026, 9, 1, 0, 0), allowPast: false };

describe("constants", () => {
  it("match the documented grid and window", () => {
    expect(BUSINESS_START_MIN).toBe(480);
    expect(BUSINESS_END_MIN).toBe(1440);
    expect(SLOT_MINUTES).toBe(30);
    expect(MIN_DURATION_MIN).toBe(15);
    expect(MAX_DURATION_MIN).toBe(480);
  });
});

describe("minutesIntoDay", () => {
  it("counts local minutes since 00:00", () => {
    expect(minutesIntoDay(at(2026, 9, 10, 0, 0))).toBe(0);
    expect(minutesIntoDay(at(2026, 9, 10, 9, 30))).toBe(570);
    expect(minutesIntoDay(at(2026, 9, 10, 23, 59))).toBe(1439);
  });
});

describe("durationMinutes", () => {
  it("is the signed minute delta end - start", () => {
    expect(
      durationMinutes(at(2026, 9, 10, 9, 0), at(2026, 9, 10, 10, 30)),
    ).toBe(90);
    expect(durationMinutes(at(2026, 9, 10, 10, 0), at(2026, 9, 10, 9, 0))).toBe(
      -60,
    );
  });

  it("spans midnight correctly", () => {
    expect(durationMinutes(at(2026, 9, 10, 23, 0), at(2026, 9, 11, 0, 0))).toBe(
      60,
    );
  });
});

describe("isOnGrid", () => {
  it("accepts :00 and :30 with zero seconds/ms", () => {
    expect(isOnGrid(at(2026, 9, 10, 10, 0, 0, 0))).toBe(true);
    expect(isOnGrid(at(2026, 9, 10, 10, 30, 0, 0))).toBe(true);
  });

  it("rejects off-grid minutes", () => {
    expect(isOnGrid(at(2026, 9, 10, 10, 15, 0, 0))).toBe(false);
    expect(isOnGrid(at(2026, 9, 10, 10, 45, 0, 0))).toBe(false);
  });

  it("rejects stray seconds or milliseconds (10:30:45 must not sneak through)", () => {
    expect(isOnGrid(at(2026, 9, 10, 10, 30, 45, 0))).toBe(false);
    expect(isOnGrid(at(2026, 9, 10, 10, 30, 0, 500))).toBe(false);
  });

  it("rejects an Invalid Date", () => {
    expect(isOnGrid(new Date("not a date"))).toBe(false);
  });
});

describe("isWithinBusinessHours", () => {
  it("accepts a normal same-day booking", () => {
    expect(
      isWithinBusinessHours(at(2026, 9, 10, 9, 0), at(2026, 9, 10, 17, 0)),
    ).toBe(true);
  });

  it("rejects a start before 08:00", () => {
    expect(
      isWithinBusinessHours(at(2026, 9, 10, 7, 59), at(2026, 9, 10, 9, 0)),
    ).toBe(false);
  });

  it("accepts a start at exactly 08:00", () => {
    expect(
      isWithinBusinessHours(at(2026, 9, 10, 8, 0), at(2026, 9, 10, 9, 0)),
    ).toBe(true);
  });

  it("accepts 23:00 -> next-day 00:00 (the ends-at-midnight case)", () => {
    expect(
      isWithinBusinessHours(at(2026, 9, 10, 23, 0), at(2026, 9, 11, 0, 0)),
    ).toBe(true);
  });

  it("rejects 23:00 -> next-day 00:30 (runs past midnight)", () => {
    expect(
      isWithinBusinessHours(at(2026, 9, 10, 23, 0), at(2026, 9, 11, 0, 30)),
    ).toBe(false);
  });

  it("rejects an end two calendar days later, even at 00:00", () => {
    expect(
      isWithinBusinessHours(at(2026, 9, 10, 23, 0), at(2026, 9, 12, 0, 0)),
    ).toBe(false);
  });
});

describe("rangesOverlap", () => {
  it("is true for partial and nested overlaps", () => {
    const base = [at(2026, 9, 10, 10, 0), at(2026, 9, 10, 12, 0)] as const;
    expect(
      rangesOverlap(...base, at(2026, 9, 10, 11, 0), at(2026, 9, 10, 13, 0)),
    ).toBe(true);
    expect(
      rangesOverlap(...base, at(2026, 9, 10, 10, 30), at(2026, 9, 10, 11, 30)),
    ).toBe(true);
  });

  it("is false for touching, back-to-back ranges", () => {
    expect(
      rangesOverlap(
        at(2026, 9, 10, 10, 0),
        at(2026, 9, 10, 11, 0),
        at(2026, 9, 10, 11, 0),
        at(2026, 9, 10, 12, 0),
      ),
    ).toBe(false);
  });

  it("is false for fully disjoint ranges", () => {
    expect(
      rangesOverlap(
        at(2026, 9, 10, 10, 0),
        at(2026, 9, 10, 11, 0),
        at(2026, 9, 10, 14, 0),
        at(2026, 9, 10, 15, 0),
      ),
    ).toBe(false);
  });
});

describe("findConflict", () => {
  const cand = {
    roomId: "room-1",
    start: at(2026, 9, 10, 9, 30),
    end: at(2026, 9, 10, 10, 30),
  };

  it("returns the whole clashing booking", () => {
    const hit = booking();
    expect(findConflict(cand, [hit])).toBe(hit);
  });

  it("ignores a different room", () => {
    expect(findConflict(cand, [booking({ roomId: "room-2" })])).toBeNull();
  });

  it("ignores cancelled bookings", () => {
    expect(findConflict(cand, [booking({ status: "cancelled" })])).toBeNull();
  });

  it("ignores the booking being edited via ignoreId", () => {
    expect(
      findConflict(cand, [booking({ id: "edit-me" })], "edit-me"),
    ).toBeNull();
  });

  it("does not flag a back-to-back booking as a conflict", () => {
    const back2back = booking({
      start: at(2026, 9, 10, 10, 30).toISOString(),
      end: at(2026, 9, 10, 11, 30).toISOString(),
    });
    expect(findConflict(cand, [back2back])).toBeNull();
  });

  it("returns null for an empty list", () => {
    expect(findConflict(cand, [])).toBeNull();
  });
});

describe("validateBookingTimes", () => {
  it("returns no errors for a valid booking", () => {
    expect(
      validateBookingTimes(goodCandidate.start, goodCandidate.end, beforeAll),
    ).toEqual([]);
  });

  it("rejects an unparseable date with a single clear message", () => {
    expect(
      validateBookingTimes(new Date("nope"), at(2026, 9, 10, 10, 0), beforeAll),
    ).toEqual(["Enter a valid start and end time."]);
    expect(
      validateBookingTimes(at(2026, 9, 10, 9, 0), new Date("nope"), beforeAll),
    ).toEqual(["Enter a valid start and end time."]);
  });

  it("rejects an inverted or zero-length range and short-circuits", () => {
    expect(
      validateBookingTimes(
        at(2026, 9, 10, 10, 0),
        at(2026, 9, 10, 9, 0),
        beforeAll,
      ),
    ).toEqual(["End time must be after the start time."]);
    expect(
      validateBookingTimes(
        at(2026, 9, 10, 10, 0),
        at(2026, 9, 10, 10, 0),
        beforeAll,
      ),
    ).toEqual(["End time must be after the start time."]);
  });

  it("flags an off-grid start or end", () => {
    const errs = validateBookingTimes(
      at(2026, 9, 10, 13, 15),
      at(2026, 9, 10, 14, 0),
      beforeAll,
    );
    expect(errs).toContain(
      "Bookings must start and end on the hour or half-hour.",
    );
  });

  it("flags 10:30:45 sneaking in via seconds", () => {
    const errs = validateBookingTimes(
      at(2026, 9, 10, 13, 0, 45),
      at(2026, 9, 10, 14, 0),
      beforeAll,
    );
    expect(errs).toContain(
      "Bookings must start and end on the hour or half-hour.",
    );
  });

  it("flags a booking outside business hours", () => {
    const errs = validateBookingTimes(
      at(2026, 9, 10, 7, 30),
      at(2026, 9, 10, 9, 0),
      beforeAll,
    );
    expect(errs).toContain("Bookings must be between 08:00 and midnight.");
  });

  it("accepts 23:00 -> 24:00 stored as next-day 00:00", () => {
    expect(
      validateBookingTimes(
        at(2026, 9, 10, 23, 0),
        at(2026, 9, 11, 0, 0),
        beforeAll,
      ),
    ).toEqual([]);
  });

  it("rejects 23:00 -> next-day 00:30", () => {
    const errs = validateBookingTimes(
      at(2026, 9, 10, 23, 0),
      at(2026, 9, 11, 0, 30),
      beforeAll,
    );
    expect(errs).toContain("Bookings must be between 08:00 and midnight.");
  });

  it("flags a booking under the minimum duration", () => {
    const errs = validateBookingTimes(
      at(2026, 9, 10, 13, 0),
      at(2026, 9, 10, 13, 10),
      beforeAll,
    );
    expect(errs).toContain("Bookings must be at least 15 minutes long.");
  });

  it("flags a booking over the maximum duration", () => {
    const errs = validateBookingTimes(
      at(2026, 9, 10, 8, 0),
      at(2026, 9, 10, 17, 0),
      beforeAll,
    );
    expect(errs).toContain("Bookings cannot be longer than 8 hours.");
  });

  it("accepts a booking of exactly the max duration", () => {
    expect(
      validateBookingTimes(
        at(2026, 9, 10, 9, 0),
        at(2026, 9, 10, 17, 0),
        beforeAll,
      ),
    ).toEqual([]);
  });

  it("flags a start in the past against the injected now", () => {
    const errs = validateBookingTimes(
      at(2026, 9, 10, 13, 0),
      at(2026, 9, 10, 14, 0),
      { now: at(2026, 9, 10, 15, 0) },
    );
    expect(errs).toContain("Bookings cannot start in the past.");
  });

  it("allows a past start when allowPast is set", () => {
    expect(
      validateBookingTimes(at(2026, 9, 10, 13, 0), at(2026, 9, 10, 14, 0), {
        now: at(2026, 9, 10, 15, 0),
        allowPast: true,
      }),
    ).toEqual([]);
  });

  it("accumulates multiple independent errors", () => {
    const errs = validateBookingTimes(
      at(2026, 9, 10, 7, 15), // off grid AND before 08:00
      at(2026, 9, 10, 7, 20), // off grid, under min duration
      { now: at(2026, 9, 10, 9, 0) }, // and in the past
    );
    expect(errs).toContain(
      "Bookings must start and end on the hour or half-hour.",
    );
    expect(errs).toContain("Bookings must be between 08:00 and midnight.");
    expect(errs).toContain("Bookings must be at least 15 minutes long.");
    expect(errs).toContain("Bookings cannot start in the past.");
  });
});

describe("validateBooking", () => {
  it("returns ok for valid times with no room clash", () => {
    expect(validateBooking(goodCandidate, [], beforeAll)).toEqual({
      ok: true,
      errors: [],
    });
  });

  it("surfaces a room clash with the times and title of the existing booking", () => {
    const existing = [
      booking({
        title: "Standup",
        start: at(2026, 9, 10, 13, 30).toISOString(),
        end: at(2026, 9, 10, 14, 30).toISOString(),
      }),
    ];
    const res = validateBooking(goodCandidate, existing, beforeAll);
    expect(res.ok).toBe(false);
    expect(res.errors).toHaveLength(1);
    expect(res.errors[0]).toBe(
      'This room is already booked from 13:30 to 14:30 ("Standup").',
    );
  });

  it("skips the room check when the times are already invalid", () => {
    const overlapping = [
      booking({
        start: at(2026, 9, 10, 13, 0).toISOString(),
        end: at(2026, 9, 10, 15, 0).toISOString(),
      }),
    ];
    const res = validateBooking(
      {
        roomId: "room-1",
        start: at(2026, 9, 10, 14, 0),
        end: at(2026, 9, 10, 13, 0),
      },
      overlapping,
      beforeAll,
    );
    expect(res.ok).toBe(false);
    expect(res.errors).toEqual(["End time must be after the start time."]);
  });

  it("passes ignoreId through so an edited booking does not clash with itself", () => {
    const self = booking({
      id: "edit-me",
      start: goodCandidate.start.toISOString(),
      end: goodCandidate.end.toISOString(),
    });
    expect(
      validateBooking(goodCandidate, [self], {
        ...beforeAll,
        ignoreId: "edit-me",
      }),
    ).toEqual({ ok: true, errors: [] });
  });

  it("ignores a cancelled booking that would otherwise clash", () => {
    const cancelled = [
      booking({
        status: "cancelled",
        start: goodCandidate.start.toISOString(),
        end: goodCandidate.end.toISOString(),
      }),
    ];
    expect(validateBooking(goodCandidate, cancelled, beforeAll)).toEqual({
      ok: true,
      errors: [],
    });
  });
});
