import AsyncStorage from "@react-native-async-storage/async-storage";

export const getStoredRole = async () => {
  try {
    return await AsyncStorage.getItem("userRole");
  } catch (e) {
    console.error("Failed to get role", e);
    return null;
  }
};

export const saveUserData = async (data: any) => {
  try {
    await AsyncStorage.multiSet([
      ["userName", data.name],
      ["userEmail", data.email],
      ["userPhone", data.phone],
      ["userId", data.id?.toString() || ""],
    ]);
  } catch (e) {
    console.error("Failed to save user data", e);
  }
};
