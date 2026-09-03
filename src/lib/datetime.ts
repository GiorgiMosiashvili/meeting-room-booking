// თარიღ-დროის დამხმარეები (ფორმატირება + ფორმის slot-ები).
import { format, parseISO } from "date-fns";
import {
  BUSINESS_END_MIN,
  BUSINESS_START_MIN,
  SLOT_MINUTES,
} from "@/lib/booking-rules";

// "EEE d MMM, HH:mm–HH:mm", ჯავშნის დროის დიაპაზონი.
export function formatRange(startIso: string, endIso: string): string {
  const s = parseISO(startIso);
  const e = parseISO(endIso);
  return `${format(s, "EEE d MMM, HH:mm")}–${format(e, "HH:mm")}`;
}

export function formatDay(iso: string): string {
  return format(parseISO(iso), "EEEE, d MMMM yyyy");
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), "HH:mm");
}

// ფორმის drop-down-ისთვის: "08:00" ... "24:00" ნახევარსაათიანი ბიჯით.
export const TIME_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let m = BUSINESS_START_MIN; m <= BUSINESS_END_MIN; m += SLOT_MINUTES) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    out.push(`${hh}:${mm}`);
  }
  return out;
})();

// "yyyy-MM-dd" + "HH:mm" → ISO სტრიქონი. "24:00" → მეორე დღის 00:00.
export function toIso(date: string, time: string): string {
  const [h, min] = time.split(":").map(Number);
  const d = parseISO(`${date}T00:00:00`);
  d.setHours(h, min, 0, 0);
  return d.toISOString();
}

// ISO → { date: "yyyy-MM-dd", time: "HH:mm" } ფორმის ველებისთვის.
export function fromIso(iso: string): { date: string; time: string } {
  const d = parseISO(iso);
  return { date: format(d, "yyyy-MM-dd"), time: format(d, "HH:mm") };
}
