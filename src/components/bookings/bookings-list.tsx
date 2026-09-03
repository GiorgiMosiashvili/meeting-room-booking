"use client";

// ჯავშნების სია, desktop-ზე ცხრილივით, ვიწრო ეკრანზე ბარათებად.
import Link from "next/link";
import styled from "styled-components";
import type { Booking } from "@/types/booking";
import { useRooms } from "@/hooks/useRooms";
import { useEmployeeMap } from "@/hooks/useEmployees";
import { formatRange } from "@/lib/datetime";
import StatusBadge from "./status-badge";

const Head = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr 1.6fr auto;
  gap: ${({ theme }) => theme.space(3)};
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.color.textMuted};

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    display: none;
  }
`;

const Row = styled(Link)`
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr 1.6fr auto;
  gap: ${({ theme }) => theme.space(3)};
  align-items: center;
  padding: ${({ theme }) => theme.space(3)};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.color.surface};
  color: inherit;
  text-decoration: none;

  & + & {
    margin-top: ${({ theme }) => theme.space(2)};
  }
  &:hover {
    border-color: ${({ theme }) => theme.color.primary};
  }

  .label {
    display: none;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.textMuted};
  }

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.space(1)};

    .label {
      display: block;
    }
  }
`;

const Title = styled.div`
  font-weight: 600;
`;

export default function BookingsList({ bookings }: { bookings: Booking[] }) {
  const rooms = useRooms({ includeInactive: true });
  const { map: employees } = useEmployeeMap();
  const roomName = (id: string) =>
    rooms.data?.find((r) => r.id === id)?.name ?? "—";

  return (
    <div>
      <Head>
        <span>Title</span>
        <span>Room</span>
        <span>Organizer</span>
        <span>When</span>
        <span>Status</span>
      </Head>
      {bookings.map((b) => (
        <Row key={b.id} href={`/bookings/${b.id}`}>
          <Title>{b.title}</Title>
          <div>
            <span className="label">Room </span>
            {roomName(b.roomId)}
          </div>
          <div>
            <span className="label">Organizer </span>
            {employees[b.organizerId]?.name ?? "—"}
          </div>
          <div>
            <span className="label">When </span>
            {formatRange(b.start, b.end)}
          </div>
          <StatusBadge booking={b} />
        </Row>
      ))}
    </div>
  );
}
