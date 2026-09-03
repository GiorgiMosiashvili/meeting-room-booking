// ჯავშნების API: სია, დეტალი, შექმნა, ცვლა, გაუქმება.
// ვალიდაცია (დრო + კონფლიქტი) ხდება booking-rules-ის სუფთა ფუნქციებით.
"use client";

import { endOfDay, parseISO, startOfDay } from "date-fns";
import type {
  Booking,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/types/booking";
import { CreateBookingSchema, UpdateBookingSchema } from "@/types/booking";
import { getBookings as dbGetBookings, saveBookings } from "@/data/db";
import {
  describeConflict,
  findConflict,
  validateBookingTimes,
} from "@/lib/booking-rules";
import { ApiError, simulate } from "./client";

export interface BookingFilters {
  search?: string;
  status?: Booking["status"];
  roomId?: string;
  organizerId?: string;
  from?: string; // yyyy-MM-dd (ჩათვლით)
  to?: string; // yyyy-MM-dd (ჩათვლით)
}

// ჯავშნების სია ფილტრებით, დალაგებული დაწყების დროით.
export function listBookings(filters: BookingFilters = {}): Promise<Booking[]> {
  return simulate(() => {
    const q = filters.search?.trim().toLowerCase();
    const from = filters.from ? startOfDay(parseISO(filters.from)) : null;
    const to = filters.to ? endOfDay(parseISO(filters.to)) : null;

    return dbGetBookings()
      .filter((b) => (q ? b.title.toLowerCase().includes(q) : true))
      .filter((b) => (filters.status ? b.status === filters.status : true))
      .filter((b) => (filters.roomId ? b.roomId === filters.roomId : true))
      .filter((b) =>
        filters.organizerId ? b.organizerId === filters.organizerId : true,
      )
      .filter((b) => {
        const start = parseISO(b.start);
        if (from && start < from) return false;
        if (to && start > to) return false;
        return true;
      })
      .sort((a, b) => a.start.localeCompare(b.start));
  });
}

// ერთი ჯავშანი id-ით. თუ ვერ მოიძებნა - NOT_FOUND შეცდომა.
export function getBooking(id: string): Promise<Booking> {
  return simulate(() => {
    const booking = dbGetBookings().find((b) => b.id === id);
    if (!booking) throw new ApiError(`Booking "${id}" not found.`, "NOT_FOUND");
    return booking;
  });
}

// ქმნის ჯავშანს: schema → დროის წესები → ოთახის კონფლიქტი → შენახვა.
export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return simulate(() => {
    const parsed = CreateBookingSchema.safeParse(input);
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0].message, "VALIDATION");
    }
    const data = parsed.data;
    const start = parseISO(data.start);
    const end = parseISO(data.end);

    const timeErrors = validateBookingTimes(start, end);
    if (timeErrors.length) throw new ApiError(timeErrors[0], "VALIDATION");

    const clash = findConflict(
      { roomId: data.roomId, start, end },
      dbGetBookings(),
    );
    if (clash) throw new ApiError(describeConflict(clash), "CONFLICT");

    const now = new Date().toISOString();
    const booking: Booking = {
      id: crypto.randomUUID(),
      roomId: data.roomId,
      title: data.title,
      organizerId: data.organizerId,
      attendeeIds: data.attendeeIds,
      start: data.start,
      end: data.end,
      description: data.description,
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    };
    saveBookings([...dbGetBookings(), booking]);
    return booking;
  });
}

// ცვლის ჯავშანს, მხოლოდ დაუწყებელს და გაუქმებულის გარდა.
export function updateBooking(
  id: string,
  patch: UpdateBookingInput,
): Promise<Booking> {
  return simulate(() => {
    const all = dbGetBookings();
    const existing = all.find((b) => b.id === id);
    if (!existing)
      throw new ApiError(`Booking "${id}" not found.`, "NOT_FOUND");
    if (existing.status === "cancelled") {
      throw new ApiError("Cancelled bookings can't be edited.", "VALIDATION");
    }
    if (parseISO(existing.start) <= new Date()) {
      throw new ApiError(
        "Bookings that have already started can't be edited.",
        "VALIDATION",
      );
    }

    const parsed = UpdateBookingSchema.safeParse(patch);
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0].message, "VALIDATION");
    }
    const merged = { ...existing, ...parsed.data };
    const start = parseISO(merged.start);
    const end = parseISO(merged.end);

    const timeErrors = validateBookingTimes(start, end);
    if (timeErrors.length) throw new ApiError(timeErrors[0], "VALIDATION");

    const clash = findConflict(
      { roomId: merged.roomId, start, end },
      all,
      id, // საკუთარ თავს არ თვლის კონფლიქტად
    );
    if (clash) throw new ApiError(describeConflict(clash), "CONFLICT");

    const updated: Booking = {
      ...merged,
      updatedAt: new Date().toISOString(),
    };
    saveBookings(all.map((b) => (b.id === id ? updated : b)));
    return updated;
  });
}

// აუქმებს ჯავშანს (ჩანაწერი რჩება, status → "cancelled").
export function cancelBooking(id: string): Promise<Booking> {
  return simulate(() => {
    const all = dbGetBookings();
    const existing = all.find((b) => b.id === id);
    if (!existing)
      throw new ApiError(`Booking "${id}" not found.`, "NOT_FOUND");
    if (existing.status === "cancelled") return existing;
    if (parseISO(existing.start) <= new Date()) {
      throw new ApiError(
        "Bookings that have already started can't be cancelled.",
        "VALIDATION",
      );
    }

    const cancelled: Booking = {
      ...existing,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };
    saveBookings(all.map((b) => (b.id === id ? cancelled : b)));
    return cancelled;
  });
}
