import * as Keychain from 'react-native-keychain';
import { handleSetTokenToAxiosInstance } from '../api/customInstance';

const SERVICE_NAME = 'secure_session_token';

const securityOptions = {
    service: SERVICE_NAME,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
};

export async function saveToken(sessionToken: string) {
    try {
        handleSetTokenToAxiosInstance(sessionToken)
        await Keychain.setGenericPassword('secure_session_token', sessionToken, securityOptions);
        return true;
    } catch (error) {
        console.error("Error guardando en Keychain:", error);
        return false;
    }
}

export async function getToken() {
    try {
        const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
        if (credentials) return credentials.password;
        return null;
    } catch (error) {
        console.error("Error leyendo de Keychain:", error);
        return null;
    }
}

export async function deleteToken() {
    try {
        handleSetTokenToAxiosInstance('')
        await Keychain.resetGenericPassword({ service: SERVICE_NAME });
        return true
    } catch (err) {
        console.error(err)
    }
}