import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/bookings/booking-form";

export const metadata: Metadata = { title: "New booking" };

export default function NewBookingPage() {
  return (
    <Suspense>
      <BookingForm mode="create" />
    </Suspense>
  );
}
