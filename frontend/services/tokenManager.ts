import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";
const PHONE_VERIFIED_KEY = "IS_PHONE_VERIFIED";
const USER_DATA_KEY = "USER_DATA";

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private userData: any | null = null;
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;

    try {
      const [access, refresh, user] = await AsyncStorage.multiGet([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_DATA_KEY,
      ]);

      this.accessToken = access[1];
      this.refreshToken = refresh[1];
      this.userData = user[1] ? JSON.parse(user[1]) : null;
    } catch (error) {
      console.warn("TokenManager load failed:", error);
    } finally {
      this.loaded = true;
    }
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    try {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, accessToken],
        [REFRESH_TOKEN_KEY, refreshToken],
      ]);
    } catch (error) {
      console.warn("TokenManager setTokens failed:", error);
    }
  }

  async setUserData(user: any): Promise<void> {
    this.userData = user;
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn("TokenManager setUserData failed:", error);
    }
  }

  getUserData(): any | null {
    return this.userData;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  async clear(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.userData = null;
    try {
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        PHONE_VERIFIED_KEY,
        USER_DATA_KEY,
      ]);
    } catch (error) {
      console.warn("TokenManager clear failed:", error);
    }
  }

  async setPhoneVerified(verified: boolean) {
    try {
      await AsyncStorage.setItem(
        PHONE_VERIFIED_KEY,
        verified ? "true" : "false",
      );
    } catch (err) {
      console.warn("TokenManager setPhoneVerified failed:", err);
    }
  }

  async getPhoneVerified(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PHONE_VERIFIED_KEY);
    } catch (err) {
      return null;
    }
  }
}

export const tokenManager = new TokenManager();
