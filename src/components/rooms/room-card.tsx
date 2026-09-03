"use client";

// ერთი ოთახის ბარათი სიაში.
import Link from "next/link";
import styled from "styled-components";
import type { Room } from "@/types/rooms";
import { AMENITY_LABEL } from "@/lib/amenities";
import { Badge } from "@/components/ui";

// ბარათი, რომელიც მთლიანად ბმულია.
const Wrap = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: ${({ theme }) => theme.space(4)};
  transition: box-shadow 0.12s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.md};
  }
`;

const Title = styled.h3`
  font-size: 1.05rem;
  margin-bottom: ${({ theme }) => theme.space(1)};
`;

const Meta = styled.p`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.85rem;
  margin-bottom: ${({ theme }) => theme.space(3)};
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(1)};
`;

export default function RoomCard({ room }: { room: Room }) {
  return (
    <Wrap href={`/rooms/${room.id}`}>
      <Title>{room.name}</Title>
      <Meta>
        Floor {room.floor} · {room.capacity}{" "}
        {room.capacity === 1 ? "seat" : "seats"}
        {!room.isActive && " · inactive"}
      </Meta>
      <Tags>
        {room.amenities.length === 0 && <Badge>No amenities</Badge>}
        {room.amenities.map((a) => (
          <Badge key={a}>{AMENITY_LABEL[a]}</Badge>
        ))}
      </Tags>
    </Wrap>
  );
}
