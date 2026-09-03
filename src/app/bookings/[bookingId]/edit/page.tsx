import { Suspense } from "react";
import BookingForm from "@/components/bookings/booking-form";

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return (
    <Suspense>
      <BookingForm mode="edit" bookingId={bookingId} />
    </Suspense>
  );
}
