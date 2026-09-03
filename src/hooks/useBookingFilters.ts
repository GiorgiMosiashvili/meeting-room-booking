"use client";

// ჯავშნების სიის ფილტრები URL-ში (nuqs).
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import type { BookingFilters } from "@/lib/api/bookings";

const STATUSES = ["confirmed", "cancelled"] as const;

export function useBookingFilters() {
  const [state, setState] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      status: parseAsStringLiteral(STATUSES),
      room: parseAsString.withDefault(""),
      organizer: parseAsString.withDefault(""),
      from: parseAsString.withDefault(""),
      to: parseAsString.withDefault(""),
    },
    { history: "replace", clearOnDefault: true, throttleMs: 300 },
  );

  const filters: BookingFilters = {
    search: state.search || undefined,
    status: state.status ?? undefined,
    roomId: state.room || undefined,
    organizerId: state.organizer || undefined,
    from: state.from || undefined,
    to: state.to || undefined,
  };

  const isActive =
    Boolean(state.search) ||
    state.status != null ||
    Boolean(state.room) ||
    Boolean(state.organizer) ||
    Boolean(state.from) ||
    Boolean(state.to);

  const reset = () =>
    setState({
      search: "",
      status: null,
      room: "",
      organizer: "",
      from: "",
      to: "",
    });

  return { state, setState, filters, isActive, reset };
}
