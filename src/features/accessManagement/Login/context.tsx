/* import { useNavigation } from '@react-navigation/native'; */
import React, { createContext, useContext, useRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';
/* import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { useLogin } from '../../../core/api/login';
import { sizeToDp } from '../../../core/utils/sizeToDP';
import { APP_PADDING } from '../../../core/utils/insets';
import { TransactionsContext } from '../../app/transactions/context';
import { mmkvStorage } from '../../../core/utils/store/mmkvConfig';
import StorageKey from '../../../core/utils/store/keysStorage';
import { handleSetTokenToAxiosInstance } from '../../../core/api/customInstance';
import { scheduleOnRN } from 'react-native-worklets';
import { QpayController } from '../../../core/qpayModule/QpayController';
import { TerminalDeviceContext } from '../../context'; */

const LoginContext = createContext<any>({});

/* qpAmbiente: 'PRODUCTION', identificador: '4329', contrasena: '@A3S#*QxzU35' */
/* qpAmbiente: 'TEST', identificador: '1671', contrasena: 'D3vFr#T@L' */

export function LoginProvider({ children }: { children: React.ReactNode }) {
    /* const TRANSACTIONS_CONTEXT = useContext(TransactionsContext)
    const TERMINAL_DEVICE_CONTEXT = useContext(TerminalDeviceContext) */
    /*  */
    /* const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null); */
    /*  */
    /* const userDataSV = useSharedValue(mmkvStorage.getString(StorageKey.SESSION) || '{}')
    const userSessionTokenSV = useSharedValue(mmkvStorage.getString(StorageKey.AUTH_TOKEN) || '')
    const isLoadingSV = useSharedValue(false); */
    /*  */
    /* const { navigate } = useNavigation<any>();
    const loginMutator = useLogin(); */

    /* ------- Functions ------- */
    async function initQpayController({ identificador, contrasena, qpAmbiente }: any) {
        /* QpayController.init({
            identificador,
            contrasena,
            qpAmbiente,
            qpMostrarEstadoTexto: (event: any) => {
            },
        })
        .then(resp => {
            navigate('Home', { isQpInitialized: true });
        })
        .catch(err => {
            if ((err.name = 'mx.qpay.controller.QpayControllerAlreadyInitializedException')) {
                navigate('Home', { isQpInitialized: true });
            }
        }); */
    }

    function cleanUpSession() {
        /* userSessionTokenSV.value = ''
        userDataSV.value = '{}'
        mmkvStorage.delete(StorageKey.SESSION);
        mmkvStorage.delete(StorageKey.AUTH_TOKEN);
        mmkvStorage.delete(StorageKey.DEVICE_SERIAL_NUMBER);
        mmkvStorage.delete(StorageKey.QP_CREDENTIALS) */
    }

    async function handleInitQpay({ identificador, contrasena }: any, bypassLoading: any = false) {
        /* isLoadingSV.value = true;
        await initQpayController({ identificador, contrasena, qpAmbiente: 'PRODUCTION' })
        const serialNum = await QpayController.getSerialNumber().catch(err => {})
        TERMINAL_DEVICE_CONTEXT.deviceSerialNumberSV.value = serialNum;
        mmkvStorage.set(StorageKey.DEVICE_SERIAL_NUMBER, serialNum!)
        !bypassLoading && (isLoadingSV.value = false) */
    }

    async function handleSetSessionData(userData: string) {
        /* if (userData === '{}' || mmkvStorage.getString(StorageKey.AUTH_TOKEN)) return
        const SESSION_DATA = JSON.parse(userData)
        mmkvStorage.set(StorageKey.AUTH_TOKEN, SESSION_DATA.authToken);
        mmkvStorage.set(StorageKey.SESSION, userData);
        handleSetTokenToAxiosInstance(SESSION_DATA.authToken); */
        /* const QP_CREDENTIALS = { identificador: '1671', contrasena: 'D3vFr#T@L' }; */
        /* const QP_CREDENTIALS = { identificador: SESSION_DATA.portal_id, contrasena: SESSION_DATA.portal_password };
        mmkvStorage.set(StorageKey.QP_CREDENTIALS, JSON.stringify(QP_CREDENTIALS))
        if (SESSION_DATA?.byPassQpayInitialization) return
        await handleInitQpay(QP_CREDENTIALS, true); */
    }

    async function handleLogin({ data, onSuccess, onFinally, byPassQpayInitialization }: any) {
        /* const QP_CREDENTIALS = { identificador: '1671', contrasena: 'D3vFr#T@L' };
        await handleInitQpay(QP_CREDENTIALS); */
        /* userDataSV.value = '{}';
        loginMutator
            .mutateAsync(data)
            .then((resp: any) => {
                if (resp?.data) {
                    userDataSV.value = JSON.stringify({ ...resp?.data, byPassQpayInitialization });
                } else {
                    userDataSV.value = '{}';
                }
                onSuccess?.()
            })
            .catch((error: any) => {
                TRANSACTIONS_CONTEXT.errorCodeSV.value = error.status
                TRANSACTIONS_CONTEXT.errorMessageSV.value = error.code
                TRANSACTIONS_CONTEXT.errorModalVisibleSV.value = true
                isLoadingSV.value = false
                // console.error('login---err ' + JSON.stringify(error, null, 2))
            }).finally(() => {
                onFinally?.()
            }) */
    }
    /* ------- END Functions ------- */

    /* ------- Animations ------- */
    /* useAnimatedReaction(() => {
        return userDataSV.value;
    }, (currentValue, previousValue) => {
        if (currentValue !== previousValue) {
            scheduleOnRN(handleSetSessionData, currentValue);
        }
    },
    ); */
    /* ------- END Animations ------- */

    return (
        <LoginContext.Provider
            value={{
                /* isLoadingSV,
                handleLogin,
                emailInputRef,
                passwordInputRef,
                userDataSV,
                userSessionTokenSV,
                cleanUpSession,
                handleInitQpay, */
            }}>
            {children}
        </LoginContext.Provider>
    );
}

export { LoginContext };
