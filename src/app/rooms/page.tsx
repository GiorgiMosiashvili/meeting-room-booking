import type { Metadata } from "next";
import { Suspense } from "react";
import RoomsView from "@/components/rooms/rooms-view";

export const metadata: Metadata = { title: "Rooms" };

export default function RoomsPage() {
  // nuqs (useSearchParams) მოითხოვს Suspense-ს სტატიკური prerender-ისთვის.
  return (
    <Suspense>
      <RoomsView />
    </Suspense>
  );
}
