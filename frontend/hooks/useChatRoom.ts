import { useCreateRoomMutation } from "@/hooks/chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

export const useChatRoom = (ownerId?: string) => {
  const router = useRouter();
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();

  const handleChatOwner = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId || !ownerId) {
        Alert.alert(
          !userId ? "Login Required" : "Error",
          !userId
            ? "Please login to contact the host."
            : "Owner information is missing.",
          [
            { text: "Cancel" },
            { text: "Login", onPress: () => router.push("/login") },
          ],
        );
        return;
      }

      const participants: string[] = [userId, ownerId];

      const room: any = await createRoom({ participants }).unwrap();

      router.push({
        pathname: "/chat/[roomId]",
        params: { roomId: room._id, otherUserId: ownerId },
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Chat Error", "Could not start conversation.");
    }
  };

  return { handleChatOwner, isCreating };
};
