import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";
const PHONE_VERIFIED_KEY = "IS_PHONE_VERIFIED";
const USER_DATA_KEY = "USER_DATA";
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private userData: any | null = null;
  private loaded = false;
  private secureStoreAvailable: boolean | null = null;

  private async canUseSecureStore(): Promise<boolean> {
    if (this.secureStoreAvailable !== null) {
      return this.secureStoreAvailable;
    }

    try {
      this.secureStoreAvailable = await SecureStore.isAvailableAsync();
    } catch {
      this.secureStoreAvailable = false;
    }

    return this.secureStoreAvailable;
  }

  private async getSensitiveItem(key: string): Promise<string | null> {
    if (await this.canUseSecureStore()) {
      return SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
    }

    return AsyncStorage.getItem(key);
  }

  private async setSensitiveItem(key: string, value: string): Promise<void> {
    if (await this.canUseSecureStore()) {
      await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
      return;
    }

    await AsyncStorage.setItem(key, value);
  }

  private async deleteSensitiveItem(key: string): Promise<void> {
    if (await this.canUseSecureStore()) {
      await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
      return;
    }

    await AsyncStorage.removeItem(key);
  }

  private async migrateLegacyTokens(): Promise<void> {
    if (!(await this.canUseSecureStore())) {
      return;
    }

    const [legacyAccess, legacyRefresh] = await AsyncStorage.multiGet([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
    ]);

    const legacyAccessToken = legacyAccess[1];
    const legacyRefreshToken = legacyRefresh[1];

    if (legacyAccessToken) {
      await SecureStore.setItemAsync(
        ACCESS_TOKEN_KEY,
        legacyAccessToken,
        SECURE_STORE_OPTIONS,
      );
    }

    if (legacyRefreshToken) {
      await SecureStore.setItemAsync(
        REFRESH_TOKEN_KEY,
        legacyRefreshToken,
        SECURE_STORE_OPTIONS,
      );
    }

    if (legacyAccessToken || legacyRefreshToken) {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    }
  }

  async load(): Promise<void> {
    if (this.loaded) return;

    try {
      await this.migrateLegacyTokens();

      const [accessToken, refreshToken, user] = await Promise.all([
        this.getSensitiveItem(ACCESS_TOKEN_KEY),
        this.getSensitiveItem(REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
      ]);

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.userData = user ? JSON.parse(user) : null;
    } catch (error) {
      // console.warn("TokenManager load failed:", error);
    } finally {
      this.loaded = true;
    }
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    try {
      await Promise.all([
        this.setSensitiveItem(ACCESS_TOKEN_KEY, accessToken),
        this.setSensitiveItem(REFRESH_TOKEN_KEY, refreshToken),
      ]);
    } catch (error) {
      // console.warn("TokenManager setTokens failed:", error);
    }
  }

  async setUserData(user: any): Promise<void> {
    this.userData = user;
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      // console.warn("TokenManager setUserData failed:", error);
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
    this.loaded = false;

    try {
      await Promise.all([
        this.deleteSensitiveItem(ACCESS_TOKEN_KEY),
        this.deleteSensitiveItem(REFRESH_TOKEN_KEY),
        AsyncStorage.multiRemove([
          ACCESS_TOKEN_KEY,
          REFRESH_TOKEN_KEY,
          PHONE_VERIFIED_KEY,
          USER_DATA_KEY,
        ]),
      ]);
    } catch (error) {
      // console.warn("TokenManager clear failed:", error);
    }
  }

  async setPhoneVerified(verified: boolean) {
    try {
      await AsyncStorage.setItem(
        PHONE_VERIFIED_KEY,
        verified ? "true" : "false",
      );
    } catch (err) {
      // console.warn("TokenManager setPhoneVerified failed:", err);
    }
  }

  async getPhoneVerified(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PHONE_VERIFIED_KEY);
    } catch (err) {
      // console.log(err);
      return null;
    }
  }
}

export const tokenManager = new TokenManager();
