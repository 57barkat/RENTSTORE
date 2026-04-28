describe("tokenManager", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("stores tokens in AsyncStorage when SecureStore is unavailable", async () => {
    const asyncStorageModule = require("@react-native-async-storage/async-storage");
    const AsyncStorage = asyncStorageModule.default ?? asyncStorageModule;
    const SecureStore = require("expo-secure-store");
    (SecureStore.isAvailableAsync as jest.Mock).mockResolvedValue(false);

    const { tokenManager } = require("@/services/tokenManager");

    await tokenManager.setTokens("access-token", "refresh-token");

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "ACCESS_TOKEN",
      "access-token",
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "REFRESH_TOKEN",
      "refresh-token",
    );
  });

  it("notifies listeners when the session is cleared", async () => {
    const { tokenManager } = require("@/services/tokenManager");
    const listener = jest.fn();
    const unsubscribe = tokenManager.subscribeToClears(listener);

    await tokenManager.clear("expired");

    expect(listener).toHaveBeenCalledWith("expired");

    unsubscribe();
  });
});
