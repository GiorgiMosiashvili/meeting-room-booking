"use client";

// ოთახის ფილტრის dropdown — ყოველ ოთახს ახლავს ფერადი რაოდენობა
// (მწვანე=confirmed, ნარინჯისფერი=past, წითელი=cancelled) მიმდინარე თარიღების დიაპაზონისთვის.
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import type { Room } from "@/types/rooms";
import type { DisplayStatus } from "@/lib/booking-status";
import { Badge } from "@/components/ui";

const Wrap = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.color.surface};
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Chevron = styled.span`
  color: ${({ theme }) => theme.color.textMuted};
  flex-shrink: 0;
`;

const Panel = styled.ul`
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 280px;
  overflow-y: auto;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.md};
  list-style: none;
  padding: 4px;
`;

const Option = styled.li<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
  padding: ${({ theme }) => theme.space(2)};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.85rem;
  cursor: pointer;
  background: ${({ theme, $active }) =>
    $active ? theme.color.primarySoft : "transparent"};

  &:hover {
    background: ${({ theme }) => theme.color.surfaceAlt};
  }
  span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Counts = styled.span`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

const TONE: Record<DisplayStatus, "success" | "warning" | "danger"> = {
  confirmed: "success",
  past: "warning",
  cancelled: "danger",
};

export default function RoomSelect({
  rooms,
  counts,
  value,
  onChange,
}: {
  rooms: Room[];
  counts: Record<string, Record<DisplayStatus, number>>;
  value: string;
  onChange: (roomId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = rooms.find((r) => r.id === value);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <Wrap ref={ref}>
      <Trigger
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selected ? selected.name : "Any room"}</span>
        <Chevron aria-hidden>▾</Chevron>
      </Trigger>

      {open && (
        <Panel role="listbox">
          <Option role="option" $active={!value} onClick={() => pick("")}>
            <span>Any room</span>
          </Option>
          {rooms.map((r) => {
            const c = counts[r.id] ?? { confirmed: 0, past: 0, cancelled: 0 };
            const total = c.confirmed + c.past + c.cancelled;
            return (
              <Option
                key={r.id}
                role="option"
                $active={value === r.id}
                onClick={() => pick(r.id)}
              >
                <span>{r.name}</span>
                <Counts>
                  {total === 0 && <Badge>0</Badge>}
                  {c.confirmed > 0 && (
                    <Badge $tone={TONE.confirmed}>{c.confirmed}</Badge>
                  )}
                  {c.past > 0 && <Badge $tone={TONE.past}>{c.past}</Badge>}
                  {c.cancelled > 0 && (
                    <Badge $tone={TONE.cancelled}>{c.cancelled}</Badge>
                  )}
                </Counts>
              </Option>
            );
          })}
        </Panel>
      )}
    </Wrap>
  );
}
