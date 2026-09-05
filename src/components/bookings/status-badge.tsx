"use client";

// ჯავშნის სტატუსის ჭდე + "წარსული/მიმდინარე" მინიშნება.
import { isPast } from "date-fns";
import type { Booking } from "@/types/booking";
import { Badge } from "@/components/ui";

export default function StatusBadge({ booking }: { booking: Booking }) {
  if (booking.status === "cancelled") {
    return <Badge $tone="danger">Cancelled</Badge>;
  }
  const started = isPast(new Date(booking.start));
  const ended = isPast(new Date(booking.end));
  if (ended) return <Badge $tone="warning">Past</Badge>;
  if (started) return <Badge $tone="success">In progress</Badge>;
  return <Badge $tone="success">Confirmed</Badge>;
}
