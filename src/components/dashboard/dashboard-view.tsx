"use client";

// დაშბორდი: მოკლე მიმოხილვა + ღრმა ბმულები გაფილტრულ ხედებში.
import Link from "next/link";
import styled from "styled-components";
import {
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfWeek,
} from "date-fns";
import { useRooms } from "@/hooks/useRooms";
import { useBookings } from "@/hooks/useBookings";
import {
  bookingCountByRoom,
  roomIdsInUse,
  upcoming,
  utilisationPct,
} from "@/lib/dashboard";
import { formatRange, formatTime } from "@/lib/datetime";
import {
  Button,
  Card,
  Container,
  ErrorState,
  PageHeader,
  Skeleton,
} from "@/components/ui";

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.space(3)};
  margin-bottom: ${({ theme }) => theme.space(4)};

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Stat = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: ${({ theme }) => theme.space(4)};

  .n {
    font-size: 1.8rem;
    font-weight: 700;
  }
  .l {
    color: ${({ theme }) => theme.color.textMuted};
    font-size: 0.85rem;
  }
  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: ${({ theme }) => theme.space(3)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr;
  }
`;

const H2 = styled.h2`
  font-size: 1.05rem;
  margin-bottom: ${({ theme }) => theme.space(2)};
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(2)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  font-size: 0.9rem;

  &:last-child {
    border-bottom: none;
  }
  span {
    color: ${({ theme }) => theme.color.textMuted};
  }
`;

const Bar = styled.div<{ $pct: number }>`
  height: 8px;
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ theme }) => theme.color.surfaceAlt};
  margin-top: 4px;
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${({ theme }) => theme.color.primary};
  }
`;

const Muted = styled.p`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.9rem;
  padding: ${({ theme }) => theme.space(2)} 0;
`;

const today = format(new Date(), "yyyy-MM-dd");

export default function DashboardView() {
  const rooms = useRooms();
  const bookings = useBookings({});

  if (rooms.isPending || bookings.isPending) {
    return (
      <Container>
        <Skeleton $h="6rem" />
        <div style={{ marginTop: 16 }}>
          <Skeleton $h="16rem" />
        </div>
      </Container>
    );
  }
  if (rooms.isError || bookings.isError) {
    return (
      <Container>
        <ErrorState
          message={
            rooms.error?.message ?? bookings.error?.message ?? "Failed to load"
          }
          onRetry={() => {
            rooms.refetch();
            bookings.refetch();
          }}
        />
      </Container>
    );
  }

  const now = new Date();
  const allRooms = rooms.data;
  const roomById = Object.fromEntries(allRooms.map((r) => [r.id, r]));
  const all = bookings.data;

  const inUse = roomIdsInUse(all, now);
  const freeCount = allRooms.length - inUse.size;
  const util = utilisationPct(all, allRooms.length, now);
  const todays = all.filter(
    (b) => b.status !== "cancelled" && b.start.slice(0, 10) === today,
  );
  const next = upcoming(all, now, 5);

  const weekInterval = {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
  const weekBookings = all.filter((b) =>
    isWithinInterval(parseISO(b.start), weekInterval),
  );
  const counts = bookingCountByRoom(weekBookings);
  const ranked = allRooms
    .map((r) => ({ room: r, count: counts[r.id] ?? 0 }))
    .sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ranked[0]?.count ?? 0);

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Dashboard</h1>
          <p>What&apos;s happening across the office right now.</p>
        </div>
        <Button as={Link} href="/bookings/new">
          + Book a room
        </Button>
      </PageHeader>

      <Stats>
        <Stat href={`/schedule?date=${today}`}>
          <div className="n">
            {inUse.size}
            <span style={{ fontSize: "1rem", fontWeight: 400 }}>
              {" "}
              / {allRooms.length}
            </span>
          </div>
          <div className="l">Rooms in use now</div>
        </Stat>
        <Stat href="/rooms">
          <div className="n">{freeCount}</div>
          <div className="l">Free right now</div>
        </Stat>
        <Stat href={`/schedule?date=${today}`}>
          <div className="n">{util}%</div>
          <div className="l">Today&apos;s utilisation</div>
        </Stat>
        <Stat href={`/bookings?from=${today}&to=${today}`}>
          <div className="n">{todays.length}</div>
          <div className="l">Bookings today</div>
        </Stat>
      </Stats>

      <Cols>
        <div style={{ display: "grid", gap: 12 }}>
          <Card>
            <H2>Happening now</H2>
            {inUse.size === 0 && <Muted>Every room is free.</Muted>}
            {[...inUse].map((roomId) => {
              const b = all.find(
                (x) =>
                  x.roomId === roomId &&
                  x.status !== "cancelled" &&
                  parseISO(x.start) <= now &&
                  now < parseISO(x.end),
              );
              return (
                <Item key={roomId}>
                  <Link href={`/rooms/${roomId}`}>
                    {roomById[roomId]?.name ?? roomId}
                  </Link>
                  <span>
                    {b?.title} · until {b ? formatTime(b.end) : ""}
                  </span>
                </Item>
              );
            })}
          </Card>

          <Card>
            <H2>Coming up</H2>
            {next.length === 0 && <Muted>No upcoming bookings.</Muted>}
            {next.map((b) => (
              <Item key={b.id}>
                <Link href={`/bookings/${b.id}`}>{b.title}</Link>
                <span>
                  {roomById[b.roomId]?.name} · {formatRange(b.start, b.end)}
                </span>
              </Item>
            ))}
          </Card>
        </div>

        <Card>
          <H2>Busiest rooms this week</H2>
          {ranked.slice(0, 6).map(({ room, count }) => (
            <div key={room.id} style={{ padding: "8px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <Link href={`/bookings?room=${room.id}`}>{room.name}</Link>
                <span style={{ color: "#5b6472" }}>{count}</span>
              </div>
              <Bar $pct={(count / maxCount) * 100} />
            </div>
          ))}
        </Card>
      </Cols>
    </Container>
  );
}
