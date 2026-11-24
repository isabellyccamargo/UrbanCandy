import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
    id_user?: number;
    id_people?: number;
    name?: string;
    email?: string;
    roles?: unknown[];
    [key: string]: any;
}

interface AuthContextData {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    setUser: (user: AuthUser | null) => void;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function isAuthUser(value: unknown): value is AuthUser {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeRole(value: unknown) {
    if (typeof value !== 'string' && typeof value !== 'number') return '';

    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/^role_/, '')
        .trim();
}

export function getAuthUserRole(user: AuthUser | null): 'manager' | 'employee' | null {
    const roleSources = [user?.roles, user?.people?.roles, user?.People?.roles];
    const roleNames = roleSources.flatMap((source) =>
        Array.isArray(source)
            ? source.map((role: unknown) => {
                if (typeof role === 'object' && role !== null) {
                    const roleData = role as Record<string, unknown>;
                    const candidates = [
                        roleData.name,
                        roleData.label,
                        roleData.name_role,
                        roleData.role_name,
                        roleData.id_role,
                        roleData.id,
                    ];
                    return candidates.map(normalizeRole).find(Boolean) ?? '';
                }

                return normalizeRole(role);
            })
            : []
    );

    if (roleNames.some((role) => ['gerente', 'admin', '3'].includes(role))) {
        return 'manager';
    }

    if (roleNames.some((role) => ['funcionario', 'atendente', '2'].includes(role))) {
        return 'employee';
    }

    return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const sessionChanged = useRef(false);

    useEffect(() => {
        let active = true;

        async function restoreSession() {
            try {
                const [namespacedToken, legacyToken, namespacedUser, legacyUser] = await Promise.all([
                    AsyncStorage.getItem('@UrbanCandy:token'),
                    AsyncStorage.getItem('token'),
                    AsyncStorage.getItem('@UrbanCandy:user'),
                    AsyncStorage.getItem('user'),
                ]);

                if (!active || sessionChanged.current) return;

                const storedUser = namespacedUser || legacyUser;
                if (!(namespacedToken || legacyToken) || !storedUser) {
                    setUserState(null);
                    return;
                }

                const parsedUser: unknown = JSON.parse(storedUser);
                if (!isAuthUser(parsedUser)) {
                    throw new Error('Os dados da sessão salvos são inválidos.');
                }

                setUserState(parsedUser);
            } catch (restoreError) {
                console.error('Não foi possível restaurar a sessão:', restoreError);
                if (active) {
                    setError('Não foi possível verificar sua sessão. Feche e abra o aplicativo novamente.');
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        void restoreSession();
        return () => {
            active = false;
        };
    }, []);

    const setUser = (newUser: AuthUser | null) => {
        sessionChanged.current = true;
        setUserState(newUser);
        setError(null);
        setLoading(false);
    };

    const signOut = async () => {
        try {
            await AsyncStorage.multiRemove([
                '@UrbanCandy:token',
                '@UrbanCandy:user',
                'token',
                'user',
                'user_token'
            ]);
        } catch (error) {
            console.error('Erro ao deslogar:', error);
            throw error;
        } finally {
            sessionChanged.current = true;
            setUserState(null);
            setError(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, setUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);