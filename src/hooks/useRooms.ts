"use client";

// ოთახების TanStack Query ჰუკები, API-ს გარსი.
import { useQuery } from "@tanstack/react-query";
import { getRoom, getRooms, type RoomFilters } from "@/lib/api/rooms";

// ოთახების სია ფილტრებით. queryKey შეიცავს ფილტრებს, რომ ცვლილებაზე თავიდან წამოიღოს.
export function useRooms(filters: RoomFilters = {}) {
  return useQuery({
    queryKey: ["rooms", filters],
    queryFn: () => getRooms(filters),
  });
}

// ერთი ოთახი id-ით.
export function useRoom(id: string) {
  return useQuery({
    queryKey: ["room", id],
    queryFn: () => getRoom(id),
    enabled: Boolean(id),
  });
}
