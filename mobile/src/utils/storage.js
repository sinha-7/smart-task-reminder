import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';

export const storage = {
  async getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token) {
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },

  async setRefreshToken(token) {
    return SecureStore.setItemAsync(REFRESH_KEY, token);
  },

  async getUser() {
    const json = await SecureStore.getItemAsync(USER_KEY);
    return json ? JSON.parse(json) : null;
  },

  async setUser(user) {
    return SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  async clearAll() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
