"use client";

// ოთახების სიის გვერდი: ფილტრები + ბარათების ბადე + loading/empty/error.
import styled from "styled-components";
import { useRooms } from "@/hooks/useRooms";
import { useRoomFilters } from "@/hooks/useRoomFilters";
import {
  Container,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from "@/components/ui";
import RoomFilters from "./room-filters";
import RoomCard from "./room-card";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.space(3)};
`;

const SkeletonCard = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.space(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
`;

export default function RoomsView() {
  const { filters, isActive, reset } = useRoomFilters();
  const rooms = useRooms(filters);

  return (
    <Container>
      <PageHeader>
        <div>
          <h1>Rooms</h1>
          <p>Browse and filter the company&apos;s meeting rooms.</p>
        </div>
      </PageHeader>

      <RoomFilters count={rooms.data?.length} />

      {rooms.isPending && (
        <Grid>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i}>
              <Skeleton $h="1.2rem" $w="60%" />
              <Skeleton $h="0.9rem" $w="40%" />
              <Skeleton $h="1.5rem" $w="80%" />
            </SkeletonCard>
          ))}
        </Grid>
      )}

      {rooms.isError && (
        <ErrorState
          message={rooms.error.message}
          onRetry={() => rooms.refetch()}
        />
      )}

      {rooms.data && rooms.data.length === 0 && (
        <EmptyState
          title="No rooms match your filters"
          message={
            isActive
              ? "Try widening or clearing the filters."
              : "There are no rooms to show."
          }
          action={
            isActive ? (
              <button onClick={reset} style={{ cursor: "pointer" }}>
                Clear filters
              </button>
            ) : undefined
          }
        />
      )}

      {rooms.data && rooms.data.length > 0 && (
        <Grid>
          {rooms.data.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </Grid>
      )}
    </Container>
  );
}
