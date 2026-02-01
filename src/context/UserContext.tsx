'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import axios from 'axios';
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { BASE_URL } from '../config/config';
import { getRefreshToken } from '@descope/react-sdk';

/* =====================
   Types (API-aligned)
===================== */

export type Subscription = {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  autoRenew: boolean;
  paymentProvider: string | null;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin' | 'campus-admin' | 'campus-superadmin';

  isPasswordChanged: boolean;
  isBlocked: boolean;
  profileCompleted: boolean;
  isVerified: boolean;

  phone: string;
  googleId?: string;

  coins: number;
  subscription: Subscription;

  university?: string;
  program?: string;
  semester?: string;
  specialisation?: string;
  yearOfGraduation?: string;

  createdAt: string;
  updatedAt: string;
};

/* =====================
   Context Type
===================== */

type UserContextType = {
  user: User | null;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
  isFetchingUser: boolean;
  userError: Error | null;
};

/* =====================
   Context
===================== */

const UserContext = createContext<UserContextType | undefined>(undefined);

/* =====================
   API
===================== */

const fetchUser = async (): Promise<User> => {
  const token = getRefreshToken();

  const res = await axios.get<{ user: User }>(
    `${BASE_URL}/auth/user`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.data?.user) {
    throw new Error('User not found');
  }

  return res.data.user;
};

/* =====================
   Provider
===================== */

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isFetchingUser,
    error: userError,
  } = useQuery<User, Error>({
    queryKey: ['user'],
    queryFn: fetchUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const updateUser = (updates: Partial<User>) => {
    queryClient.setQueryData<User>(['user'], (prev) =>
      prev ? { ...prev, ...updates } : prev
    );
  };

  const clearUser = () => {
    queryClient.removeQueries({ queryKey: ['user'] });
  };

  return (
    <UserContext.Provider
      value={{
        user: user ?? null,
        updateUser,
        clearUser,
        isAuthenticated: !!user,
        isFetchingUser,
        userError: userError ?? null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

/* =====================
   Hook
===================== */

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
