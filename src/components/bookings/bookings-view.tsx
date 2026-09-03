"use client";

// ჯავშნების სიის გვერდი: ფილტრები + სია + "New booking" + loading/empty/error.
import Link from "next/link";
import { useBookings } from "@/hooks/useBookings";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import {
  Button,
  Container,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import BookingFilters from "./booking-filters";
import BookingsList from "./bookings-list";

export default function BookingsView() {
  const { filters, isActive, reset } = useBookingFilters();
  const bookings = useBookings(filters);

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Bookings</h1>
          <p>Search, filter and manage room bookings.</p>
        </div>
        <Button as={Link} href="/bookings/new">
          + New booking
        </Button>
      </PageHeader>

      <BookingFilters count={bookings.data?.length} />

      {bookings.isPending && <Skeleton $h="12rem" />}

      {bookings.isError && (
        <ErrorState
          message={bookings.error.message}
          onRetry={() => bookings.refetch()}
        />
      )}

      {bookings.data && bookings.data.length === 0 && (
        <EmptyState
          title="No bookings match"
          message={
            isActive
              ? "Try clearing some filters."
              : "Create the first booking to get started."
          }
          action={
            isActive ? (
              <Button $variant="ghost" onClick={reset}>
                Clear filters
              </Button>
            ) : (
              <Button as={Link} href="/bookings/new">
                New booking
              </Button>
            )
          }
        />
      )}

      {bookings.data && bookings.data.length > 0 && (
        <BookingsList bookings={bookings.data} />
      )}
    </Container>
  );
}
