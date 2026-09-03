"use client";

// დროებითი გვერდი — ამოწმებს server/client მიჯნას და მონაცემთა ფენას.
// წაშალე M1-ის დაწყებამდე.
import { useRooms } from "@/hooks/useRooms";
import { useBookings } from "@/hooks/useBookings";
import { resetDb } from "@/data/db";

export default function ScratchPage() {
  const rooms = useRooms();
  const bookings = useBookings();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", lineHeight: 1.6 }}>
      <h1>Data layer smoke test</h1>

      <section>
        <h2>Rooms</h2>
        {rooms.isPending && <p>Loading…</p>}
        {rooms.isError && (
          <p style={{ color: "crimson" }}>{rooms.error.message}</p>
        )}
        {rooms.data && (
          <ul>
            {rooms.data.map((r) => (
              <li key={r.id}>
                {r.name} — floor {r.floor}, seats {r.capacity} [
                {r.amenities.join(", ")}]
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Bookings ({bookings.data?.length ?? 0})</h2>
        {bookings.isPending && <p>Loading…</p>}
        {bookings.isError && (
          <p style={{ color: "crimson" }}>{bookings.error.message}</p>
        )}
        {bookings.data && (
          <ul>
            {bookings.data.slice(0, 10).map((b) => (
              <li key={b.id}>
                {b.title} — {new Date(b.start).toLocaleString()} ({b.status})
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={() => {
          resetDb();
          location.reload();
        }}
      >
        Reset DB &amp; reload
      </button>
    </main>
  );
}
