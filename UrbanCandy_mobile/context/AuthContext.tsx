import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
    id_user?: number;
    id_people?: number;
    name?: string;
    email?: string;
    roles?: string[];
    [key: string]: any;
}

interface AuthContextData {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<AuthUser | null>(null);

    const setUser = (newUser: AuthUser | null) => {
        setUserState(newUser);
    };

    const signOut = async () => {
        try {
            await AsyncStorage.multiRemove([
                '@UrbanCandy:token',
                '@UrbanCandy:user',
                'token',
                'user'
            ]);
        } catch (error) {
            console.error('Erro ao deslogar:', error);
        } finally {
            setUserState(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);