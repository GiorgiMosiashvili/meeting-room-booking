"use client";

// ოთახების ფილტრები URL search params-ში (nuqs). ერთი წყარო: მისამართის ზოლი.
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { AMENITY_VALUES } from "@/lib/amenities";
import type { RoomFilters } from "@/lib/api/rooms";

export function useRoomFilters() {
  const [state, setState] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      capacity: parseAsInteger,
      floor: parseAsInteger,
      amenities: parseAsArrayOf(
        parseAsStringLiteral(AMENITY_VALUES),
      ).withDefault([]),
    },
    { history: "replace", clearOnDefault: true, throttleMs: 300 },
  );

  // API-ს მოსახერხებელი ფორმა.
  const filters: RoomFilters = {
    search: state.search || undefined,
    capacityMin: state.capacity ?? undefined,
    floor: state.floor ?? undefined,
    amenities: state.amenities.length ? state.amenities : undefined,
  };

  const isActive =
    Boolean(state.search) ||
    state.capacity != null ||
    state.floor != null ||
    state.amenities.length > 0;

  const reset = () =>
    setState({ search: "", capacity: null, floor: null, amenities: [] });

  return { state, setState, filters, isActive, reset };
}
