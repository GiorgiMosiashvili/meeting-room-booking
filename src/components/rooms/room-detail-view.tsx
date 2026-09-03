"use client";

// ერთი ოთახის დეტალის გვერდი: სრული ინფო + ამ ოთახის მომავალი ჯავშნები.
import Link from "next/link";
import styled from "styled-components";
import { format, isAfter, parseISO } from "date-fns";
import { useRoom } from "@/hooks/useRooms";
import { useBookings } from "@/hooks/useBookings";
import { useEmployeeMap } from "@/hooks/useEmployees";
import { AMENITIES, AMENITY_LABEL } from "@/lib/amenities";
import {
  Badge,
  Card,
  Container,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from "@/components/ui";

const Back = styled(Link)`
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.space(3)};
  font-size: 0.85rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: ${({ theme }) => theme.space(4)};

  @media (max-width: ${({ theme }) => theme.breakpoint.md}) {
    grid-template-columns: 1fr;
  }
`;

const Info = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};

  dt {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.color.textMuted};
  }
  dd {
    margin: 0 0 ${({ theme }) => theme.space(2)};
    font-weight: 600;
  }
`;

const BookingRow = styled.li`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
  padding: ${({ theme }) => theme.space(3)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};

  &:last-child {
    border-bottom: none;
  }
  span {
    color: ${({ theme }) => theme.color.textMuted};
    font-size: 0.85rem;
  }
`;

export default function RoomDetailView({ roomId }: { roomId: string }) {
  const room = useRoom(roomId);
  const bookings = useBookings({ roomId });
  const { map: employees } = useEmployeeMap();

  if (room.isPending) {
    return (
      <Container>
        <Back href="/rooms">← All rooms</Back>
        <Skeleton $h="2rem" $w="240px" />
        <div style={{ marginTop: 24 }}>
          <Skeleton $h="12rem" />
        </div>
      </Container>
    );
  }

  if (room.isError) {
    return (
      <Container>
        <Back href="/rooms">← All rooms</Back>
        <ErrorState
          message={room.error.message}
          onRetry={() => room.refetch()}
        />
      </Container>
    );
  }

  const r = room.data;
  const now = new Date();
  const upcoming = (bookings.data ?? [])
    .filter((b) => b.status !== "cancelled" && isAfter(parseISO(b.start), now))
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <Container>
      <Back href="/rooms">← All rooms</Back>

      <PageHeader>
        <div>
          <h1>{r.name}</h1>
          <p>
            Floor {r.floor} · {r.capacity} {r.capacity === 1 ? "seat" : "seats"}
          </p>
        </div>
        <Badge $tone={r.isActive ? "success" : "danger"}>
          {r.isActive ? "Active" : "Inactive"}
        </Badge>
      </PageHeader>

      <Grid>
        <Info as="dl">
          <div>
            <dt>Capacity</dt>
            <dd>{r.capacity} people</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>Floor {r.floor}</dd>
          </div>
          <div>
            <dt>Amenities</dt>
            <dd
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                fontWeight: 400,
              }}
            >
              {r.amenities.length === 0 && "None"}
              {AMENITIES.filter((a) => r.amenities.includes(a.value)).map(
                (a) => (
                  <Badge key={a.value}>
                    {a.icon} {AMENITY_LABEL[a.value]}
                  </Badge>
                ),
              )}
            </dd>
          </div>
        </Info>

        <Card>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 8 }}>
            Upcoming bookings
          </h2>

          {bookings.isPending && <Skeleton $h="6rem" />}
          {bookings.isError && (
            <ErrorState
              message={bookings.error.message}
              onRetry={() => bookings.refetch()}
            />
          )}
          {bookings.data && upcoming.length === 0 && (
            <EmptyState
              title="No upcoming bookings"
              message="This room is free for the foreseeable future."
            />
          )}
          {upcoming.length > 0 && (
            <ul style={{ listStyle: "none" }}>
              {upcoming.map((b) => (
                <BookingRow key={b.id}>
                  <div>
                    <Link href={`/bookings/${b.id}`}>{b.title}</Link>
                    <br />
                    <span>{employees[b.organizerId]?.name ?? "Unknown"}</span>
                  </div>
                  <span>
                    {format(parseISO(b.start), "EEE d MMM, HH:mm")}–
                    {format(parseISO(b.end), "HH:mm")}
                  </span>
                </BookingRow>
              ))}
            </ul>
          )}
        </Card>
      </Grid>
    </Container>
  );
}
