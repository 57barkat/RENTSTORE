import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";

export const tokenManager = {
  async load() {
    this.accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    this.refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    console.log("Storing refresh token:", accessToken);
    console.log("Type of refresh token:", typeof refreshToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  getAccessToken() {
    return this.accessToken;
  },

  getRefreshToken() {
    return this.refreshToken;
  },

  async clear() {
    this.accessToken = null;
    this.refreshToken = null;
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  accessToken: null as string | null,
  refreshToken: null as string | null,
};
