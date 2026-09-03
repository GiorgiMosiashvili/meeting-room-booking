"use client";

// განრიგის URL-მდგომარეობა: ხედი (day/week), თარიღი, არჩეული ოთახი (week-ისთვის).
import { format } from "date-fns";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

const VIEWS = ["day", "week"] as const;
export type ScheduleView = (typeof VIEWS)[number];

const today = () => format(new Date(), "yyyy-MM-dd");

export function useScheduleParams() {
  const [state, setState] = useQueryStates(
    {
      view: parseAsStringLiteral(VIEWS).withDefault("day"),
      date: parseAsString.withDefault(today()),
      room: parseAsString.withDefault(""),
    },
    { history: "replace", clearOnDefault: true },
  );

  return {
    view: state.view,
    date: state.date || today(),
    room: state.room,
    setView: (view: ScheduleView) => setState({ view }),
    setDate: (date: string) => setState({ date }),
    setRoom: (room: string) => setState({ room }),
  };
}
