import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ICarouselInstance } from 'react-native-reanimated-carousel';
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { NativeEventEmitter, NativeModules, StyleSheet } from 'react-native';
import TransactionBottomSheet from '../../../core/components/bottomSheets/TransactionBottomSheet';
import LoadingScreen from '../../../core/components/Loading/LoadingScreen';
import { useLogout } from '../../../core/api/logout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { deleteToken } from '../../../core/store/tokenKeyChainStore';
import AppPagination from './components/AppPagination';
import AppCarousel from './components/AppCarousel';
import Settings from '../settings/Settings';
import InsertAmount from '../insertAmount/InsertAmount';
import TransactionsHistory from '../transactionsHistory/TransactionsHistory';
import { configurarSensoresKiosco } from '../../../core/utils/queryClientConfiguration';

const { ScreenStateModule } = NativeModules;
const screenStateEmitter = new NativeEventEmitter(ScreenStateModule);

let lockScreenTimeOut: number;
let loadingLockScreenTimeOut: number;
let lockButtonPressedScreenTO: number;

const CAROUSEL_PAGES = [
    { component: () => <Settings /> },
    { component: () => <InsertAmount /> },
    { component: () => <TransactionsHistory /> },
]

const AppNavigation = () => {
    /* */
    const progressSV = useSharedValue<number>(0);
    const isLoadingSV = useSharedValue(false)
    const [loadingText, setLoadingText] = useState('');
    const carouselRef = useRef<ICarouselInstance>(null);
    const logoutMutator = useLogout()


    const { navigate } = useNavigation<any>()

    /* ------- Functions ------- */
    function resetLockScreen() {
        isLoadingSV.set(false)
        setLoadingText('')
        lockScreenTimeOut && clearTimeout(lockScreenTimeOut)
        lockScreenTimeOut = setTimeout(async () => {
            navigate('Login')
            await logoutMutator.mutateAsync()
            deleteToken()
        }, 5 * 60 * 1000)
        loadingLockScreenTimeOut && clearTimeout(loadingLockScreenTimeOut)
        loadingLockScreenTimeOut = setTimeout(() => {
            setLoadingText('Bloqueando pantalla')
            isLoadingSV.set(true)
        }, (5 * 60 * 1000) - 3000)
    }

    function onPressPaginationDot(targetIndex: number) {
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
    /* ------- END Animations ------- */

    /* ------- Effects ------- */
    useEffect(() => {
        configurarSensoresKiosco();
    }, []);

    useEffect(() => {
        ScreenStateModule.startListening();

        const subscription = screenStateEmitter.addListener('ScreenStateEvent', (state) => {
            if (state === 'ScreenOff') {
                /* 'LA PANTALLA SE APAGÓ FÍSICAMENTE' */
                lockButtonPressedScreenTO && clearTimeout(lockButtonPressedScreenTO)
                lockButtonPressedScreenTO = setTimeout(async () => {
                    navigate('Login');
                    await logoutMutator.mutateAsync()
                    deleteToken()
                }, 5000)
            } else if (state === 'ScreenOn') {
                /* 'LA PANTALLA SE ENCENDIÓ' */
                lockButtonPressedScreenTO && clearTimeout(lockButtonPressedScreenTO)
            }
        });

        return () => {
            subscription.remove();
            ScreenStateModule.stopListening();
        };
    }, []);

    useFocusEffect(useCallback(() => {
        resetLockScreen();

        return () => {
            isLoadingSV.set(false);
            setLoadingText('');
        };
    }, []));
    /* ------- END Effects ------- */

    return (
        <>
            <BasicScreenWrapper noHeader onTouchStart={resetLockScreen} >
                <AppPagination pages={CAROUSEL_PAGES} progressSV={progressSV} onPress={(index: number) => onPressPaginationDot(index)} />
                <AppCarousel ref={carouselRef} pages={CAROUSEL_PAGES} progressSV={progressSV} />
            </BasicScreenWrapper>

            <TransactionBottomSheet />

            <Animated.View onTouchStart={resetLockScreen} style={[STYLES.loadingScreenWrapper, isLoadingStyle]}>
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
