import React, { createContext, useEffect } from 'react';
import { useLogin } from '../../../core/api/login';
import { useSharedValue } from 'react-native-reanimated';
import { NativeModules } from 'react-native';
import { getItemWithExpiry, mmkvStorage, setItemWithExpiry } from '../../../core/store/principalStore';
import StorageKey from '../../../core/utils/store/keysStore';
import { deleteToken, getToken, saveToken } from '../../../core/store/tokenKeyChainStore';
import { useRefreshToken } from '../../../core/api/refreshToken';
import { useLogout } from '../../../core/api/logout';
import { useNavigation } from '@react-navigation/native';
import { AXIOS_INSTANCE } from '../../../core/api/customInstance';
import { useMMKVString } from 'react-native-mmkv';

const LoginContext = createContext<any>({});
const { SmartWrapperModule } = NativeModules;

const NO_TOKEN_ERROR_CODES = [403, 401];

let REFRESH_TOKEN_TIMEOUT_ID: number;

export function LoginProvider({ children }: { children: React.ReactNode }) {
    
    const [SPApiKey, setSPApiKey] = useMMKVString(StorageKey.SP_API_KEY, mmkvStorage)
    const [SPIdCemmerce, setSPIdCemmerce] = useMMKVString(StorageKey.SP_ID_COMMECRE, mmkvStorage)
    const [SPIdIntegrator, setSPIdIntegrator] = useMMKVString(StorageKey.SP_ID_INTEGRATOR, mmkvStorage)
    /*  */
    const isAuthenticationLoadingSV = useSharedValue(false)
    /*  */
    const useLoginMutator = useLogin();
    const refreshTokenMutator = useRefreshToken();
    const logoutMutator = useLogout()

    const { navigate } = useNavigation<any>();

    /* ------- Functions ------- */
    function autenticarTerminal({ onLogin, invoice_id }: { onLogin: () => void, SPApiKey: string, SPIdCemmerce: string, SPIdIntegrator: string, invoice_id: string }) {
        return new Promise(async (res, rej) => {
            try {
                const token = getItemWithExpiry(StorageKey.SESSION_AUTH_TOKEN);
                if (token) {
                    res('ok')
                } else {
                    onLogin()
                    const response = await SmartWrapperModule.authenticate(SPApiKey, SPIdCemmerce, SPIdIntegrator, invoice_id);

                    const RESPONSE_PARSED = JSON.parse(response)
                    if (RESPONSE_PARSED.response_code != 200) rej(RESPONSE_PARSED)

                    setItemWithExpiry(StorageKey.SESSION_AUTH_TOKEN, true);
                    res('ok')
                }
            } catch (err) {
                rej(err)
            }
        })
    };

    function handleLogin({ code, deviceId, onLogin }: any): Promise<unknown> {
        return new Promise((res, rej) => {
            isAuthenticationLoadingSV.set(true)
            useLoginMutator.mutateAsync({ pin: code, device_id: deviceId }).then(async ({ data }) => {
                await saveToken(data.authToken)
                autenticarTerminal({ onLogin, ...data })
                    .then(res)
                    .catch(rej)
                    .finally(() => isAuthenticationLoadingSV.set(false))
            })
                .catch(err => {
                    isAuthenticationLoadingSV.set(false)
                    rej(err)
                })
        })
    };

    async function handleRefreshToken({ url }: any) {
        const TOKEN = await getToken()
        clearTimeout(REFRESH_TOKEN_TIMEOUT_ID);
        REFRESH_TOKEN_TIMEOUT_ID = setTimeout(() => {
            if (url !== '/terminal/refresh-token' && url !== '/terminal/login' && url !== '/terminal/logout') {
                refreshTokenMutator.mutateAsync({ auth_token_login: TOKEN })
                    .then(async (newTokenResponse: any) => {
                        await saveToken(newTokenResponse.data.authToken)
                    });
            }
        }, 5000);
    };

    async function handleRefreshTokenLastChance() {
        const TOKEN = await getToken()
        refreshTokenMutator.mutateAsync({ auth_token_login: TOKEN })
            .then(async (newTokenResponse: any) => {
                if (newTokenResponse === '') {
                    navigate('Login')
                    deleteToken()
                    await logoutMutator.mutateAsync()
                } else {
                    await saveToken(newTokenResponse.data.authToken)
                }
            })
            .catch(async (err: any) => {
                console.error(err)
                navigate('Login')
                deleteToken()
                await logoutMutator.mutateAsync()
            });
    };
    /* ------- END Functions ------- */

    /* ------- Effects ------- */
    useEffect(() => {
        AXIOS_INSTANCE.interceptors.response.use(
            resp => {
                handleRefreshToken({ url: resp.config.url });
                return resp;
            },
            error => {
                if (NO_TOKEN_ERROR_CODES?.includes(error.response?.status) && !error.response?.config?.url.includes?.('login') && !error.response?.config?.url.includes?.('refresh-token') && !error.response?.config?.url.includes?.('logout')) {
                    handleRefreshTokenLastChance()
                }
            },
        );
    }, []);
    /* ------- END Effects ------- */

    return (
        <LoginContext.Provider
            value={{
                isAuthenticationLoadingSV,
                handleLogin
            }}>
            {children}
        </LoginContext.Provider>
    );
}

export { LoginContext };
