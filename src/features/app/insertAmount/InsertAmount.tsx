import { NativeModules, StyleSheet, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { sizeToDp } from '../../../core/utils/sizeToDP'
import { APP_PADDING } from '../../../core/utils/constants'
import { PaymentAmountHeader } from './components/PaymentAmountHeader'
import { NumbersKeyPad } from '../../../core/components/NumbersKeyPad'
import GradientButton from '../../../core/components/buttons/GradientButton'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import LoadingScreen from '../../../core/components/Loading/LoadingScreen'
import { calculateExtraAmount, formatPriceFromDigits } from '../../../core/utils/priceFormater'
import { useMMKVString } from 'react-native-mmkv'
import StorageKey from '../../../core/utils/store/keysStore'
import { mmkvStorage } from '../../../core/store/principalStore'
import { getCurrentDateDDMMAAAA } from '../../../core/utils/getDateDDMMAAAA'
import { InsetsContext } from '../../../core/utils/styles/insets'
import uuid from 'react-native-uuid';
import { BottomSheetsContext } from '../../../core/components/bottomSheets/context'
import { useTransactionRegister } from '../../../core/api/transactionRegister'
import { TransactionsHistoryContext } from '../transactionsHistory/context'

const { SmartWrapperModule } = NativeModules;

const InsertAmount = () => {
    const INSETS = useContext(InsetsContext)
    const { setRefetchData } = useContext(TransactionsHistoryContext)
    const { setTransactionSelected } = useContext(BottomSheetsContext)
    const [SPIdCemmerce, setSPIdCemmerce] = useMMKVString(StorageKey.SP_ID_COMMECRE, mmkvStorage)
    const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)

    const [selectedExtra, setSelectedExtra] = useState<string>('');
    const [loadingTextStatus, setLoadingTextStatus] = useState('')
    const [price, setPrice] = useState<string>('');

    const isPaymentLoadingSV = useSharedValue(false)

    const transactionRegisterMutator = useTransactionRegister()

    function handleAddDigit(item: string) {
        if (item === '0' && price === '') return;
        if (price.length === 11 && item !== 'delete') return;
        item === 'delete' ? setPrice(price.slice(0, -1)) : setPrice(price + item);
    }

    function handleResetDigits() {
        setPrice('');
        setSelectedExtra('');
    }

    async function handlePayAmount() {
        if (price.length === 0) return
        setLoadingTextStatus('Iniciando cobro')
        const AMOUNT_TO_PAY = formatPriceFromDigits(price);
        const EXTRA = calculateExtraAmount(formatPriceFromDigits(price), selectedExtra);
        const DATE = getCurrentDateDDMMAAAA();
        const UNIQUE_REFERENCE = `frq${uuid.v4().replaceAll('-', '').slice(-16)}`;
        mmkvStorage.set('PENDING_TX_UNIQUE_REFERENCE', UNIQUE_REFERENCE);
        mmkvStorage.set('PENDING_TX_DATE', DATE);
        try {
            isPaymentLoadingSV.set(true)
            const respuestaSale = await SmartWrapperModule.sale(AMOUNT_TO_PAY.replaceAll(',', ''), EXTRA.replaceAll(',', ''), DATE, UNIQUE_REFERENCE, SPIdCemmerce);
            setLoadingTextStatus('')
            const respuestaJSON = JSON.parse(respuestaSale);
            if (respuestaJSON.RESPONSE_CODE === '00') {
                setPrice('')
                setSelectedExtra('')
                mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                mmkvStorage.remove('PENDING_TX_DATE')
                setTransactionSelected({ event_name: 'transaction', data_raw: respuestaJSON })
                await transactionRegisterMutator.mutateAsync({ ...respuestaJSON, device_id: deviceId })
                setRefetchData(true)
            }
        } catch (error) {
            console.error(error)
            mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
            mmkvStorage.remove('PENDING_TX_DATE')
        } finally {
            setTimeout(() => {
                isPaymentLoadingSV.set(false)
            }, 300)
        }
    };

    const isLoadingStyle = useAnimatedStyle(() => ({
        opacity: isPaymentLoadingSV.get() ? 1 : 0,
        pointerEvents: isPaymentLoadingSV.get() ? 'auto' : 'none',
    }))

    function handleClear() {
        setPrice('');
        setSelectedExtra('');
    }

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
                        onResetDigits={handleResetDigits}
                    />
                    <View style={[STYLES.buttonContainer]}>
                        <GradientButton
                            /* isDisabled={price.length === 0} */
                            title={'Proceder al pago'}
                            onPress={handlePayAmount}
                        />
                    </View>
                </View>

                {/* <Pressable onPress={aoeuaoeu} >
                <Typography>AOEUAOEU</Typography>
            </Pressable> */}

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
