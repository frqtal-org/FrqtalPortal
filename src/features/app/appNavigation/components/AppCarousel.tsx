import { Dimensions } from 'react-native'
import React, { useCallback, useContext } from 'react'
import Carousel from 'react-native-reanimated-carousel'
import { InsetsContext } from '../../../../core/utils/styles/insets';
import { PanGesture } from 'react-native-gesture-handler';
import { TransactionsHistoryContext } from '../../transactionsHistory/context';
import { useFocusEffect } from '@react-navigation/native';

const CAROUSEL_WIDTH = Dimensions.get('window').width;
const CAROUSEL_HEIGHT = Dimensions.get('window').height;

const AppCarousel = ({ ref, pages, progressSV }: any) => {
    const INSETS = useContext(InsetsContext)
    const { setIsScreenFocused, setRefetchData, isFirstScreenRendered } = useContext(TransactionsHistoryContext)

    function checkIndex() {
        if(!isFirstScreenRendered) {
            const BOOL = ref?.current?.getCurrentIndex?.() === 2
            setRefetchData(BOOL)
            setIsScreenFocused(BOOL)
        }
    }

    /* ------- Animations ------- */
    function panGestureConfig(gesture: PanGesture) {
        'worklet';
        gesture.activeOffsetX([-30, 30]);
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
        onProgressChange={progressSV}
        defaultIndex={1}
        overscrollEnabled={false}
        onSnapToItem={checkIndex}
    />
}

export default AppCarousel
