// აღჭურვილობის ეტიკეტები და იკონები UI-სთვის.
import type { Amenity } from "@/types/rooms";

export const AMENITIES: { value: Amenity; label: string; icon: string }[] = [
  { value: "projector", label: "Projector", icon: "📽️" },
  { value: "whiteboard", label: "Whiteboard", icon: "🖊️" },
  { value: "video-conf", label: "Video conf.", icon: "📹" },
  { value: "phone", label: "Phone", icon: "☎️" },
];

export const AMENITY_LABEL: Record<Amenity, string> = Object.fromEntries(
  AMENITIES.map((a) => [a.value, a.label]),
) as Record<Amenity, string>;

// URL parsing-ისთვის დაშვებული მნიშვნელობების სია.
export const AMENITY_VALUES: Amenity[] = AMENITIES.map((a) => a.value);
