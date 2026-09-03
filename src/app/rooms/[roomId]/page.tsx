import RoomDetailView from "@/components/rooms/room-detail-view";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <RoomDetailView roomId={roomId} />;
}
