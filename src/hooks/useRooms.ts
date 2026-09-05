"use client";

// ოთახების TanStack Query ჰუკები, API-ს გარსი.
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRoom, getRooms, type RoomFilters } from "@/lib/api/rooms";

// ოთახების სია ფილტრებით. queryKey შეიცავს ფილტრებს, რომ ცვლილებაზე თავიდან წამოიღოს.
// placeholderData ინარჩუნებს ძველ სიას ფილტრის შეცვლისას (isFetching კი true-ა),
// რომ საძიებო ველში აკრეფისას მთელი სია არ ციმციმებდეს.
export function useRooms(filters: RoomFilters = {}) {
  return useQuery({
    queryKey: ["rooms", filters],
    queryFn: () => getRooms(filters),
    placeholderData: keepPreviousData,
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
