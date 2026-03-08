import React, { useCallback, useContext, useRef, useState } from 'react';
import InsertAmount from '../insertAmount/InsertAmount';
import { ICarouselInstance } from 'react-native-reanimated-carousel';
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper';
import { APP_PADDING } from '../../../core/utils/constants';
import { sizeToDp } from '../../../core/utils/sizeToDP';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { NativeModules, StyleSheet } from 'react-native';
import Settings from '../settings/Settings';
import TransactionsHistory from '../transactionsHistory/TransactionsHistory';
import TransactionBottomSheet from '../../../core/components/bottomSheets/TransactionBottomSheet';
import { mmkvStorage } from '../../../core/store/principalStore';
import { BottomSheetsContext } from '../../../core/components/bottomSheets/context';
import LoadingScreen from '../../../core/components/Loading/LoadingScreen';
import { useTransactionRegister } from '../../../core/api/transactionRegister';
import StorageKey from '../../../core/utils/store/keysStore';
import { useMMKVString } from 'react-native-mmkv';
import { TransactionsHistoryContext } from '../transactionsHistory/context';
import { useLogout } from '../../../core/api/logout';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { deleteToken } from '../../../core/store/tokenKeyChainStore';
import AppPagination from './components/AppPagination';
import AppCarousel from './components/AppCarousel';

let lockScreenTimeOut: number;
let loadingLockScreenTimeOut: number;

const { SmartWrapperModule } = NativeModules;

const PAGES = [
    { component: () => <Settings /> },
    { component: () => <InsertAmount /> },
    { component: () => <TransactionsHistory /> },
]

const AppNavigation = () => {
    /* */
    const { setRefetchData } = useContext(TransactionsHistoryContext)
    const { setTransactionSelected } = useContext(BottomSheetsContext)
    const progressSV = useSharedValue<number>(0);
    const isLoadingSV = useSharedValue(false)
    const [loadingText, setLoadingText] = useState('')
    const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)
    const carouselRef = useRef<ICarouselInstance>(null);
    const transactionRegisterMutator = useTransactionRegister()
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

    async function verificarTransaccionesPendientes() {
        const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
        const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');

        if (pendingRef && pendingDate) {
            try {
                const respuestaString = await SmartWrapperModule.queryUniqueTransaction(pendingRef, pendingDate);
                const respuestaJSON = JSON.parse(respuestaString);

                if (respuestaJSON.RESPONSE_CODE === '00') {
                    setTransactionSelected({ event_name: 'transaction', data_raw: respuestaJSON })
                    await transactionRegisterMutator.mutateAsync({ ...respuestaJSON, device_id: deviceId })
                    setRefetchData(true)
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')
                } else {
                    /* console.log("La transacción pendiente fue rechazada por el banco."); */
                }
            } catch (error: any) {
                const ERR = JSON.parse(error.message)
                console.error(error);
                if (ERR.response_code == '97') {
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')
                }
            } finally {
                isLoadingSV.set(false)
                setLoadingText('')
            }
        }
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
                verificarTransaccionesPendientes();
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
                <AppPagination pages={PAGES} progressSV={progressSV} onPress={(index: number) => onPressPaginationDot(index)} />
                <AppCarousel ref={carouselRef} pages={PAGES} progressSV={progressSV} />
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
    wrapper: {
        marginTop: sizeToDp(APP_PADDING * 0.8)
    },
    indicatorsContainer: {
    },
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
