import { StyleSheet, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { sizeToDp } from '../../../core/utils/sizeToDP'
import { APP_PADDING } from '../../../core/utils/constants'
import { PaymentAmountHeader } from './components/PaymentAmountHeader'
import { NumbersKeyPad } from '../../../core/components/NumbersKeyPad'
import GradientButton from '../../../core/components/buttons/GradientButton'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import LoadingScreen from '../../../core/components/Loading/LoadingScreen'
import { InsetsContext } from '../../../core/utils/styles/insets'
import { InsertAmountContext } from './context'

const InsertAmount = () => {
    /*  */
    const INSETS = useContext(InsetsContext)
    const { handlePayAmount } = useContext(InsertAmountContext)
    /*  */
    const [selectedExtra, setSelectedExtra] = useState<string>('');
    const [loadingTextStatus, setLoadingTextStatus] = useState('')
    const [price, setPrice] = useState<string>('');
    /*  */
    const isPaymentLoadingSV = useSharedValue(false)

    /* ------- Functions ------- */
    function handleAddDigit(item: string) {
        if (item === '0' && price === '') return;
        if (price.length === 11 && item !== 'delete') return;
        item === 'delete' ? setPrice(price.slice(0, -1)) : setPrice(price + item);
    }

    function handlePay() {
        if (price.length === 0) return
        setLoadingTextStatus('Iniciando cobro')
        isPaymentLoadingSV.set(true)

        handlePayAmount({ price, selectedExtra })
            .then(() => {
                setPrice('')
                setSelectedExtra('')
            })
            .finally(() => {
                setTimeout(() => {
                    isPaymentLoadingSV.set(false)
                }, 300)
            })
    }

    function handleClear() {
        setPrice('');
        setSelectedExtra('');
    }
    /* ------- END Functions ------- */

    /* ------- Animations ------- */
    const isLoadingStyle = useAnimatedStyle(() => ({
        opacity: isPaymentLoadingSV.get() ? 1 : 0,
        pointerEvents: isPaymentLoadingSV.get() ? 'auto' : 'none',
    }))
    /* ------- END Animations ------- */

    return (
        <>
            <View style={[{ flex: 1, marginTop: INSETS.top, marginBottom: INSETS.bottom, paddingTop: sizeToDp(APP_PADDING * 0.2) }]} >
                <View style={[STYLES.screenWrapper]}>
                    <PaymentAmountHeader
                        price={price}
                        extra={selectedExtra}
                        handleSetExtra={setSelectedExtra}
                        handleClear={handleClear}
                    />

                    <NumbersKeyPad
                        onPressNumber={handleAddDigit}
                        onResetDigits={handleClear}
                    />
                    <View style={[STYLES.buttonContainer]}>
                        <GradientButton
                            title={'Proceder al pago'}
                            onPress={handlePay}
                        />
                    </View>
                </View>

            </View>
            <Animated.View style={[STYLES.loadingScreenWrapper, isLoadingStyle]}>
                <LoadingScreen text={loadingTextStatus} />
            </Animated.View>
        </>
    )
}

export default InsertAmount

const STYLES = StyleSheet.create({
    screenWrapper: {
        flex: 1,
    },
    buttonContainer: {
        paddingHorizontal: sizeToDp(APP_PADDING * 0.8),
        marginTop: sizeToDp(APP_PADDING * 0.5)
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
