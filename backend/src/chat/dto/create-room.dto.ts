export class CreateRoomDto {
  participants: string[];
  name?: string;
}
export interface ChatRoomType {
  _id: string;
  participants: string[];
  propertyId?: string;
  isGroup: boolean;
  lastMessage?: string;
}
