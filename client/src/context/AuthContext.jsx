import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');

      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }

      return data?.user || null;
    } catch (error) {
      console.error('AUTH CHECK ERROR:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });

    if (!data?.success || !data?.user) {
      throw new Error(data?.message || 'Login failed');
    }

    setUser(data.user);

    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);

    if (!data?.success || !data?.user) {
      throw new Error(data?.message || 'Registration failed');
    }

    setUser(data.user);

    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refetch: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);