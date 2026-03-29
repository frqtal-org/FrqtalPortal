import React, { useCallback, useContext, useRef, useState } from 'react';
import { ICarouselInstance } from 'react-native-reanimated-carousel';
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import TransactionBottomSheet from '../../../core/components/bottomSheets/TransactionBottomSheet';
import LoadingScreen from '../../../core/components/Loading/LoadingScreen';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppPagination from './components/AppPagination';
import AppCarousel from './components/AppCarousel';
import Settings from '../settings/Settings';
import InsertAmount from '../insertAmount/InsertAmount';
import TransactionsHistory from '../transactionsHistory/TransactionsHistory';
import { AppNavigationContext } from './context';
import { LoginContext } from '../../accessManagement/Login/context';

let lockScreenTimeOut: number;
let loadingLockScreenTimeOut: number;

const CAROUSEL_PAGES = [
    { component: () => <Settings /> },
    { component: () => <InsertAmount /> },
    { component: () => <TransactionsHistory /> },
]

const AppNavigation = () => {
    /*  */
    const { isLoadingSV, setLoadingText, loadingText } = useContext(AppNavigationContext) 
    const { handleLogout } = useContext(LoginContext)
    /*  */
    const progressSV = useSharedValue<number>(0);
    const isBlockingSV = useSharedValue<boolean>(false);
    const [blockingText, setBlockingText] = useState<string>('');

    const carouselRef = useRef<ICarouselInstance>(null);

    const { navigate } = useNavigation<any>()

    /* ------- Functions ------- */
    function resetLockScreen() {
        isBlockingSV.set(false)
        setBlockingText('')
        lockScreenTimeOut && clearTimeout(lockScreenTimeOut)
        lockScreenTimeOut = setTimeout(async () => {
            await handleLogout().finally(() => {
                navigate('Login')
            })
        }, 5 * 60 * 1000)
        loadingLockScreenTimeOut && clearTimeout(loadingLockScreenTimeOut)
        loadingLockScreenTimeOut = setTimeout(() => {
            setBlockingText('Bloqueando pantalla')
            isBlockingSV.set(true)
        }, (5 * 60 * 1000) - 3000)
    }

    function onPressButton(targetIndex: number) {
        const currentIndex = Math.round(progressSV.value);
        const difference = targetIndex - currentIndex;

        carouselRef.current?.scrollTo({ count: difference, animated: true });
    }
    /* ------- END Functions ------- */

    /* ------- Animations ------- */
    const isLoadingStyle = useAnimatedStyle(() => ({
        opacity: isLoadingSV.get() ? 1 : 0,
        pointerEvents: isLoadingSV.get() ? 'auto' : 'none',
    }))

    const isBlockingStyle = useAnimatedStyle(() => ({
        opacity: isBlockingSV.get() ? 1 : 0,
        pointerEvents: isBlockingSV.get() ? 'auto' : 'none',
    }))
    /* ------- END Animations ------- */

    /* ------- Effects ------- */
    useFocusEffect(useCallback(() => {
        resetLockScreen();

        return () => {
            isLoadingSV.set(false);
            setLoadingText('');
            lockScreenTimeOut && clearTimeout(lockScreenTimeOut);
            loadingLockScreenTimeOut && clearTimeout(loadingLockScreenTimeOut);
        };
    }, []));
    /* ------- END Effects ------- */

    return (
        <>
            <BasicScreenWrapper noHeader onTouchStart={resetLockScreen} >
                <AppPagination pages={CAROUSEL_PAGES} progressSV={progressSV} onPress={(index: number) => onPressButton(index)} />
                <AppCarousel ref={carouselRef} pages={CAROUSEL_PAGES} progressSV={progressSV} />
            </BasicScreenWrapper>

            <TransactionBottomSheet />

            <Animated.View onTouchStart={resetLockScreen} style={[STYLES.loadingScreenWrapper, isBlockingStyle]}>
                <LoadingScreen text={blockingText} />
            </Animated.View>

            <Animated.View style={[STYLES.loadingScreenWrapper, isLoadingStyle]}>
                <LoadingScreen text={loadingText} />
            </Animated.View>
        </>
    );
};

export default AppNavigation;

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
