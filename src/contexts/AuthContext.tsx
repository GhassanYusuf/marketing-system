import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { getCurrentUser, initializeLocalStorage } from '@/lib/localStorage';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize local storage with mock data
    initializeLocalStorage();

    // Get current user from localStorage
    let currentUser = getCurrentUser();

    // If no user is logged in, auto-login as admin for demo purposes
    if (!currentUser) {
      const users = JSON.parse(localStorage.getItem('property_mgmt_users') || '[]');
      const adminUser = users.find((u: User) => u.role === 'admin');
      if (adminUser) {
        localStorage.setItem('property_mgmt_current_user', JSON.stringify(adminUser));
        currentUser = adminUser;
      }
    }

    setUser(currentUser);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};