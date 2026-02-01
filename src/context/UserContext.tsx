'use client';

import  {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    role: 'user' | 'admin' | 'campus-admin' | "campus-superadmin";

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

type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
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
   Provider
===================== */

const fetchUser = async (): Promise<User> => {
  try {
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
      throw new Error("User not found");
    }

    return res.data.user;
  } catch (e) {
    console.error(e);
    throw e; // ✅ REQUIRED for React Query
  }
};


export const UserProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);

    const {
        data: fetchedUser,
        isLoading: isFetchingUser,
        error: userError,
    } = useQuery<User, Error>({
        queryKey: ['user'],
        queryFn: fetchUser,
        retry: false, // Optional: prevent retrying on error
        refetchOnWindowFocus: false, // Optional: prevent refetching on window focus
    });

    useEffect(() => {
        if (fetchedUser) {
            setUser(fetchedUser);
        } else {
            setUser(null);
        }
    }, [fetchedUser]);

    const updateUser = (updates: Partial<User>) => {
        setUser((prev) => {
            const updatedUser = prev ? { ...prev, ...updates } : null;
            if (updatedUser) {
                queryClient.setQueryData(['user'], updatedUser);
            }
            return updatedUser;
        });
    };

    const clearUser = () => {
        setUser(null);
        queryClient.setQueryData(['user'], null);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                updateUser,
                clearUser,
                isAuthenticated: !!user,
                isFetchingUser,
                userError,
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
