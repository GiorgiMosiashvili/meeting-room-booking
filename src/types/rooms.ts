export type Amenity = "projector" | "whiteboard" | "video-conf" | "phone";

export interface Room {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  amenities: Amenity[];
  photoUrl?: string;
  isActive: boolean;
}
