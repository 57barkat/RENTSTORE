import AsyncStorage from "@react-native-async-storage/async-storage";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenManager = {
  async load() {
    if (accessToken && refreshToken) return;

    const [[, a], [, r]] = await AsyncStorage.multiGet([
      "accessToken",
      "refreshToken",
    ]);

    accessToken = a;
    refreshToken = r;
  },

  getAccessToken() {
    return accessToken;
  },

  getRefreshToken() {
    return refreshToken;
  },

  async setTokens(a: string, r: string) {
    accessToken = a;
    refreshToken = r;

    await AsyncStorage.multiSet([
      ["accessToken", a],
      ["refreshToken", r],
    ]);
  },

  async clear() {
    accessToken = null;
    refreshToken = null;

    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
  },
};
