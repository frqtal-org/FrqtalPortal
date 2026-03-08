import { Dimensions } from 'react-native'
import React, { useContext } from 'react'
import Carousel from 'react-native-reanimated-carousel'
import { InsetsContext } from '../../../../core/utils/styles/insets';
import { PanGesture } from 'react-native-gesture-handler';

const CAROUSEL_WIDTH = Dimensions.get('window').width;
const CAROUSEL_HEIGHT = Dimensions.get('window').height;

const AppCarousel = ({ ref, pages, progressSV }: any) => {
    const INSETS = useContext(InsetsContext)

    /* ------- Animations ------- */
    function panGestureConfig(gesture: PanGesture) {
        'worklet';
        gesture.activeOffsetX([-20, 20]);
    }
    /* ------- END Animations ------- */

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
    />
}

export default AppCarousel
