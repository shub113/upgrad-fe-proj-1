import { apiService } from './apiService';
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from './config';

export const authService = {
  async signup(userData) {
    const response = await apiService.post(API_ENDPOINTS.AUTH.SIGNUP, userData, false);
    if (response.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    }
    return response;
  },

  async signin(credentials) {
    const response = await apiService.post(API_ENDPOINTS.AUTH.SIGNIN, credentials, false);
    if (response.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    }
    return response;
  },

  signout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isAuthenticated() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
}; 