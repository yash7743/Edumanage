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
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      // Handles both { success: true, data: user } and { success: true, user }
      const currentUser = data?.data || data?.user || null;

      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
        return currentUser;
      } else {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
    } catch (error) {
      // Keep optimistic user from localStorage if request failed due to transient network issue
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Supports both direct user object login and credential-based login
  const login = async (userDataOrEmail, maybePassword) => {
    // If called with an already-authenticated user object: login(payload, token)
    if (typeof userDataOrEmail === 'object' && userDataOrEmail !== null) {
      setUser(userDataOrEmail);
      localStorage.setItem('user', JSON.stringify(userDataOrEmail));
      if (maybePassword) {
        localStorage.setItem('token', maybePassword);
      }
      return userDataOrEmail;
    }

    // If called with email and password: login(email, password)
    const { data } = await api.post('/auth/login', {
      email: userDataOrEmail,
      password: maybePassword,
    });

    const payload = data?.data || data?.user || data;
    const token = payload?.token || data?.token;

    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user', JSON.stringify(payload));
    setUser(payload);

    return payload;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const userPayload = data?.data || data?.user || data;
    const token = userPayload?.token || data?.token;

    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user', JSON.stringify(userPayload));
    setUser(userPayload);

    return userPayload;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
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