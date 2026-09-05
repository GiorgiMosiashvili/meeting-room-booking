"use client";

// განრიგის ზოლი: წინა/შემდეგი, "Today", ხედის გადამრთველი, ოთახის არჩევა (week).
import styled from "styled-components";
import { addDays, addWeeks, format, parseISO, startOfWeek } from "date-fns";
import type { Room } from "@/types/rooms";
import { useScheduleParams } from "@/hooks/useScheduleParams";
import { Button, Input, Select } from "@/components/ui";

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Range = styled.strong`
  font-size: 1rem;
  min-width: 200px;
`;

const DateInput = styled(Input)`
  width: auto;
  padding: ${({ theme }) => theme.space(1)} ${({ theme }) => theme.space(2)};
`;

const Toggle = styled.div`
  display: inline-flex;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  overflow: hidden;

  button {
    border: none;
    background: ${({ theme }) => theme.color.surface};
    padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }
  button[aria-pressed="true"] {
    background: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.primaryText};
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

export default function ScheduleToolbar({ rooms }: { rooms: Room[] }) {
  const { view, date, room, setView, setDate, setRoom } = useScheduleParams();
  const d = parseISO(date);

  const shift = (dir: number) => {
    const next = view === "week" ? addWeeks(d, dir) : addDays(d, dir);
    setDate(format(next, "yyyy-MM-dd"));
  };

  const rangeLabel =
    view === "week"
      ? (() => {
          const ws = startOfWeek(d, { weekStartsOn: 1 });
          return `${format(ws, "d MMM")} – ${format(addDays(ws, 6), "d MMM yyyy")}`;
        })()
      : format(d, "EEEE, d MMMM yyyy");

  return (
    <Bar>
      <Button $variant="ghost" onClick={() => shift(-1)} aria-label="Previous">
        ‹
      </Button>
      <Button
        $variant="ghost"
        onClick={() => setDate(format(new Date(), "yyyy-MM-dd"))}
      >
        Today
      </Button>
      <Button $variant="ghost" onClick={() => shift(1)} aria-label="Next">
        ›
      </Button>
      <Range>{rangeLabel}</Range>

      <DateInput
        type="date"
        value={date}
        onChange={(e) => e.target.value && setDate(e.target.value)}
        aria-label="Jump to date"
      />

      <Spacer />

      {view === "week" && (
        <Select
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={{ width: "auto" }}
        >
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      )}

      <Toggle>
        <button
          aria-pressed={view === "day"}
          onClick={() => setView("day")}
          type="button"
        >
          Day
        </button>
        <button
          aria-pressed={view === "week"}
          onClick={() => setView("week")}
          type="button"
        >
          Week
        </button>
      </Toggle>
    </Bar>
  );
}
