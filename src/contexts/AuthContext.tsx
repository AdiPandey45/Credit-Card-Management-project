import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  isNewUser?: boolean;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  isNewUser: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  markUserAsExisting: () => void;            // ❗ added so Provider value matches the type
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (savedUser && token) {
          const parsedUser = JSON.parse(savedUser) as User;
          setUser({
            ...parsedUser,
            avatar:
              parsedUser.avatar ||
              'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          });
          setIsNewUser(!!parsedUser.isNewUser || localStorage.getItem('isNewUser') === 'true');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('isNewUser');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setIsNewUser(false);

      // Demo login (replace with real API call if desired)
      const token = 'demo_jwt_token_' + Date.now();
      const userData: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        email,
        isNewUser: false,
        avatar:
          'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      };

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('isNewUser');

      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);

      // Demo register (replace with real API call if desired)
      const token = 'demo_jwt_token_' + Date.now();
      const userData: User = {
        id: 'new_user_' + Date.now(),
        name,
        email,
        isNewUser: true,
        avatar:
          'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      };

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isNewUser', 'true');

      setUser(userData);
      setIsNewUser(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isNewUser');
      setUser(null);
      setIsNewUser(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const markUserAsExisting = () => {
    setIsNewUser(false);
    localStorage.removeItem('isNewUser');
    if (user) {
      const updatedUser = { ...user, isNewUser: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const contextValue: AuthContextType = {
    user,
    isNewUser,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    markUserAsExisting,     // ✅ now part of the type
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
