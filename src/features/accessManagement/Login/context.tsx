import React, { createContext } from 'react';
import { useLogin } from '../../../core/api/loigin';
import { useSharedValue } from 'react-native-reanimated';
import { NativeModules } from 'react-native';
import { getItemWithExpiry, setItemWithExpiry } from '../../../core/store/principalStore';
import StorageKey from '../../../core/utils/store/keysStore';

const LoginContext = createContext<any>({});
const { SmartWrapperModule } = NativeModules;

export function LoginProvider({ children }: { children: React.ReactNode }) {
    /*  */
    const isAuthenticationLoadingSV = useSharedValue(false)
    /*  */
    const useLoginMutator = useLogin();

    /* ------- Functions ------- */
    function autenticarTerminal({ SPApiKey, SPIdCemmerce, SPIdIntegrator, SPIdInvoice, onLogin }: { onLogin: () => void, SPApiKey: string, SPIdCemmerce: string, SPIdIntegrator: string, SPIdInvoice: string }) {
        return new Promise(async (res, rej) => {
            try {
                const token = getItemWithExpiry(StorageKey.SESSION_AUTH_TOKEN);
                if (token) {
                    res('ok')
                } else {
                    onLogin()
                    const response = await SmartWrapperModule.authenticate(SPApiKey, SPIdCemmerce, SPIdIntegrator, SPIdInvoice);

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

    function handleLogin({ code, deviceId, ...terminalData }: any): Promise<unknown> {
        return new Promise((res, rej) => {
            isAuthenticationLoadingSV.set(true)
            useLoginMutator.mutateAsync({ pin: code, device_id: deviceId }).then(({ data }) => {
                autenticarTerminal({ ...terminalData, SPIdInvoice: data.invoice_id })
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
    /* ------- END Functions ------- */

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
