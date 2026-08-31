import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export type AuthUser = {
    id_user: number;
    nome: string;
    roles: string[];
};

export async function getAccessToken() {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveTokens(
    accessToken: string,
    refreshToken?: string
) {
    await SecureStore.setItemAsync(
        ACCESS_TOKEN_KEY,
        accessToken
    );

    if (refreshToken) {
        await SecureStore.setItemAsync(
            REFRESH_TOKEN_KEY,
            refreshToken
        );
    }
}

export async function saveUser(user: AuthUser) {
    await SecureStore.setItemAsync(
        USER_KEY,
        JSON.stringify(user)
    );
}

export async function getUser(): Promise<AuthUser | null> {
    const user = await SecureStore.getItemAsync(USER_KEY);

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}

export async function clearTokens() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
}