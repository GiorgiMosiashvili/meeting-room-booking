"use client";

// ხელით აწყობილი დროის ბადე. სათაურები და საათების სვეტი "წებოვანია" (sticky),
// ბადე გადააგორავებს კონტეინერში, გვერდი კი ადგილზე რჩება.
// ცარიელ უჯრაზე დაჭერა → ახალი ჯავშანი; ბლოკზე დაჭერა → დეტალი.
import { isSameDay, parseISO } from "date-fns";
import styled from "styled-components";
import type { Booking } from "@/types/booking";
import { BUSINESS_END_MIN, BUSINESS_START_MIN } from "@/lib/booking-rules";
import { formatTime } from "@/lib/datetime";

const SLOT_PX = 20; // 30 წუთი
const SLOT_MIN = 30;
const GUTTER = 52;
const COL_MIN = 108;
const SLOT_COUNT = (BUSINESS_END_MIN - BUSINESS_START_MIN) / SLOT_MIN; // 32
const TOTAL_H = SLOT_COUNT * SLOT_PX;

export interface GridColumn {
  key: string;
  label: string;
  sublabel?: string;
  roomId: string;
  date: string; // yyyy-MM-dd
}

const Scroll = styled.div`
  overflow: auto;
  max-height: calc(100vh - 240px);
  min-height: 360px;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.color.surface};
`;

const Grid = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: ${GUTTER}px repeat(
      ${({ $cols }) => $cols},
      minmax(${COL_MIN}px, 1fr)
    );
  grid-template-rows: auto ${TOTAL_H}px;
  min-width: ${({ $cols }) => GUTTER + $cols * COL_MIN}px;
`;

const Corner = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  z-index: 4;
  background: ${({ theme }) => theme.color.surface};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
`;

const ColHead = styled.div`
  position: sticky;
  top: 0;
  z-index: 3;
  background: ${({ theme }) => theme.color.surface};
  padding: ${({ theme }) => theme.space(2)} 6px;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.2;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  border-left: 1px solid ${({ theme }) => theme.color.border};

  span {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  small {
    display: block;
    font-weight: 400;
    font-size: 0.68rem;
    color: ${({ theme }) => theme.color.textMuted};
  }
`;

const Gutter = styled.div`
  position: sticky;
  left: 0;
  z-index: 2;
  background: ${({ theme }) => theme.color.surface};
  border-right: 1px solid ${({ theme }) => theme.color.border};
`;

const HourLabel = styled.div`
  position: absolute;
  right: 6px;
  font-size: 0.68rem;
  color: ${({ theme }) => theme.color.textMuted};
  transform: translateY(-50%);
`;

const Col = styled.div`
  position: relative;
  border-left: 1px solid ${({ theme }) => theme.color.border};
`;

const Slot = styled.button`
  position: absolute;
  left: 0;
  right: 0;
  height: ${SLOT_PX}px;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.color.surfaceAlt};
  background: transparent;
  cursor: pointer;
  padding: 0;

  &:hover {
    background: ${({ theme }) => theme.color.primarySoft};
  }
`;

const Block = styled.button`
  position: absolute;
  left: 3px;
  right: 3px;
  border: 1px solid ${({ theme }) => theme.color.primary};
  background: ${({ theme }) => theme.color.primarySoft};
  color: ${({ theme }) => theme.color.text};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 2px 5px;
  font-size: 0.7rem;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  z-index: 1;

  strong {
    display: block;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const NowLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: ${({ theme }) => theme.color.danger};
  z-index: 2;
`;

const minFromStart = (d: Date) =>
  d.getHours() * 60 + d.getMinutes() - BUSINESS_START_MIN;

const hhmm = (slotIndex: number) => {
  const m = BUSINESS_START_MIN + slotIndex * SLOT_MIN;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export default function TimeGrid({
  columns,
  bookings,
  onEmptySlot,
  onBooking,
}: {
  columns: GridColumn[];
  bookings: Booking[];
  onEmptySlot: (roomId: string, date: string, startHHmm: string) => void;
  onBooking: (bookingId: string) => void;
}) {
  const now = new Date();
  const nowTop = (minFromStart(now) / SLOT_MIN) * SLOT_PX;

  return (
    <Scroll>
      <Grid $cols={columns.length}>
        <Corner />
        {columns.map((c) => (
          <ColHead key={c.key}>
            <span>{c.label}</span>
            {c.sublabel && <small>{c.sublabel}</small>}
          </ColHead>
        ))}

        <Gutter>
          {Array.from({ length: SLOT_COUNT / 2 + 1 }).map((_, i) => (
            <HourLabel key={i} style={{ top: i * 2 * SLOT_PX }}>
              {hhmm(i * 2)}
            </HourLabel>
          ))}
        </Gutter>

        {columns.map((c) => {
          const dayBookings = bookings.filter(
            (b) =>
              b.roomId === c.roomId &&
              b.status !== "cancelled" &&
              isSameDay(parseISO(b.start), parseISO(`${c.date}T12:00:00`)),
          );
          const isToday = isSameDay(now, parseISO(`${c.date}T12:00:00`));

          return (
            <Col key={c.key}>
              {Array.from({ length: SLOT_COUNT }).map((_, i) => (
                <Slot
                  key={i}
                  style={{ top: i * SLOT_PX }}
                  aria-label={`Book ${c.label} at ${hhmm(i)}`}
                  onClick={() => onEmptySlot(c.roomId, c.date, hhmm(i))}
                />
              ))}

              {isToday && nowTop >= 0 && nowTop <= TOTAL_H && (
                <NowLine style={{ top: nowTop }} aria-hidden />
              )}

              {dayBookings.map((b) => {
                const s = parseISO(b.start);
                const e = parseISO(b.end);
                const top = Math.max(0, (minFromStart(s) / SLOT_MIN) * SLOT_PX);
                const rawH =
                  ((e.getTime() - s.getTime()) / 60000 / SLOT_MIN) * SLOT_PX;
                const height =
                  Math.min(TOTAL_H - top, Math.max(SLOT_PX, rawH)) - 2;
                return (
                  <Block
                    key={b.id}
                    style={{ top, height }}
                    onClick={() => onBooking(b.id)}
                    title={`${b.title} · ${formatTime(b.start)}–${formatTime(b.end)}`}
                  >
                    <strong>{b.title}</strong>
                    {formatTime(b.start)}–{formatTime(b.end)}
                  </Block>
                );
              })}
            </Col>
          );
        })}
      </Grid>
    </Scroll>
  );
}
