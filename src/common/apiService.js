import { API_BASE_URL, AUTH_TOKEN_KEY } from './config';

const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers[AUTH_TOKEN_KEY] = token;
    }
  }

  return headers;
};

export const apiService = {
  async get(endpoint, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(includeAuth),
    });
    return response.json();
  },

  async post(endpoint, data, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async put(endpoint, data, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(includeAuth),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(endpoint, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(includeAuth),
    });
    return response.json();
  },
}; 