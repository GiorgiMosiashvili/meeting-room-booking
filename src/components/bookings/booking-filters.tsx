"use client";

// ჯავშნების ფილტრები: ძებნა, სტატუსი, ოთახი, ორგანიზატორი, თარიღების დიაპაზონი.
import { format } from "date-fns";
import styled from "styled-components";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { useRooms } from "@/hooks/useRooms";
import { useEmployees } from "@/hooks/useEmployees";
import { useBookings } from "@/hooks/useBookings";
import { countsByRoom } from "@/lib/booking-status";
import { Button, Field, Input, Select } from "@/components/ui";
import RoomSelect from "./room-select";

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

const DateRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space(1)};
  align-items: center;
`;

const Row = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
`;

const Count = styled.span`
  color: ${({ theme }) => theme.color.text};
  font-weight: 600;
`;

const today = () => format(new Date(), "yyyy-MM-dd");

export default function BookingFilters({ count }: { count?: number }) {
  const { state, setState, isActive, reset } = useBookingFilters();
  const rooms = useRooms({ includeInactive: true });
  const employees = useEmployees();

  // ოთახის dropdown-ის რაოდენობები ითვლება მიმდინარე თარიღების დიაპაზონისთვის
  // (Room/Status/Search ფილტრების გარეშე), რომ თითოეული ოთახის სრული სურათი სჩანდეს.
  const rangeBookings = useBookings({ from: state.from, to: state.to });
  const counts = countsByRoom(rangeBookings.data ?? []);

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
        <RoomSelect
          rooms={rooms.data ?? []}
          counts={counts}
          value={state.room}
          onChange={(room) => setState({ room })}
        />
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
        <DateRow>
          <Input
            type="date"
            value={state.from}
            onChange={(e) => setState({ from: e.target.value })}
          />
          <Button $variant="ghost" onClick={() => setState({ from: today() })}>
            Today
          </Button>
        </DateRow>
      </Field>

      <Field>
        To
        <DateRow>
          <Input
            type="date"
            value={state.to}
            onChange={(e) => setState({ to: e.target.value })}
          />
          <Button $variant="ghost" onClick={() => setState({ to: today() })}>
            Today
          </Button>
        </DateRow>
      </Field>

      <Row>
        <Count>
          {count != null ? `${count} booking${count === 1 ? "" : "s"}` : ""}
        </Count>
        {isActive && (
          <Button $variant="ghost" onClick={reset}>
            Clear filters
          </Button>
        )}
      </Row>
    </Wrap>
  );
}
