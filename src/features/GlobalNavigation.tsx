import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './accessManagement/Login/Login.tsx';
import AppNavigation from './app/AppNavigation.tsx';
import BootSplash from "react-native-bootsplash";
import { BackHandler, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const { Navigator, Screen } = createNativeStackNavigator();

let lockScreenTimeOut: number;

const AppNavigationWrapper = () => {
    const { navigate } = useNavigation<any>()

    function resetLockScreen() {
        lockScreenTimeOut && clearTimeout(lockScreenTimeOut)
        lockScreenTimeOut = setTimeout(() => {
            navigate('Login')
        }, 5 * 60 * 1000)
    }

    useFocusEffect(
        useCallback(() => {
            resetLockScreen();
            const onBackPress = () => true;
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, []),
    );

    return <View onTouchStart={resetLockScreen} style={[{ flex: 1 }]} >
        <AppNavigation />
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
