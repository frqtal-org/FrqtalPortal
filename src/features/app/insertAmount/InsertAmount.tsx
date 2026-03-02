import { Alert, NativeModules, Pressable, StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper'
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
import { generateTransactionId } from '../../../core/utils/getTransactionReference'
import { InsetsContext } from '../../../core/utils/styles/insets'
import { Typography } from '../../../core/components/Typography'

const { SmartWrapperModule } = NativeModules;

const InsertAmount = () => {
    const INSETS = useContext(InsetsContext)
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
        if (price.length === 0) return
        const AMOUNT_TO_PAY = formatPriceFromDigits(price);
        const EXTRA = calculateExtraAmount(formatPriceFromDigits(price), selectedExtra);
        const DATE = getCurrentDateDDMMAAAA();
        const UNIQUE_REFERENCE = generateTransactionId();
        /* mmkvStorage.set('PENDING_TX_UNIQUE_REFERENCE', UNIQUE_REFERENCE);
        mmkvStorage.set('PENDING_TX_DATE', DATE); */
        try {
            isPaymentLoadingSV.set(true)
            const respuestaSale = await SmartWrapperModule.sale(AMOUNT_TO_PAY, EXTRA, DATE, UNIQUE_REFERENCE, SPIdCemmerce);
            const respuestaJSON = JSON.parse(respuestaSale);
            console.log(respuestaJSON)

            if (respuestaJSON.RESPONSE_CODE === '00') {
                setPrice('')
                setSelectedExtra('')
                /* mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                mmkvStorage.remove('PENDING_TX_DATE') */
            }
            /* const respuestaPrint = await SmartWrapperModule.reprintTicket(respuestaJSON.SG_REFERENCE);console.log(respuestaPrint) */
        } catch (error) {
            console.log('error 777')
            console.log(error)
            /* mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
            mmkvStorage.remove('PENDING_TX_DATE') */
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

    async function aoeuaoeu() {
        const respuestaBalance = await SmartWrapperModule.getBalance()
        console.log(respuestaBalance)
        console.log(respuestaBalance)
    }

    /*  async function verificarTransaccionesPendientes() {
         const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
         const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');
 
         if (pendingRef && pendingDate) {
             console.log(`⚠️ ALERTA: Se encontró una transacción huérfana (${pendingRef}). Consultando con el banco...`);
 
             try {
                 const respuestaString = await SmartWrapperModule.queryTransaction(pendingRef, pendingDate);
                 const respuestaJSON = JSON.parse(respuestaString);
 
                 if (respuestaJSON.RESPONSE_CODE === "00") {
                     Alert.alert(
                         "Transacción Recuperada",
                         `El cobro anterior de ${respuestaJSON.AMOUNT} sí se completó con éxito. Folio: ${respuestaJSON.SG_REFERENCE_FOLIO}`
                     );
                 } else {
                     console.log("La transacción pendiente fue rechazada por el banco.");
                 }
 
             } catch (error) {
                 console.log("La transacción huérfana nunca se completó:", error);
             } finally {
                 mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                 mmkvStorage.remove('PENDING_TX_DATE')
             }
         }
     }
 
     useEffect(() => {
         verificarTransaccionesPendientes();
     }, []); */

    return (
        <>
            <View style={[{ flex: 1, marginTop: INSETS.top, marginBottom: INSETS.bottom, paddingTop: sizeToDp(APP_PADDING * 0.2) }]} >
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
                <LoadingScreen />
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
