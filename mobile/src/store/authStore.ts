import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'student' | 'tutor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginDemoStudent: () => void;
  loginDemoTutor: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loginDemoStudent: () => {},
  loginDemoTutor: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginDemoStudent = useCallback(() => {
    setUser({
      id: 'demo-student-1',
      name: 'Alex Chen',
      email: 'alex@demo.mentivara.com',
      role: 'student',
    });
  }, []);

  const loginDemoTutor = useCallback(() => {
    setUser({
      id: 'demo-tutor-1',
      name: 'Dr. Sarah Mitchell',
      email: 'sarah@demo.mentivara.com',
      role: 'tutor',
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    loginDemoStudent,
    loginDemoTutor,
    logout,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
