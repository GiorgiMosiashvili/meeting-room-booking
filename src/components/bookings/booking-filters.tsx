"use client";

// ჯავშნების ფილტრები: ძებნა, სტატუსი, ოთახი, ორგანიზატორი, თარიღების დიაპაზონი.
import styled from "styled-components";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { useRooms } from "@/hooks/useRooms";
import { useEmployees } from "@/hooks/useEmployees";
import { Button, Field, Input, Select } from "@/components/ui";

const Wrap = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.space(3)};
  margin-bottom: ${({ theme }) => theme.space(4)};

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Row = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

export default function BookingFilters({ count }: { count?: number }) {
  const { state, setState, isActive, reset } = useBookingFilters();
  const rooms = useRooms({ includeInactive: true });
  const employees = useEmployees();

  return (
    <Wrap>
      <Field>
        Search
        <Input
          type="search"
          placeholder="Meeting title…"
          value={state.search}
          onChange={(e) => setState({ search: e.target.value })}
        />
      </Field>

      <Field>
        Status
        <Select
          value={state.status ?? ""}
          onChange={(e) =>
            setState({
              status: e.target.value
                ? (e.target.value as "confirmed" | "cancelled")
                : null,
            })
          }
        >
          <option value="">Any</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </Field>

      <Field>
        Room
        <Select
          value={state.room}
          onChange={(e) => setState({ room: e.target.value })}
        >
          <option value="">Any room</option>
          {(rooms.data ?? []).map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        Organizer
        <Select
          value={state.organizer}
          onChange={(e) => setState({ organizer: e.target.value })}
        >
          <option value="">Anyone</option>
          {(employees.data ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        From
        <Input
          type="date"
          value={state.from}
          onChange={(e) => setState({ from: e.target.value })}
        />
      </Field>

      <Field>
        To
        <Input
          type="date"
          value={state.to}
          onChange={(e) => setState({ to: e.target.value })}
        />
      </Field>

      <Row>
        <span>
          {count != null ? `${count} booking${count === 1 ? "" : "s"}` : ""}
        </span>
        {isActive && (
          <Button $variant="ghost" onClick={reset}>
            Clear filters
          </Button>
        )}
      </Row>
    </Wrap>
  );
}
