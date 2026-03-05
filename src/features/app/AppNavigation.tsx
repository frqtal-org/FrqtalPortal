import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import InsertAmount from './insertAmount/InsertAmount';
import Carousel, { CarouselRenderItem, ICarouselInstance, Pagination, TAnimationStyle } from 'react-native-reanimated-carousel';
import BasicScreenWrapper from '../../core/components/screenWrappers/BasicScreenWrapper';
import { APP_PADDING } from '../../core/utils/constants';
import { sizeToDp } from '../../core/utils/sizeToDP';
import { PanGesture } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Dimensions, NativeModules, Pressable, StyleSheet, View } from 'react-native';
import theme from '../../core/utils/styles/styles';
import { InsetsContext } from '../../core/utils/styles/insets';
import FastImage from 'react-native-fast-image';
import { Typography } from '../../core/components/Typography';
import Settings from './settings/Settings';
import TransactionsHistory from './transactionsHistory/TransactionsHistory';
import TransactionBottomSheet from '../../core/components/bottomSheets/TransactionBottomSheet';
import { mmkvStorage } from '../../core/store/principalStore';
import { registrarNuevoCobro } from '../../core/utils/registerTxn';
import { BottomSheetsContext } from '../../core/components/bottomSheets/context';
import LoadingScreen from '../../core/components/Loading/LoadingScreen';

const CAROUSEL_WIDTH = Dimensions.get('window').width;
const CAROUSEL_HEIGHT = Dimensions.get('window').height;

const { SmartWrapperModule } = NativeModules;

const DemoHeaderNav = ({ text, icon, onPress }: any) => {
    return <Pressable onPress={onPress} style={[{ columnGap: sizeToDp(APP_PADDING * 0.3), paddingTop: sizeToDp(APP_PADDING * 0.3), paddingBottom: sizeToDp((APP_PADDING * 0.8) + 1), flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 1 }]} >
        {icon && <FastImage
            source={icon}
            style={[{ width: sizeToDp(APP_PADDING * 1.28), aspectRatio: 1 }]}
            resizeMode='contain'
        />}
        <Typography variant={'text01SemiBold'} >{text}</Typography>
    </Pressable>
}

const PAGES = [
    { component: () => <Settings /> },
    { component: () => <InsertAmount /> },
    { component: () => <TransactionsHistory /> },
]

const AppNavigation = memo(() => {
    /* */
    const carouselRef = useRef<ICarouselInstance>(null);
    const progress = useSharedValue<number>(0);
    const INSETS = useContext(InsetsContext)
    const { setTransactionSelected } = useContext(BottomSheetsContext)

    const isVirifyingTransactionSV = useSharedValue(false)

    /* ------- Functions ------- */
    function panGestureConfig(gesture: PanGesture) {
        'worklet';
        gesture.activeOffsetX([-20, 20]);
    }

    function onPressPaginationDot(targetIndex: number) {
        // Math.round asegura que tengamos el índice exacto actual
        const currentIndex = Math.round(progress.value);
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
                    registrarNuevoCobro(respuestaJSON)
                    setTransactionSelected(respuestaJSON)
                    
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')
                } else {
                    console.log("La transacción pendiente fue rechazada por el banco.");
                }
            } catch (error) {
                const ERR = JSON.parse(error.message)
                console.error(error);
                if (ERR.response_code == '97') {
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')
                }
            } finally {
                isVirifyingTransactionSV.set(false)
            }
        }
    }

    const isLoadingStyle = useAnimatedStyle(() => ({
        opacity: isVirifyingTransactionSV.get() ? 1 : 0,
        pointerEvents: isVirifyingTransactionSV.get() ? 'auto' : 'none',
    }))

    useEffect(() => {
        const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
        const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');
        if (pendingRef && pendingDate) {
            isVirifyingTransactionSV.set(true)
            setTimeout(() => {
                verificarTransaccionesPendientes();
            }, 700)
        }
    }, []);
    /* ------- END Functions ------- */

    return (
        <>
            <BasicScreenWrapper
                noHeader
            >
                <View style={[{ position: 'absolute', zIndex: 999, width: '100%' }]} >
                    <View style={[{ flexDirection: 'row' }]} >
                        <DemoHeaderNav onPress={() => { onPressPaginationDot(0) }} icon={require('../../core/assets/images/settings.webp')} text='Ajustes' />
                        <DemoHeaderNav onPress={() => { onPressPaginationDot(1) }} icon={require('../../core/assets/images/bill.webp')} text='Cobrar' />
                        <DemoHeaderNav onPress={() => { onPressPaginationDot(2) }} icon={require('../../core/assets/images/Transactions.webp')} text='Historial' />
                    </View>
                    <Pagination.Basic
                        progress={progress}
                        data={PAGES}
                        onPress={onPressPaginationDot}
                        dotStyle={STYLES.paginationDotStyle}
                        activeDotStyle={STYLES.paginationActiveDot}
                        containerStyle={STYLES.paginationContainer}
                        />
                </View>
                <Carousel
                    loop={false}
                    ref={carouselRef}
                    width={CAROUSEL_WIDTH}
                    height={CAROUSEL_HEIGHT - INSETS.top}
                    data={PAGES}
                    renderItem={({ item }) => item.component()}
                    onConfigurePanGesture={panGestureConfig}
                    onProgressChange={progress}
                    defaultIndex={1}
                    overscrollEnabled={false}
                />
            </BasicScreenWrapper>

            <TransactionBottomSheet />

            <Animated.View style={[STYLES.loadingScreenWrapper, isLoadingStyle]}>
                <LoadingScreen />
            </Animated.View>
        </>
    );
});

export default AppNavigation;

const STYLES = StyleSheet.create({
    wrapper: {
        marginTop: sizeToDp(APP_PADDING * 0.8)
    },
    indicatorsContainer: {
    },
    paginationDotStyle: {
        width: Dimensions.get('window').width / 3,
        /* bottom: -sizeToDp(APP_PADDING * 0.2), */
        height: sizeToDp(APP_PADDING * 0.2)
    },
    paginationActiveDot: {
        backgroundColor: theme.colors.selectedBlue,
        borderRadius: 999,
        width: Dimensions.get('window').width / 3,
    },
    paginationContainer: {
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
