import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './accessManagement/Login/Login.tsx';
import AppNavigation from './app/appNavigation/AppNavigation.tsx';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { Navigator, Screen } = createNativeStackNavigator();

const AppNavigationWrapper = () => {
    useFocusEffect(useCallback(() => {
        const onBackPress = () => true;
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove()
    }, []));
    return <AppNavigation />
}

const GlobalNavigation = () => {
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
