"use client";

// ოთახების ფილტრები: ძებნა, სართული, მინ. ტევადობა, აღჭურვილობა.
import styled from "styled-components";
import { useRooms } from "@/hooks/useRooms";
import { useRoomFilters } from "@/hooks/useRoomFilters";
import { AMENITIES } from "@/lib/amenities";
import { Button, Field, Input, Select } from "@/components/ui";

const Wrap = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: ${({ theme }) => theme.space(3)};
  align-items: end;
  margin-bottom: ${({ theme }) => theme.space(4)};

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Amenities = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

const Toggle = styled.button<{ $on: boolean }>`
  padding: ${({ theme }) => theme.space(1)} ${({ theme }) => theme.space(3)};
  border-radius: ${({ theme }) => theme.radius.full};
  border: 1px solid
    ${({ theme, $on }) => ($on ? theme.color.primary : theme.color.border)};
  background: ${({ theme, $on }) =>
    $on ? theme.color.primarySoft : theme.color.surface};
  color: ${({ theme, $on }) =>
    $on ? theme.color.primary : theme.color.textMuted};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
`;

const Row = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.color.textMuted};
`;

const CAPACITY_OPTIONS = [1, 2, 4, 6, 10, 15];

export default function RoomFilters({ count }: { count?: number }) {
  const { state, setState, isActive, reset } = useRoomFilters();
  const allRooms = useRooms({ includeInactive: true });
  const floors = [...new Set((allRooms.data ?? []).map((r) => r.floor))].sort(
    (a, b) => a - b,
  );

  const toggleAmenity = (value: (typeof AMENITIES)[number]["value"]) => {
    const next = state.amenities.includes(value)
      ? state.amenities.filter((a) => a !== value)
      : [...state.amenities, value];
    setState({ amenities: next });
  };

  return (
    <Wrap>
      <Field>
        Search
        <Input
          type="search"
          placeholder="Room name…"
          value={state.search}
          onChange={(e) => setState({ search: e.target.value })}
        />
      </Field>

      <Field>
        Floor
        <Select
          value={state.floor ?? ""}
          onChange={(e) =>
            setState({ floor: e.target.value ? Number(e.target.value) : null })
          }
        >
          <option value="">Any</option>
          {floors.map((f) => (
            <option key={f} value={f}>
              Floor {f}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        Min. capacity
        <Select
          value={state.capacity ?? ""}
          onChange={(e) =>
            setState({
              capacity: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">Any</option>
          {CAPACITY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}+ people
            </option>
          ))}
        </Select>
      </Field>

      <Amenities>
        {AMENITIES.map((a) => (
          <Toggle
            key={a.value}
            type="button"
            $on={state.amenities.includes(a.value)}
            onClick={() => toggleAmenity(a.value)}
          >
            {a.icon} {a.label}
          </Toggle>
        ))}
      </Amenities>

      <Row>
        <span>
          {count != null ? `${count} room${count === 1 ? "" : "s"}` : ""}
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
