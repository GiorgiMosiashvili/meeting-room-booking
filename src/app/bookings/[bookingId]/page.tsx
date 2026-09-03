import Link from "next/link";
import { Container } from "@/components/ui";
import BookingDetailView from "@/components/bookings/booking-detail-view";

// სრული გვერდი, პირდაპირი გახსნისას ან refresh-ზე (მოდალის ნაცვლად).
export default async function BookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <Container>
      <Link
        href="/bookings"
        style={{
          display: "inline-block",
          marginBottom: 16,
          fontSize: "0.85rem",
        }}
      >
        ← All bookings
      </Link>
      <BookingDetailView bookingId={bookingId} />
    </Container>
  );
}
