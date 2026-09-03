import Link from "next/link";

// მთავარი გვერდი. სრული dashboard მოდის M4-ში.
export default function Home() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "3rem 1rem",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: "1.6rem" }}>Meeting Room Booking</h1>
      <p style={{ color: "#5b6472", marginTop: 8 }}>
        Internal tool for browsing rooms, checking availability and managing
        bookings.
      </p>
      <ul style={{ marginTop: 16 }}>
        <li>
          <Link href="/rooms">Browse rooms →</Link>
        </li>
      </ul>
    </main>
  );
}
