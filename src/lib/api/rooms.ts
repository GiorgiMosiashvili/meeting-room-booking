// ოთახების API. ფილტრაცია ხდება აქ (როგორც რეალურ backend-ზე), არა კომპონენტში.
"use client";

import type { Amenity, Room } from "@/types/rooms";
import { getRooms as dbGetRooms } from "@/data/db";
import { ApiError, simulate } from "./client";

export interface RoomFilters {
  search?: string;
  capacityMin?: number;
  amenities?: Amenity[];
  floor?: number;
  includeInactive?: boolean;
}

// ოთახების სია ფილტრებით: ძებნა სახელით, მინ. ტევადობა, აღჭურვილობა, სართული.
export function getRooms(filters: RoomFilters = {}): Promise<Room[]> {
  return simulate(() => {
    const q = filters.search?.trim().toLowerCase();
    return dbGetRooms()
      .filter((r) => (filters.includeInactive ? true : r.isActive))
      .filter((r) => (q ? r.name.toLowerCase().includes(q) : true))
      .filter((r) =>
        filters.capacityMin ? r.capacity >= filters.capacityMin : true,
      )
      .filter((r) => (filters.floor != null ? r.floor === filters.floor : true))
      .filter((r) =>
        filters.amenities?.length
          ? filters.amenities.every((a) => r.amenities.includes(a))
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  });
}

// ერთი ოთახი id-ით. თუ ვერ მოიძებნა, NOT_FOUND შეცდომა.
export function getRoom(id: string): Promise<Room> {
  return simulate(() => {
    const room = dbGetRooms().find((r) => r.id === id);
    if (!room) throw new ApiError(`Room "${id}" not found.`, "NOT_FOUND");
    return room;
  });
}
