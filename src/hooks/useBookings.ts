"use client";

// ჯავშნების Query/Mutation ჰუკები. მუტაციები invalidate-ს აკეთებენ და toast-ს აჩვენებენს.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UpdateBookingInput, CreateBookingInput } from "@/types/booking";
import {
  cancelBooking,
  createBooking,
  getBooking,
  listBookings,
  updateBooking,
  type BookingFilters,
} from "@/lib/api/bookings";

// ჯავშნების სია ფილტრებით.
export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => listBookings(filters),
  });
}

// ერთი ჯავშანი id-ით.
export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id),
    enabled: Boolean(id),
  });
}

// ახალი ჯავშნის შექმნა.
export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => createBooking(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking created.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ჯავშნის ცვლა.
export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; patch: UpdateBookingInput }) =>
      updateBooking(args.id, args.patch),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["booking", booking.id] });
      toast.success("Booking updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ჯავშნის გაუქმება.
export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["booking", booking.id] });
      toast.success("Booking cancelled.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
