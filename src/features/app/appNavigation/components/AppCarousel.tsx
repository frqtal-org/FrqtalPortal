import { Dimensions } from 'react-native'
import React, { useCallback, useContext } from 'react'
import Carousel from 'react-native-reanimated-carousel'
import { InsetsContext } from '../../../../core/utils/styles/insets';
import { PanGesture } from 'react-native-gesture-handler';
import { TransactionsHistoryContext } from '../../transactionsHistory/context';
import { useFocusEffect } from '@react-navigation/native';
import { ReduceMotion, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const CAROUSEL_WIDTH = Dimensions.get('window').width;
const CAROUSEL_HEIGHT = Dimensions.get('window').height;

const AppCarousel = ({ ref, pages, progressSV }: any) => {
    const INSETS = useContext(InsetsContext)
    const { setIsScreenFocused, setRefetchData, isFirstScreenRendered } = useContext(TransactionsHistoryContext)
    const lastIndexSV = useSharedValue(1); // 1 porque tu defaultIndex es 1

    function checkIndex() {
        if (!isFirstScreenRendered) {
            const BOOL = ref?.current?.getCurrentIndex?.() === 2
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

    return <Carousel
        loop={false}
        ref={ref}
        width={CAROUSEL_WIDTH}
        height={CAROUSEL_HEIGHT - INSETS.top}
        data={pages}
        renderItem={({ item }: any) => item?.component?.()}
        onConfigurePanGesture={panGestureConfig}
        defaultIndex={1}
        overscrollEnabled={false}
        onProgressChange={handleProgressChange}
        snapEnabled={false}
        pagingEnabled={true}
        scrollAnimationDuration={0}
        withAnimation={{
            type: 'timing',
            config: {
                duration: 0,
                reduceMotion: ReduceMotion.Always
            }
        }}
    />
}

export default AppCarousel
