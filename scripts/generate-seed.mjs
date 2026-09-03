// ჯავშნების საწყისი მონაცემების გენერატორი.
// წერს src/data/bookings.json-ს offset-ებით (dayOffset + startTime/endTime),
// რომელსაც db.ts პირველ გაშვებაზე აქცევს რეალურ თარიღებად.
// გაშვება: npm run seed

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "src", "data");

// PRNG (mulberry32), ყოველ გაშვებაზე ერთი იყოს
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260903);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const chance = (p) => rand() < p;
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));

// საწყისი მონაცემები
const rooms = JSON.parse(readFileSync(join(dataDir, "rooms.json"), "utf8"));
const employees = JSON.parse(
  readFileSync(join(dataDir, "employees.json"), "utf8"),
);
const activeRooms = rooms.filter((r) => r.isActive);

// ფიქსირებული საწყისი დღე (ხუთშაბათი) შაბათ-კვირის დათვლა
const ANCHOR_DOW = 4;
const isWeekend = (dayOffset) => {
  const dow = (((ANCHOR_DOW + dayOffset) % 7) + 7) % 7;
  return dow === 0 || dow === 6;
};

const TITLES = [
  "Sprint planning",
  "Sprint retro",
  "Backlog refinement",
  "Daily standup",
  "1:1 – Design",
  "1:1 – Engineering",
  "Design critique",
  "Product review",
  "Roadmap sync",
  "Client call – Acme",
  "Client call – Globex",
  "Interview – Frontend",
  "Interview – Backend",
  "Onboarding session",
  "All-hands",
  "Budget review",
  "Sales pipeline review",
  "Marketing sync",
  "Architecture review",
  "Incident postmortem",
  "Vendor demo",
  "Lunch & learn",
  "Security review",
  "QA sync",
  "Release planning",
];
const DESCRIPTIONS = [
  "Agenda in the shared doc.",
  "Bring laptops.",
  "Remote attendees on the call link.",
  "Follow-up from last week.",
  "Decisions needed by EOD.",
  "Slides to be shared after.",
];

//  ერთი დღის, ერთი ოთახის ჯავშნების განლაგება (გადაფარვის გარეშე)
const fmt = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

function bookingsForRoomDay(room, dayOffset, busyness) {
  const out = [];
  const taken = []; // [startMin, endMin] წყვილები, გადაფარვის შესამოწმებლად
  const expected = (isWeekend(dayOffset) ? 0.25 : 1.6) * busyness;
  const count = Math.floor(expected) + (chance(expected % 1) ? 1 : 0);

  for (let i = 0; i < count; i++) {
    // შუაღამემდე მიმავალი ჯავშანი (24:00 წესის შესამოწმებლად)
    const lateNight = chance(0.04);
    const startMin = lateNight ? 22 * 60 : int(16, 40) * 30; // 08:00–20:00
    const durMin = lateNight ? 120 : pick([30, 60, 60, 90, 120, 90]);
    const endMin = startMin + durMin;
    if (endMin > 24 * 60) continue;
    if (taken.some(([s, e]) => startMin < e && s < endMin)) continue;
    taken.push([startMin, endMin]);

    const capAttendees = Math.max(0, Math.min(6, room.capacity - 1));
    const nAtt = int(0, capAttendees);
    const attendeeIds = [...employees]
      .sort(() => rand() - 0.5)
      .slice(0, nAtt)
      .map((e) => e.id);

    out.push({
      roomId: room.id,
      title: pick(TITLES),
      organizerId: pick(employees).id,
      attendeeIds,
      status: chance(0.08) ? "cancelled" : "confirmed",
      dayOffset,
      startTime: fmt(startMin),
      endTime: endMin === 24 * 60 ? "24:00" : fmt(endMin),
      ...(chance(0.3) ? { description: pick(DESCRIPTIONS) } : {}),
    });
  }
  return out;
}

// გენერაცია
const busynessByRoom = new Map(
  activeRooms.map((r) => [r.id, 0.2 + rand() * 0.7]),
);
let records = [];
for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
  for (const room of activeRooms) {
    records.push(
      ...bookingsForRoomDay(room, dayOffset, busynessByRoom.get(room.id)),
    );
  }
}

// გარანტირებული მიმდინარე ჯავშნები დღეს
for (const room of activeRooms.slice(0, 2)) {
  records.push({
    roomId: room.id,
    title: pick(TITLES),
    organizerId: pick(employees).id,
    attendeeIds: employees.slice(0, 3).map((e) => e.id),
    status: "confirmed",
    dayOffset: 0,
    startTime: "09:00",
    endTime: "17:00",
    description: "All-day working session.",
  });
}

// მოცულობის შეზღუდვა 45–75 ჩანაწერამდე
records.sort(
  (a, b) => a.dayOffset - b.dayOffset || a.startTime.localeCompare(b.startTime),
);
if (records.length > 75) {
  const step = records.length / 65;
  records = records.filter(
    (_, i) => Math.floor(i / step) !== Math.floor((i - 1) / step),
  );
}

writeFileSync(
  join(dataDir, "bookings.json"),
  JSON.stringify(records, null, 2) + "\n",
  "utf8",
);
console.log(`wrote ${records.length} bookings to src/data/bookings.json`);
