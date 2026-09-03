"use client";

// ჯავშნის დეტალი, იყენებს გვერდიც და მოდალიც.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { isBookingEditable } from "@/lib/booking-rules";
import { formatDay, formatTime } from "@/lib/datetime";
import { useBooking, useCancelBooking } from "@/hooks/useBookings";
import { useRoom } from "@/hooks/useRooms";
import { useEmployeeMap } from "@/hooks/useEmployees";
import { Button, ErrorState, Skeleton } from "@/components/ui";
import StatusBadge from "./status-badge";
import ConfirmDialog from "@/components/confirm-dialog";

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
  margin-bottom: ${({ theme }) => theme.space(4)};

  h2 {
    font-size: 1.3rem;
  }
`;

const Dl = styled.dl`
  display: grid;
  grid-template-columns: 120px 1fr;
  row-gap: ${({ theme }) => theme.space(2)};
  column-gap: ${({ theme }) => theme.space(3)};
  margin-bottom: ${({ theme }) => theme.space(4)};

  dt {
    color: ${({ theme }) => theme.color.textMuted};
    font-size: 0.85rem;
  }
  dd {
    margin: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space(2)};
  flex-wrap: wrap;
`;

export default function BookingDetailView({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const booking = useBooking(bookingId);
  const cancel = useCancelBooking();
  const [confirming, setConfirming] = useState(false);

  const roomId = booking.data?.roomId ?? "";
  const room = useRoom(roomId);
  const { map: employees } = useEmployeeMap();

  if (booking.isPending) return <Skeleton $h="12rem" />;
  if (booking.isError)
    return (
      <ErrorState
        message={booking.error.message}
        onRetry={() => booking.refetch()}
      />
    );

  const b = booking.data;
  const editable = isBookingEditable(b);
  const attendees = b.attendeeIds
    .map((id) => employees[id]?.name)
    .filter(Boolean);

  return (
    <div>
      <Head>
        <div>
          <h2>{b.title}</h2>
          <div style={{ marginTop: 6 }}>
            <StatusBadge booking={b} />
          </div>
        </div>
        {onClose && (
          <Button $variant="ghost" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        )}
      </Head>

      <Dl>
        <dt>Room</dt>
        <dd>
          {room.data ? (
            <Link href={`/rooms/${room.data.id}`}>{room.data.name}</Link>
          ) : (
            "—"
          )}
        </dd>
        <dt>Date</dt>
        <dd>{formatDay(b.start)}</dd>
        <dt>Time</dt>
        <dd>
          {formatTime(b.start)} – {formatTime(b.end)}
        </dd>
        <dt>Organizer</dt>
        <dd>{employees[b.organizerId]?.name ?? "—"}</dd>
        <dt>Attendees</dt>
        <dd>{attendees.length ? attendees.join(", ") : "None"}</dd>
        {b.description && (
          <>
            <dt>Notes</dt>
            <dd>{b.description}</dd>
          </>
        )}
      </Dl>

      {editable ? (
        <Actions>
          <Button as={Link} href={`/bookings/${b.id}/edit`}>
            Edit
          </Button>
          <Button $variant="ghost" onClick={() => setConfirming(true)}>
            Cancel booking
          </Button>
        </Actions>
      ) : (
        <p style={{ color: "#5b6472", fontSize: "0.9rem" }}>
          {b.status === "cancelled"
            ? "This booking is cancelled."
            : "This booking has already started and can no longer be changed."}
        </p>
      )}

      {confirming && (
        <ConfirmDialog
          title="Cancel this booking?"
          message="The booking will be marked cancelled. This can't be undone."
          confirmLabel="Cancel booking"
          pending={cancel.isPending}
          onCancel={() => setConfirming(false)}
          onConfirm={() =>
            cancel.mutate(b.id, {
              onSuccess: () => {
                setConfirming(false);
                if (onClose) router.back();
              },
            })
          }
        />
      )}
    </div>
  );
}
