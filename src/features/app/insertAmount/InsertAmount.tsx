import { StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { sizeToDp } from '../../../core/utils/sizeToDP'
import { APP_PADDING } from '../../../core/utils/constants'
import { PaymentAmountHeader } from './components/PaymentAmountHeader'
import { NumbersKeyPad } from '../../../core/components/NumbersKeyPad'
import GradientButton from '../../../core/components/buttons/GradientButton'
import { InsetsContext } from '../../../core/utils/styles/insets'
import { InsertAmountContext } from './context'
import { mmkvStorageTemporal } from '../../../core/store/principalStore'
import { useNetInfo } from "@react-native-community/netinfo";
import { TemporalStorageKey } from '../../../core/utils/store/keysStore'
import { AppNavigationContext } from '../appNavigation/context'

const InsertAmount = () => {
    /*  */
    const INSETS = useContext(InsetsContext)
    const { handlePayAmount, verifyPendingTransaction } = useContext(InsertAmountContext)
    const { isLoadingSV, setLoadingText } = useContext(AppNavigationContext)
    /*  */
    const [selectedExtra, setSelectedExtra] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    /*  */
    const { isConnected } = useNetInfo();

    /* ------- Functions ------- */
    function handleAddDigit(item: string) {
        if (item === '0' && price === '') return;
        if (price.length === 11 && item !== 'delete') return;
        item === 'delete' ? setPrice(price.slice(0, -1)) : setPrice(price + item);
    }

    function handleProceedPay() {
        handlePayAmount({ price, selectedExtra })
            .finally(() => {
                setPrice('')
                setSelectedExtra('')
            })
    }

    async function handlePay() {
        if (isConnected) {
            if (price.length === 0) return
            const pendingRef = mmkvStorageTemporal.getString(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE);
            const pendingDate = mmkvStorageTemporal.getString(TemporalStorageKey.PENDING_TX_DATE);

            setLoadingText((pendingRef && pendingDate) ? 'Validando información' : 'Iniciando cobro')
            isLoadingSV.set(true)

            setTimeout(async () => {
                await verifyPendingTransaction().then(() => {
                    handleProceedPay();
                });
            }, (pendingRef && pendingDate) ? 3000 : 1000)
        } else {
            setLoadingText('Sin conexión')
            isLoadingSV.set(true)
            setTimeout(() => {
                isLoadingSV.set(false)
                setLoadingText('')
            }, 3000)
        }
    }

    function handleClear() {
        setPrice('');
        setSelectedExtra('');
    }
    /* ------- END Functions ------- */

    /* ------- Effects ------- */
    useEffect(() => {
        const pendingRef = mmkvStorageTemporal.getString(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE);
        const pendingDate = mmkvStorageTemporal.getString(TemporalStorageKey.PENDING_TX_DATE);

        if (isConnected) {
            if (pendingRef && pendingDate) {
                setLoadingText('Verificando transacción inconclusa')
                isLoadingSV.set(true)
                setTimeout(async () => {
                    await verifyPendingTransaction();
                }, 3000)
            }
        }
    }, [isConnected])
    /* ------- END Effects ------- */

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
