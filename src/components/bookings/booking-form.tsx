"use client";

// ჯავშნის შექმნის/რედაქტირების ფორმა. RHF + Zod, წესები booking-rules-იდან.
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { parseISO } from "date-fns";
import { validateBooking, isBookingEditable } from "@/lib/booking-rules";
import { TIME_SLOTS, toIso, fromIso } from "@/lib/datetime";
import { useRooms } from "@/hooks/useRooms";
import { useEmployees } from "@/hooks/useEmployees";
import {
  useBooking,
  useBookings,
  useCreateBooking,
  useUpdateBooking,
} from "@/hooks/useBookings";
import {
  Button,
  Container,
  ErrorList,
  ErrorState,
  Field,
  FieldError,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Textarea,
} from "@/components/ui";

const FormSchema = z.object({
  roomId: z.string().min(1, "Pick a room"),
  title: z.string().min(1, "Title is required"),
  organizerId: z.string().min(1, "Pick an organizer"),
  attendeeIds: z.array(z.string()),
  date: z.string().min(1, "Pick a date"),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof FormSchema>;

const Grid = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.space(3)};
  max-width: 640px;

  .full {
    grid-column: 1 / -1;
  }
  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    grid-template-columns: 1fr;
  }
`;

const AttendeeBox = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.space(1)};
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: ${({ theme }) => theme.space(2)};

  label {
    display: flex;
    gap: ${({ theme }) => theme.space(1)};
    font-size: 0.85rem;
    font-weight: 400;
  }
`;

function CreateOrEditForm({
  mode,
  bookingId,
  defaults,
}: {
  mode: "create" | "edit";
  bookingId?: string;
  defaults: FormValues;
}) {
  const router = useRouter();
  const rooms = useRooms();
  const employees = useEmployees();
  const create = useCreateBooking();
  const update = useUpdateBooking();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: defaults,
  });

  // useWatch (და არა watch()), compiler-თან თავსებადი.
  const roomId = useWatch({ control, name: "roomId" });
  const date = useWatch({ control, name: "date" });
  const startTime = useWatch({ control, name: "startTime" });
  const endTime = useWatch({ control, name: "endTime" });

  // ამ ოთახის არსებული ჯავშნები, კონფლიქტის შესამოწმებლად.
  const roomBookings = useBookings({ roomId: roomId || undefined });

  // ცოცხალი ვალიდაცია (დრო + კონფლიქტი) submit-მდე.
  const ruleErrors = useMemo(() => {
    if (!roomId || !date || !startTime || !endTime) return [];
    const startIso = toIso(date, startTime);
    const endIso = toIso(date, endTime);
    const res = validateBooking(
      { roomId, start: parseISO(startIso), end: parseISO(endIso) },
      roomBookings.data ?? [],
      { ignoreId: bookingId },
    );
    return res.errors;
  }, [roomId, date, startTime, endTime, roomBookings.data, bookingId]);

  const pending = create.isPending || update.isPending;

  const onSubmit = (v: FormValues) => {
    if (ruleErrors.length) return;
    const payload = {
      roomId: v.roomId,
      title: v.title,
      organizerId: v.organizerId,
      attendeeIds: v.attendeeIds,
      start: toIso(v.date, v.startTime),
      end: toIso(v.date, v.endTime),
      description: v.description || undefined,
    };

    if (mode === "create") {
      create.mutate(payload, {
        onSuccess: (b) => router.push(`/bookings/${b.id}`),
      });
    } else if (bookingId) {
      update.mutate(
        { id: bookingId, patch: payload },
        { onSuccess: (b) => router.push(`/bookings/${b.id}`) },
      );
    }
  };

  return (
    <Grid onSubmit={handleSubmit(onSubmit)}>
      <Field className="full">
        Title
        <Input {...register("title")} placeholder="Sprint planning" />
        {errors.title && <FieldError>{errors.title.message}</FieldError>}
      </Field>

      <Field>
        Room
        <Select {...register("roomId")}>
          <option value="">Select…</option>
          {(rooms.data ?? []).map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.capacity})
            </option>
          ))}
        </Select>
        {errors.roomId && <FieldError>{errors.roomId.message}</FieldError>}
      </Field>

      <Field>
        Organizer
        <Select {...register("organizerId")}>
          <option value="">Select…</option>
          {(employees.data ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </Select>
        {errors.organizerId && (
          <FieldError>{errors.organizerId.message}</FieldError>
        )}
      </Field>

      <Field>
        Date
        <Input type="date" {...register("date")} />
      </Field>

      <div />

      <Field>
        Start
        <Select {...register("startTime")}>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        End
        <Select {...register("endTime")}>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </Field>

      <Controller
        control={control}
        name="attendeeIds"
        render={({ field }) => (
          <AttendeeBox>
            {(employees.data ?? []).map((e) => (
              <label key={e.id}>
                <input
                  type="checkbox"
                  checked={field.value.includes(e.id)}
                  onChange={(ev) =>
                    field.onChange(
                      ev.target.checked
                        ? [...field.value, e.id]
                        : field.value.filter((id: string) => id !== e.id),
                    )
                  }
                />
                {e.name}
              </label>
            ))}
          </AttendeeBox>
        )}
      />

      <Field className="full">
        Notes (optional)
        <Textarea {...register("description")} />
      </Field>

      {ruleErrors.length > 0 && (
        <ErrorList className="full">
          {ruleErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ErrorList>
      )}

      <div className="full">
        <Button type="submit" disabled={pending || ruleErrors.length > 0}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create booking"
              : "Save changes"}
        </Button>
      </div>
    </Grid>
  );
}

export default function BookingForm({
  mode,
  bookingId,
}: {
  mode: "create" | "edit";
  bookingId?: string;
}) {
  const search = useSearchParams();
  const existing = useBooking(bookingId ?? "");

  if (mode === "edit") {
    if (existing.isPending)
      return (
        <Container>
          <Skeleton $h="16rem" />
        </Container>
      );
    if (existing.isError)
      return (
        <Container>
          <ErrorState
            message={existing.error.message}
            onRetry={() => existing.refetch()}
          />
        </Container>
      );
    if (!isBookingEditable(existing.data))
      return (
        <Container>
          <PageHeader>
            <h1>Can&apos;t edit this booking</h1>
          </PageHeader>
          <p>
            It is cancelled or has already started.{" "}
            <Link href={`/bookings/${bookingId}`}>Back to booking</Link>
          </p>
        </Container>
      );
  }

  const b = existing.data;
  const start = b ? fromIso(b.start) : null;
  const end = b ? fromIso(b.end) : null;

  const defaults: FormValues = {
    roomId: b?.roomId ?? search.get("room") ?? "",
    title: b?.title ?? "",
    organizerId: b?.organizerId ?? "",
    attendeeIds: b?.attendeeIds ?? [],
    date: start?.date ?? search.get("date") ?? "",
    startTime: start?.time ?? search.get("start") ?? "09:00",
    endTime: end?.time ?? search.get("end") ?? "10:00",
    description: b?.description ?? "",
  };

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>{mode === "create" ? "New booking" : "Edit booking"}</h1>
        </div>
      </PageHeader>
      <CreateOrEditForm mode={mode} bookingId={bookingId} defaults={defaults} />
    </Container>
  );
}
