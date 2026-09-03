// ინტეგრაციული ტესტები: api/bookings → db → localStorage (jsdom).
import { beforeEach, describe, expect, it } from "vitest";
import { addDays } from "date-fns";
import {
  cancelBooking,
  createBooking,
  listBookings,
  updateBooking,
} from "./bookings";
import type { Booking } from "@/types/booking";

const ROOM = {
  id: "r1",
  name: "Test Room",
  floor: 1,
  capacity: 8,
  amenities: [],
  isActive: true,
};
const EMP = {
  id: "e1",
  name: "Tester",
  email: "t@example.com",
  department: "Engineering",
};

// localStorage-ს პირდაპირ ვავსებთ, seedIfNeeded-ს რომ გავუსწროთ.
function seed(bookings: Booking[] = []) {
  localStorage.clear();
  localStorage.setItem("mrb.seededVersion", "1");
  localStorage.setItem("mrb.rooms", JSON.stringify([ROOM]));
  localStorage.setItem("mrb.employees", JSON.stringify([EMP]));
  localStorage.setItem("mrb.bookings", JSON.stringify(bookings));
}

// N დღეში, HH:00-ზე.
const at = (days: number, hour: number, min = 0) => {
  const d = addDays(new Date(), days);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

const baseInput = {
  roomId: "r1",
  title: "Planning",
  organizerId: "e1",
  attendeeIds: [] as string[],
};

const existingBooking = (over: Partial<Booking> = {}): Booking => ({
  id: "b-existing",
  roomId: "r1",
  title: "Existing",
  organizerId: "e1",
  attendeeIds: [],
  start: at(3, 10),
  end: at(3, 11),
  status: "confirmed",
  createdAt: at(-1, 9),
  updatedAt: at(-1, 9),
  ...over,
});

beforeEach(() => seed());

describe("createBooking", () => {
  it("creates and persists to localStorage", async () => {
    const b = await createBooking({
      ...baseInput,
      start: at(3, 10),
      end: at(3, 11),
    });
    expect(b.id).toBeTruthy();
    expect(b.status).toBe("confirmed");

    const list = await listBookings();
    expect(list).toHaveLength(1);

    const stored = JSON.parse(localStorage.getItem("mrb.bookings")!);
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("Planning");
  });

  it("rejects an overlapping slot in the same room", async () => {
    seed([existingBooking()]);
    await expect(
      createBooking({ ...baseInput, start: at(3, 10, 30), end: at(3, 11, 30) }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("allows a back-to-back slot", async () => {
    seed([existingBooking()]);
    const b = await createBooking({
      ...baseInput,
      start: at(3, 11),
      end: at(3, 12),
    });
    expect(b.id).toBeTruthy();
  });

  it("rejects a start in the past", async () => {
    await expect(
      createBooking({ ...baseInput, start: at(-1, 10), end: at(-1, 11) }),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });
});

describe("cancelBooking", () => {
  it("marks cancelled but keeps the record", async () => {
    seed([existingBooking()]);
    const cancelled = await cancelBooking("b-existing");
    expect(cancelled.status).toBe("cancelled");

    expect(await listBookings()).toHaveLength(1);
    expect(await listBookings({ status: "confirmed" })).toHaveLength(0);
    expect(await listBookings({ status: "cancelled" })).toHaveLength(1);
  });
});

describe("updateBooking", () => {
  it("moves a future booking to a new time", async () => {
    seed([existingBooking()]);
    const updated = await updateBooking("b-existing", {
      start: at(4, 14),
      end: at(4, 15),
    });
    expect(updated.start).toBe(at(4, 14));
  });

  it("refuses to edit a booking that already started", async () => {
    seed([existingBooking({ start: at(-1, 10), end: at(-1, 11) })]);
    await expect(
      updateBooking("b-existing", { title: "New title" }),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });
});

describe("listBookings filters", () => {
  it("filters by room and text search, sorted by start", async () => {
    seed([
      existingBooking({
        id: "b1",
        title: "Alpha",
        start: at(2, 9),
        end: at(2, 10),
      }),
      existingBooking({
        id: "b2",
        title: "Beta",
        start: at(1, 9),
        end: at(1, 10),
      }),
      existingBooking({ id: "b3", roomId: "other", title: "Gamma" }),
    ]);
    const list = await listBookings({ roomId: "r1", search: "a" });
    expect(list.map((b) => b.id)).toEqual(["b2", "b1"]);
  });
});
