import React, { useCallback, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './accessManagement/Login/Login.tsx';
import AppNavigation from './app/AppNavigation.tsx';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LoadingScreen from '../core/components/Loading/LoadingScreen.tsx';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { AXIOS_INSTANCE } from '../core/api/customInstance.ts';
import { deleteToken, getToken, saveToken } from '../core/store/tokenKeyChainStore.ts';
import { useRefreshToken } from '../core/api/refreshToken.ts';
import { useLogout } from '../core/api/logout.ts';

const { Navigator, Screen } = createNativeStackNavigator();
const NO_TOKEN_ERROR_CODES = [403, 401];

let lockScreenTimeOut: number;
let loadingLockScreenTimeOut: number;
let REFRESH_TOKEN_TIMEOUT_ID: number;

const AppNavigationWrapper = () => {
    const { navigate } = useNavigation<any>()
    const isLockingScreenSV = useSharedValue(false)
    const logoutMutator = useLogout()

    function resetLockScreen() {
        isLockingScreenSV.set(false)
        lockScreenTimeOut && clearTimeout(lockScreenTimeOut)
        lockScreenTimeOut = setTimeout(async () => {
            navigate('Login')
            deleteToken()
            await logoutMutator.mutateAsync()
        }, 5 * 60 * 1000)
        loadingLockScreenTimeOut && clearTimeout(loadingLockScreenTimeOut)
        loadingLockScreenTimeOut = setTimeout(() => {
            isLockingScreenSV.set(true)
        }, (5 * 60 * 1000) - 3000)
    }

    useFocusEffect(
        useCallback(() => {
            resetLockScreen();
            const onBackPress = () => true;
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => {
                isLockingScreenSV.set(false);
                subscription.remove();
            }
        }, []),
    );

    const isLoadingStyle = useAnimatedStyle(() => ({
        opacity: isLockingScreenSV.get() ? 1 : 0,
        pointerEvents: isLockingScreenSV.get() ? 'auto' : 'none',
    }))

    return <View onTouchStart={resetLockScreen} style={[{ flex: 1 }]} >
        <AppNavigation />
        <Animated.View style={[STYLES.loadingScreenWrapper, isLoadingStyle]}>
            <LoadingScreen text='Bloqueando pantalla' />
        </Animated.View>
    </View>
}

const GlobalNavigation = () => {

    const { navigate } = useNavigation<any>();
    const refreshTokenMutator = useRefreshToken();
    const logoutMutator = useLogout()

    /* ------- Functions ------- */
    async function handleRefreshToken({ url }: any) {
        const TOKEN = await getToken()
        clearTimeout(REFRESH_TOKEN_TIMEOUT_ID);
        REFRESH_TOKEN_TIMEOUT_ID = setTimeout(() => {
            if (url !== '/terminal/refresh-token' && url !== '/terminal/login') {
                refreshTokenMutator.mutateAsync({ auth_token_login: TOKEN })
                .then(async (newTokenResponse: any) => {
                    console.log('TOKEN REFRESHED')
                    await saveToken(newTokenResponse.data.authToken)
                });
            }
        }, 5000);
    }

    async function refreshToken() {
        const TOKEN = await getToken()
        refreshTokenMutator.mutateAsync({ auth_token_login: TOKEN })
            .then(async (newTokenResponse: any) => {
                if (newTokenResponse === '') {
                    navigate('Login')
                    deleteToken()
                    await logoutMutator.mutateAsync()
                } else {
                    console.log('ERROR, GETTING NEW TOKEN REFRESHED')
                    await saveToken(newTokenResponse.data.authToken)
                }
            })
            .catch(async (err: any) => {
                console.error(err)
                navigate('Login')
                deleteToken()
                await logoutMutator.mutateAsync()
            });
    }
    /* ------- END Functions ------- */


    useEffect(() => {
        AXIOS_INSTANCE.interceptors.response.use(
            resp => {
                handleRefreshToken({ url: resp.config.url });
                return resp;
            },
            error => {
                if (NO_TOKEN_ERROR_CODES?.includes(error.response?.status) && !error.response?.config?.url.includes?.('login')) {
                    refreshToken()
                }
            },
        );
    }, []);

    return (
        <Navigator
            initialRouteName={'Login'}
            screenOptions={{ animation: 'none', headerShown: false, statusBarHidden: false }}
        >
            <Screen name={'Login'} component={Login} />
            <Screen name={'AppNavigation'} component={AppNavigationWrapper} options={{ gestureEnabled: false }} />
        </Navigator>

    );
};

export default GlobalNavigation;

const STYLES = StyleSheet.create({
    loadingScreenWrapper: {
        position: 'absolute',
        flex: 1,
        top: 0,
        left: 0,
        zIndex: 9999,
        width: '100%',
        height: '100%',
    },
})
