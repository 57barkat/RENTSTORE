import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UploadIndex() {
  const router = useRouter();

  useEffect(() => {
    const checkSeen = async () => {
      const seen = await AsyncStorage.getItem("seen");

      if (seen === "true") {
        router.replace("/upload/CreateStep");
      } else {
        router.replace("/upload/IntroStep1");
      }
    };

    checkSeen();
  }, [router]);

  return null;
}
