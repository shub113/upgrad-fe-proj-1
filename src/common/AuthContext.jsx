import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from './authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on initial load
    const token = authService.getAuthToken();
    if (token) {
      // You might want to validate the token here
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await authService.signin(credentials);
    setUser({ token: response.token });
    return response;
  };

  const signup = async (userData) => {
    const response = await authService.signup(userData);
    setUser({ token: response.token });
    return response;
  };

  const logout = () => {
    authService.signout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 