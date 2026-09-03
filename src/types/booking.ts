import { z } from "zod";

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  organizerId: string;
  attendeeIds: string[];
  start: string;
  end: string;
  description?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SeedBooking {
  roomId: string;
  title: string;
  organizerId: string;
  attendeeIds: string[];
  status?: BookingStatus;
  dayOffset: number;
  startTime: string;
  endTime: string;
  description?: string;
}
export const CreateBookingSchema = z.object({
  roomId: z.string(),
  title: z.string().min(1),
  organizerId: z.string(),
  attendeeIds: z.array(z.string()),
  start: z.iso.datetime(),
  end: z.iso.datetime(),
  description: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export const UpdateBookingSchema = CreateBookingSchema.partial();
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;
