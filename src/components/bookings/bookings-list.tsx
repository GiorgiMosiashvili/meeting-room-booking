"use client";

// ჯავშნების სია, desktop-ზე ცხრილივით, ვიწრო ეკრანზე ბარათებად.
import { useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import type { Booking } from "@/types/booking";
import { useRooms } from "@/hooks/useRooms";
import { useEmployeeMap } from "@/hooks/useEmployees";
import { formatRange } from "@/lib/datetime";
import { classifyBooking, type DisplayStatus } from "@/lib/booking-status";
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

const StatusHeadSelect = styled.select`
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  padding: 0;
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
    rooms.data?.find((r) => r.id === id)?.name ?? "-";

  // "Status" სვეტის თავზე დაჭერით შეგიძლია აირჩიო რომელი სტატუსი ავიდეს სიის თავში.
  const [priority, setPriority] = useState<DisplayStatus | "">("");

  const sorted = useMemo(() => {
    if (!priority) return bookings;
    // Array.prototype.sort სტაბილურია — თანაბარი შედეგები თანმიმდევრობას ინარჩუნებს.
    return [...bookings].sort((a, b) => {
      const aFirst = classifyBooking(a) === priority ? 0 : 1;
      const bFirst = classifyBooking(b) === priority ? 0 : 1;
      return aFirst - bFirst;
    });
  }, [bookings, priority]);

  return (
    <div>
      <Head>
        <span>Title</span>
        <span>Room</span>
        <span>Organizer</span>
        <span>When</span>
        <StatusHeadSelect
          value={priority}
          onChange={(e) => setPriority(e.target.value as DisplayStatus | "")}
          aria-label="Bring a status to the top"
        >
          <option value="">Status</option>
          <option value="confirmed">Confirmed first</option>
          <option value="past">Past first</option>
          <option value="cancelled">Cancelled first</option>
        </StatusHeadSelect>
      </Head>
      {sorted.map((b) => (
        <Row key={b.id} href={`/bookings/${b.id}`}>
          <Title>{b.title}</Title>
          <div>
            <span className="label">Room </span>
            {roomName(b.roomId)}
          </div>
          <div>
            <span className="label">Organizer </span>
            {employees[b.organizerId]?.name ?? "-"}
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
