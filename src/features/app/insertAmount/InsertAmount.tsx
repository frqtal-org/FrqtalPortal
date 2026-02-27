import { NativeModules, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Typography } from '../../../core/components/Typography'
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper'
import { sizeToDp } from '../../../core/utils/sizeToDP'
import { APP_PADDING } from '../../../core/utils/constants'
import { PaymentAmountHeader } from './components/PaymentAmountHeader'
import { NumbersKeyPad } from '../../../core/components/NumbersKeyPad'
import GradientButton from '../../../core/components/buttons/GradientButton'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import LoadingScreen from '../../../core/components/Loading/LoadingScreen'
import { calculateExtraAmount, formatPercentageFromPrice, formatPriceFromDigits } from '../../../core/utils/priceFormater'
import { useMMKVString } from 'react-native-mmkv'
import StorageKey from '../../../core/utils/store/keysStore'
import { mmkvStorage } from '../../../core/store/principalStore'
import { getCurrentDateDDMMAAAA } from '../../../core/utils/getDateDDMMAAAA'
import { generateTransactionId } from '../../../core/utils/getTransactionReference'

const { SmartWrapperModule } = NativeModules;

const InsertAmount = () => {
    const [SPIdCemmerce, setSPIdCemmerce] = useMMKVString(StorageKey.SP_ID_COMMECRE, mmkvStorage)
    
    const [selectedExtra, setSelectedExtra] = useState<string>('');
    const [price, setPrice] = useState<string>('');

    const isPaymentLoadingSV = useSharedValue(false)

    function handleAddDigit(item: string) {
        if (item === '0' && price === '') return;
        if (price.length === 11 && item !== 'delete') return;
        item === 'delete' ? setPrice(price.slice(0, -1)) : setPrice(price + item);
    }

    function handleResetDigits() {
        setPrice('');
    }

    async function handlePayAmount() {
        const AMOUNT_TO_PAY = formatPriceFromDigits(price);
        const EXTRA = calculateExtraAmount(formatPriceFromDigits(price), selectedExtra);
        const DATE = getCurrentDateDDMMAAAA();
        const UNIQUE_REFERENCE = generateTransactionId();
        try {
            isPaymentLoadingSV.set(true)
            const respuesta = await SmartWrapperModule.sale(AMOUNT_TO_PAY, EXTRA, DATE, UNIQUE_REFERENCE, SPIdCemmerce);
            console.log("Venta Exitosa", respuesta);
        } catch (error) {
            console.log('error')
            console.log(error)
        } finally {
            isPaymentLoadingSV.set(false)
        }
    };

    const isLoadingStyle = useAnimatedStyle(() => ({
        opacity: isPaymentLoadingSV.get() ? 1 : 0,
        pointerEvents: isPaymentLoadingSV.get() ? 'auto' : 'none',
    }))

    return (
        <BasicScreenWrapper
            noBackButton
            headerCenterText={'Iniciar cobro'}
            headerRightImage={require('../../../core/assets/images/bill.webp')}
            headerRightImageSize={sizeToDp(APP_PADDING * 1.68)}
            headerSubText={'Ingresa monto a cobrar'}
        >
            <View style={[STYLES.screenWrapper]}>
                <PaymentAmountHeader
                    price={price}
                    extra={selectedExtra}
                    handleSetExtra={setSelectedExtra}
                />

                <NumbersKeyPad
                    onPressNumber={handleAddDigit}
                    onResetDigits={handleResetDigits}
                />
                <View style={[STYLES.buttonContainer]}>
                    <GradientButton
                        isDisabled={price.length === 0}
                        title={'Proceder al pago'}
                        onPress={handlePayAmount}
                    />
                </View>
            </View>

            <Animated.View style={[STYLES.loadingScreenWrapper, isLoadingStyle]}>
                <LoadingScreen />
            </Animated.View>
        </BasicScreenWrapper>
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
