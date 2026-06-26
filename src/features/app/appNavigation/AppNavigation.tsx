import React, { useCallback, useContext, useRef, useState } from 'react';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
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
import { sizeToDp } from '../../../core/utils/sizeToDP';
import { APP_PADDING } from '../../../core/utils/constants';
import { Typography } from '../../../core/components/Typography';
import FastImage from 'react-native-fast-image';
import theme from '../../../core/utils/styles/styles';
import { scheduleOnRN } from 'react-native-worklets';
import { PanGesture } from 'react-native-gesture-handler';
import { TransactionsHistoryContext } from '../transactionsHistory/context';
import { InsetsContext } from '../../../core/utils/styles/insets';

let lockScreenTimeOut: number;
let loadingLockScreenTimeOut: number;

const CAROUSEL_WIDTH = Dimensions.get('window').width;
const CAROUSEL_HEIGHT = Dimensions.get('window').height;

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


    const INSETS = useContext(InsetsContext)
    const { setIsScreenFocused, setRefetchData, isFirstScreenRendered } = useContext(TransactionsHistoryContext)

    function checkIndex() {
        if (!isFirstScreenRendered) {
            const BOOL = carouselRef?.current?.getCurrentIndex?.() === 2
            setRefetchData(BOOL)
            setIsScreenFocused(BOOL)
        }
    }

    const handleProgressChange = (offsetProgress: number, absoluteProgress: number) => {
        progressSV.set(absoluteProgress);
        if (!isFirstScreenRendered) {
            scheduleOnRN(checkIndex);
        }
    };

    /* ------- Animations ------- */
    function panGestureConfig(gesture: PanGesture) {
        'worklet';
        gesture.activeOffsetX([-20, 20]).failOffsetY([-20, 20]);
    }
    /* ------- END Animations ------- */

    useFocusEffect(useCallback(() => {
        return () => {
            setRefetchData(false)
            setIsScreenFocused(false)
        }
    }, []))

    return (
        <>
            <BasicScreenWrapper noHeader onTouchStart={resetLockScreen} >
                {/* <AppPagination pages={CAROUSEL_PAGES} progressSV={progressSV} onPress={(index: number) => onPressButton(index)} /> */}
                <View style={[{ position: 'absolute', zIndex: 999, width: '100%' }]} >
                    <View style={[{ flexDirection: 'row' }]} >
                        <DemoHeaderNav onPress={() => { onPressButton?.(0) }} icon={require('../../../core/assets/images/settings.webp')} text='Ajustes' />
                        <DemoHeaderNav onPress={() => { onPressButton?.(1) }} icon={require('../../../core/assets/images/bill.webp')} text='Cobrar' />
                        <DemoHeaderNav onPress={() => { onPressButton?.(2) }} icon={require('../../../core/assets/images/Transactions.webp')} text='Historial' />
                    </View>
                    <Pagination.Basic
                        progress={progressSV}
                        data={CAROUSEL_PAGES}
                        dotStyle={STYLES.paginationDotStyle}
                        activeDotStyle={STYLES.paginationActiveDot}
                        containerStyle={STYLES.paginationContainer}
                        carouselName='aoeu'
                    />
                </View>
                {/* <AppCarousel ref={carouselRef} pages={CAROUSEL_PAGES} progressSV={progressSV} /> */}

                <Carousel
                    loop={false}
                    ref={carouselRef}
                    width={CAROUSEL_WIDTH}
                    height={CAROUSEL_HEIGHT - INSETS.bottom}
                    data={CAROUSEL_PAGES}
                    renderItem={({ item }: any) => item?.component?.()}
                    onConfigurePanGesture={panGestureConfig}
                    defaultIndex={1}
                    overscrollEnabled={false}
                    onProgressChange={handleProgressChange}
                    snapEnabled={true}
                    pagingEnabled={true}
                    scrollAnimationDuration={250}
                    withAnimation={{
                        type: 'timing',
                        config: {
                            duration: 250,
                            easing: Easing.bezier(0.25, 1, 0.5, 1),
                            reduceMotion: ReduceMotion.Never
                        }
                    }}
                />
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
})
