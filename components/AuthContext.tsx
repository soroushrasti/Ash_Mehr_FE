import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserType = 'Admin' | 'GroupAdmin' | null;

interface AuthState {
  userType: UserType;
  userId: string | null;
  isLoading: boolean;
  signIn: (userType: UserType, userId: string, phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getCachedCredentials: () => Promise<{ phone: string; password: string } | null>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEYS = {
  USER_TYPE: 'auth_user_type',
  USER_ID: 'auth_user_id',
  PHONE: 'auth_phone',
  PASSWORD: 'auth_password',
};

// Platform-specific storage functions
const isWeb = typeof window !== 'undefined';

const setStorageItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.setItem(key, value);
    }
  }
};

const getStorageItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      // Fallback to AsyncStorage if SecureStore fails
      return await AsyncStorage.getItem(key);
    }
  }
};

const deleteStorageItem = async (key: string): Promise<void> => {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.removeItem(key);
    }
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [storedUserType, storedUserId] = await Promise.all([
          getStorageItem(STORAGE_KEYS.USER_TYPE),
          getStorageItem(STORAGE_KEYS.USER_ID),
        ]);

        if (storedUserType && storedUserId) {
          setUserType(storedUserType as UserType);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (type: UserType, id: string, phone: string, password: string) => {
    try {
      // Store credentials and auth state securely
      await Promise.all([
        setStorageItem(STORAGE_KEYS.USER_TYPE, type || ''),
        setStorageItem(STORAGE_KEYS.USER_ID, id),
        setStorageItem(STORAGE_KEYS.PHONE, phone),
        setStorageItem(STORAGE_KEYS.PASSWORD, password),
      ]);

      setUserType(type);
      setUserId(id);
    } catch (error) {
      console.error('Failed to store authentication data:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear all stored credentials
      await Promise.all([
        deleteStorageItem(STORAGE_KEYS.USER_TYPE),
        deleteStorageItem(STORAGE_KEYS.USER_ID),
        deleteStorageItem(STORAGE_KEYS.PHONE),
        deleteStorageItem(STORAGE_KEYS.PASSWORD),
      ]);

      setUserType(null);
      setUserId(null);
    } catch (error) {
      console.error('Failed to clear authentication data:', error);
    }
  };

  const getCachedCredentials = async (): Promise<{ phone: string; password: string } | null> => {
    try {
      const [phone, password] = await Promise.all([
        getStorageItem(STORAGE_KEYS.PHONE),
        getStorageItem(STORAGE_KEYS.PASSWORD),
      ]);

      if (phone && password) {
        return { phone, password };
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve cached credentials:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      userType,
      userId,
      isLoading,
      signIn,
      signOut,
      getCachedCredentials
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
