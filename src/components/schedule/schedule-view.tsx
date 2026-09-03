"use client";

// განრიგის გვერდი: day = ოთახები სვეტებში; week = 7 დღე, ერთი ოთახი.
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import { useScheduleParams } from "@/hooks/useScheduleParams";
import { useRooms } from "@/hooks/useRooms";
import { useBookings } from "@/hooks/useBookings";
import {
  Container,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import ScheduleToolbar from "./schedule-toolbar";
import TimeGrid, { type GridColumn } from "./time-grid";

// "HH:mm" + 60 წუთი, ჭერით 24:00.
function plusHour(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = Math.min(h * 60 + m + 60, 24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function ScheduleView() {
  const router = useRouter();
  const { view, date, room, setRoom } = useScheduleParams();
  const rooms = useRooms();
  const activeRooms = useMemo(() => rooms.data ?? [], [rooms.data]);

  // week ხედში ოთახი აუცილებელია, ავტომატურად ავირჩიოთ პირველი.
  useEffect(() => {
    if (view === "week" && !room && activeRooms[0]) setRoom(activeRooms[0].id);
  }, [view, room, activeRooms, setRoom]);

  const d = parseISO(date);
  const weekDays =
    view === "week"
      ? eachDayOfInterval({
          start: startOfWeek(d, { weekStartsOn: 1 }),
          end: addDays(startOfWeek(d, { weekStartsOn: 1 }), 6),
        })
      : [];

  const from = view === "week" ? format(weekDays[0], "yyyy-MM-dd") : date;
  const to = view === "week" ? format(weekDays[6], "yyyy-MM-dd") : date;

  const activeRoomId = room || activeRooms[0]?.id || "";
  const bookings = useBookings({
    from,
    to,
    roomId: view === "week" ? activeRoomId : undefined,
  });

  const goCreate = (roomId: string, dateStr: string, start: string) =>
    router.push(
      `/bookings/new?room=${roomId}&date=${dateStr}&start=${start}&end=${plusHour(start)}`,
    );
  const goBooking = (id: string) => router.push(`/bookings/${id}`);

  const columns: GridColumn[] =
    view === "week"
      ? weekDays.map((day) => ({
          key: format(day, "yyyy-MM-dd"),
          label: format(day, "EEE"),
          sublabel: format(day, "d MMM"),
          roomId: activeRoomId,
          date: format(day, "yyyy-MM-dd"),
        }))
      : activeRooms.map((r) => ({
          key: r.id,
          label: r.name,
          sublabel: `${r.capacity} seats`,
          roomId: r.id,
          date,
        }));

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Schedule</h1>
          <p>
            {view === "day"
              ? "Rooms across the day. Click an empty slot to book it."
              : "One room across the week. Click an empty slot to book it."}
          </p>
        </div>
      </PageHeader>

      <ScheduleToolbar rooms={activeRooms} />

      {rooms.isPending && <Skeleton $h="20rem" />}
      {rooms.isError && (
        <ErrorState
          message={rooms.error.message}
          onRetry={() => rooms.refetch()}
        />
      )}
      {bookings.isError && (
        <ErrorState
          message={bookings.error.message}
          onRetry={() => bookings.refetch()}
        />
      )}

      {rooms.data && activeRooms.length === 0 && (
        <EmptyState title="No active rooms to schedule" />
      )}

      {rooms.data && activeRooms.length > 0 && (
        <TimeGrid
          columns={columns}
          bookings={bookings.data ?? []}
          onEmptySlot={goCreate}
          onBooking={goBooking}
        />
      )}
    </Container>
  );
}
