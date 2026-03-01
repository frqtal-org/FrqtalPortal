import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './accessManagement/Login/Login.tsx';
import AppNavigation from './app/AppNavigation.tsx';
import BootSplash from "react-native-bootsplash";

const { Navigator, Screen } = createNativeStackNavigator();

const GlobalNavigation = () => {
    /*  */
    /* ------- Functions ------- */
    function getInitialRoute() {
        try {
            /* const USER_DATA = JSON.parse(LOGIN_CONTEXT.userDataSV.value); */
            return /* USER_DATA?.user_id ? 'Home' :  */'Login';
        } catch (error) {
            /* console.error('Error parsing user data:', error); */
            return 'Home';
        }
    }
    /* ------- END Functions ------- */

    return (
        <Navigator
            initialRouteName={getInitialRoute()}
            screenOptions={{ animation: 'none', headerShown: false, statusBarHidden: false }}
        >
            <Screen name={'Login'} component={Login} />
            <Screen name={'AppNavigation'} component={AppNavigation} />
        </Navigator>

    );
};

export default GlobalNavigation;
