import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './accessManagement/Login/Login.tsx';
import AppNavigation from './app/AppNavigation.tsx';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LoadingScreen from '../core/components/Loading/LoadingScreen.tsx';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const { Navigator, Screen } = createNativeStackNavigator();

let lockScreenTimeOut: number;
let loadingLockScreenTimeOut: number;

const AppNavigationWrapper = () => {
    const { navigate } = useNavigation<any>()
    const isLockingScreenSV = useSharedValue(false)

    function resetLockScreen() {
        isLockingScreenSV.set(false)
        lockScreenTimeOut && clearTimeout(lockScreenTimeOut)
        lockScreenTimeOut = setTimeout(() => {
            navigate('Login')
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
    /* ------- Functions ------- */
    /* ------- END Functions ------- */

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
