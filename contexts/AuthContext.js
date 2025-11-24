// contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

// 1. Create the Context object
const AuthContext = createContext(null);

// 2. AuthProvider component (the wrapper used in _app.js)
export const AuthProvider = ({ children }) => {
  // Placeholder state for now
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Future logic will go here to check localStorage for a token

  return (
    <AuthContext.Provider value={{ user, token, loading, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};