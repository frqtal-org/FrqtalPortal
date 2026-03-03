import React, { memo, useContext, useRef, useState } from 'react';
import InsertAmount from './insertAmount/InsertAmount';
import Carousel, { CarouselRenderItem, ICarouselInstance, Pagination, TAnimationStyle } from 'react-native-reanimated-carousel';
import BasicScreenWrapper from '../../core/components/screenWrappers/BasicScreenWrapper';
import { APP_PADDING } from '../../core/utils/constants';
import { sizeToDp } from '../../core/utils/sizeToDP';
import { PanGesture } from 'react-native-gesture-handler';
import { Extrapolation, interpolate, useSharedValue } from 'react-native-reanimated';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import theme from '../../core/utils/styles/styles';
import { InsetsContext } from '../../core/utils/styles/insets';
import FastImage from 'react-native-fast-image';
import { Typography } from '../../core/components/Typography';
import Settings from './settings/Settings';
import TransactionsHistory from './transactionsHistory/TransactionsHistory';
import TransactionBottomSheet from '../../core/components/bottomSheets/TransactionBottomSheet';

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
    }
})
