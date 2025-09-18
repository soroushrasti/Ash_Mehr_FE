import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type UserType = 'Admin' | 'GroupAdmin' | 'Needy' | null;

interface AuthState {
  userType: UserType;
  userId: string | null;
  userName: string | null;
  isLoading: boolean;
  signIn: (userType: UserType, userId: string, phone: string, password: string, userName?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  getCachedCredentials: () => Promise<{ phone: string; password: string } | null>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEYS = {
  USER_TYPE: 'auth_user_type',
  USER_ID: 'auth_user_id',
  USER_NAME: 'auth_user_name',
  PHONE: 'auth_phone',
  PASSWORD: 'auth_password',
};

// Platform-specific storage functions
const isWeb = Platform.OS === 'web';

const setStorageItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {}
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    // Fallback to AsyncStorage if SecureStore fails
    await AsyncStorage.setItem(key, value);
  }
};

const getStorageItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    try {
      return localStorage.getItem(key);
    } catch {}
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    // Fallback to AsyncStorage if SecureStore fails
    return await AsyncStorage.getItem(key);
  }
};

const deleteStorageItem = async (key: string): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.removeItem(key);
      return;
    } catch {}
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    // Fallback to AsyncStorage if SecureStore fails
    await AsyncStorage.removeItem(key);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [storedUserType, storedUserId, storedUserName] = await Promise.all([
          getStorageItem(STORAGE_KEYS.USER_TYPE),
          getStorageItem(STORAGE_KEYS.USER_ID),
          getStorageItem(STORAGE_KEYS.USER_NAME),
        ]);

        if (storedUserType && storedUserId) {
          setUserType(storedUserType as UserType);
          setUserId(storedUserId);
          setUserName(storedUserName);
        }
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (type: UserType, id: string, phone: string, password: string, name?: string | null) => {
    try {
      // Store credentials and auth state securely
      await Promise.all([
        setStorageItem(STORAGE_KEYS.USER_TYPE, type || ''),
        setStorageItem(STORAGE_KEYS.USER_ID, id),
        setStorageItem(STORAGE_KEYS.USER_NAME, name || ''),
        setStorageItem(STORAGE_KEYS.PHONE, phone),
        setStorageItem(STORAGE_KEYS.PASSWORD, password),
      ]);

      setUserType(type);
      setUserId(id);
      setUserName(name || null);
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
        deleteStorageItem(STORAGE_KEYS.USER_NAME),
        deleteStorageItem(STORAGE_KEYS.PHONE),
        deleteStorageItem(STORAGE_KEYS.PASSWORD),
      ]);

      setUserType(null);
      setUserId(null);
      setUserName(null);
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
      userName,
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
