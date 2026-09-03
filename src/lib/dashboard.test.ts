import { describe, expect, it } from "vitest";
import type { Booking } from "@/types/booking";
import {
  bookedMinutesOnDay,
  bookingCountByRoom,
  roomIdsInUse,
  upcoming,
  utilisationPct,
} from "./dashboard";

const at = (y: number, m: number, d: number, h: number, min = 0) =>
  new Date(y, m - 1, d, h, min, 0, 0);

const b = (over: Partial<Booking>): Booking => ({
  id: "x",
  roomId: "r1",
  title: "T",
  organizerId: "e1",
  attendeeIds: [],
  start: at(2026, 9, 10, 9).toISOString(),
  end: at(2026, 9, 10, 10).toISOString(),
  status: "confirmed",
  createdAt: "",
  updatedAt: "",
  ...over,
});

const DAY = at(2026, 9, 10, 0);

describe("roomIdsInUse", () => {
  it("includes a room mid-meeting, excludes finished / cancelled", () => {
    const now = at(2026, 9, 10, 9, 30);
    const ids = roomIdsInUse(
      [
        b({
          roomId: "r1",
          start: at(2026, 9, 10, 9).toISOString(),
          end: at(2026, 9, 10, 10).toISOString(),
        }),
        b({
          roomId: "r2",
          start: at(2026, 9, 10, 8).toISOString(),
          end: at(2026, 9, 10, 9).toISOString(),
        }),
        b({
          roomId: "r3",
          status: "cancelled",
          start: at(2026, 9, 10, 9).toISOString(),
          end: at(2026, 9, 10, 10).toISOString(),
        }),
      ],
      now,
    );
    expect([...ids]).toEqual(["r1"]);
  });
});

describe("bookedMinutesOnDay / utilisationPct", () => {
  it("sums booked minutes for the day and ignores other days", () => {
    const mins = bookedMinutesOnDay(
      [
        b({
          start: at(2026, 9, 10, 9).toISOString(),
          end: at(2026, 9, 10, 10, 30).toISOString(),
        }), // 90
        b({
          start: at(2026, 9, 11, 9).toISOString(),
          end: at(2026, 9, 11, 10).toISOString(),
        }), // other day
      ],
      DAY,
    );
    expect(mins).toBe(90);
  });

  it("utilisation is booked / (rooms * 960)", () => {
    // 1 room, 96 min booked -> 10%
    const pct = utilisationPct(
      [
        b({
          start: at(2026, 9, 10, 9).toISOString(),
          end: at(2026, 9, 10, 10, 36).toISOString(),
        }),
      ],
      1,
      DAY,
    );
    expect(pct).toBe(10);
  });
});

describe("bookingCountByRoom", () => {
  it("counts non-cancelled per room", () => {
    const m = bookingCountByRoom([
      b({ roomId: "r1" }),
      b({ roomId: "r1" }),
      b({ roomId: "r2", status: "cancelled" }),
    ]);
    expect(m).toEqual({ r1: 2 });
  });
});

describe("upcoming", () => {
  it("returns future bookings sorted, limited", () => {
    const now = at(2026, 9, 10, 9);
    const list = upcoming(
      [
        b({
          id: "past",
          start: at(2026, 9, 10, 8).toISOString(),
          end: at(2026, 9, 10, 9).toISOString(),
        }),
        b({
          id: "later",
          start: at(2026, 9, 10, 14).toISOString(),
          end: at(2026, 9, 10, 15).toISOString(),
        }),
        b({
          id: "soon",
          start: at(2026, 9, 10, 11).toISOString(),
          end: at(2026, 9, 10, 12).toISOString(),
        }),
      ],
      now,
      2,
    );
    expect(list.map((x) => x.id)).toEqual(["soon", "later"]);
  });
});
