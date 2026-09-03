"use client";

// /bookings/[id]-ის interception, სიიდან გახსნისას მოდალად ჩნდება.
import { use } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal";
import BookingDetailView from "@/components/bookings/booking-detail-view";

export default function InterceptedBookingModal({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const router = useRouter();
  return (
    <Modal>
      <BookingDetailView bookingId={bookingId} onClose={() => router.back()} />
    </Modal>
  );
}
