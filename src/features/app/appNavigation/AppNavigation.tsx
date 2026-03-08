import React, { useCallback, useContext, useRef, useState } from 'react';
import { ICarouselInstance } from 'react-native-reanimated-carousel';
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import TransactionBottomSheet from '../../../core/components/bottomSheets/TransactionBottomSheet';
import { mmkvStorage } from '../../../core/store/principalStore';
import LoadingScreen from '../../../core/components/Loading/LoadingScreen';
import { useLogout } from '../../../core/api/logout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { deleteToken } from '../../../core/store/tokenKeyChainStore';
import AppPagination from './components/AppPagination';
import AppCarousel from './components/AppCarousel';
import { InsertAmountContext } from '../insertAmount/context';
import Settings from '../settings/Settings';
import InsertAmount from '../insertAmount/InsertAmount';
import TransactionsHistory from '../transactionsHistory/TransactionsHistory';

let lockScreenTimeOut: number;
let loadingLockScreenTimeOut: number;

const CAROUSEL_PAGES = [
    { component: () => <Settings /> },
    { component: () => <InsertAmount /> },
    { component: () => <TransactionsHistory /> },
]

const AppNavigation = () => {
    /* */
    const { verifyPendingTransaction } = useContext(InsertAmountContext)
    const progressSV = useSharedValue<number>(0);
    const isLoadingSV = useSharedValue(false)
    const [loadingText, setLoadingText] = useState('')
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
            deleteToken()
            await logoutMutator.mutateAsync()
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
    useFocusEffect(useCallback(() => {
        const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
        const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');

        if (pendingRef && pendingDate) {
            setLoadingText('Verificando transacción inconclusa')
            isLoadingSV.set(true)
            setTimeout(() => {
                verifyPendingTransaction()
                    .finally(() => {
                        isLoadingSV.set(false)
                        setLoadingText('')
                    });
            }, 3000)
        }

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
