import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIncrementViewMutation } from "@/services/api";

export const useTrackView = (propertyId: string) => {
  const [incrementView] = useIncrementViewMutation();

  useEffect(() => {
    if (!propertyId) return;

    const track = async () => {
      try {
        const storageKey = `viewed_${propertyId}`;
        const hasViewed = await AsyncStorage.getItem(storageKey);

        if (!hasViewed) {
          await incrementView(propertyId).unwrap();
          await AsyncStorage.setItem(storageKey, "true");
        }
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    };

    track();
  }, [propertyId, incrementView]);
};
