export class CreateRoomDto {
  participants: string[];
  propertyId?: string;
}

export interface ChatRoomType {
  _id: string;
  participants: string[];
  propertyId?: string;
  isGroup: boolean;
  lastMessage?: string;
  updatedAt?: Date;
}

export class SendMessageDto {
  chatRoomId: string;
  text: string;
}
