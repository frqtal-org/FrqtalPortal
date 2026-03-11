import { StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { sizeToDp } from '../../../core/utils/sizeToDP'
import { APP_PADDING } from '../../../core/utils/constants'
import { PaymentAmountHeader } from './components/PaymentAmountHeader'
import { NumbersKeyPad } from '../../../core/components/NumbersKeyPad'
import GradientButton from '../../../core/components/buttons/GradientButton'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import LoadingScreen from '../../../core/components/Loading/LoadingScreen'
import { InsetsContext } from '../../../core/utils/styles/insets'
import { InsertAmountContext } from './context'
import { mmkvStorage } from '../../../core/store/principalStore'
import { useNetInfo } from "@react-native-community/netinfo";

const InsertAmount = () => {
    /*  */
    const INSETS = useContext(InsetsContext)
    const { handlePayAmount, verifyPendingTransaction } = useContext(InsertAmountContext)
    /*  */
    const [selectedExtra, setSelectedExtra] = useState<string>('');
    const [loadingTextStatus, setLoadingTextStatus] = useState('')
    const [price, setPrice] = useState<string>('');
    /*  */
    const isPaymentLoadingSV = useSharedValue(false)
    const { isConnected } = useNetInfo();

    /* ------- Functions ------- */
    function handleAddDigit(item: string) {
        if (item === '0' && price === '') return;
        if (price.length === 11 && item !== 'delete') return;
        item === 'delete' ? setPrice(price.slice(0, -1)) : setPrice(price + item);
    }

    async function verifyPendigTxns() {
        try {
            await verifyPendingTransaction();
            isPaymentLoadingSV.set(false)
            setLoadingTextStatus('')
        } catch (error: any) {
            if (error?.message == '99') {
                setLoadingTextStatus('Transacción en proceso, porfavor espere un momento')
                isPaymentLoadingSV.set(true)
                setTimeout(() => {
                    isPaymentLoadingSV.set(false)
                    setLoadingTextStatus('')
                }, 3000)
            }
            if (error?.message == '97') {
                /* Txn no registrada */
                mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                mmkvStorage.remove('PENDING_TX_DATE')
                isPaymentLoadingSV.set(false)
                setLoadingTextStatus('')
            }
            if (error?.message == '01') {
                /* REVERSADA */
                mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                mmkvStorage.remove('PENDING_TX_DATE')
                isPaymentLoadingSV.set(false)
                setLoadingTextStatus('')
            }

            throw new Error(error?.message)
        }
    }

    async function handlePay() {
        if (isConnected) {
            if (price.length === 0) return
            const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
            const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');
            setLoadingTextStatus((pendingRef && pendingDate) ? 'Validando información' : 'Iniciando cobro')
            isPaymentLoadingSV.set(true)

            setTimeout(async () => {
                await verifyPendigTxns().then(() => {
                    handlePayAmount({ price, selectedExtra })
                        .then(() => {
                            setTimeout(() => {
                                isPaymentLoadingSV.set(false)
                                setLoadingTextStatus('')
                            }, 300)
                        })
                        .catch((err: any) => {
                            const ERR = JSON.parse(err.message)
                            if (ERR.suggest_query === 'true') {
                                setLoadingTextStatus('Validando información');
                                isPaymentLoadingSV.set(true)
                                setTimeout(async () => {
                                    await verifyPendigTxns()
                                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE')
                                    mmkvStorage.remove('PENDING_TX_DATE')
                                    isPaymentLoadingSV.set(false)
                                    setLoadingTextStatus('')
                                }, 3000)
                            } else if (ERR?.response_code == '99') {
                                /* Txn no registrada */
                                mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                                mmkvStorage.remove('PENDING_TX_DATE')
                                isPaymentLoadingSV.set(false)
                                setLoadingTextStatus('')
                            } else {
                                setTimeout(() => {
                                    isPaymentLoadingSV.set(false)
                                    setLoadingTextStatus('')
                                }, 300)
                            }
                        }).finally(() => {
                            setPrice('')
                            setSelectedExtra('')
                        })
                }).catch((error): any => {
                    if (error?.message == '97') {
                        setLoadingTextStatus('Iniciando cobro')
                        isPaymentLoadingSV.set(true)
                        setTimeout(() => {
                            handlePayAmount({ price, selectedExtra })
                                .then(() => {
                                    setTimeout(() => {
                                        isPaymentLoadingSV.set(false)
                                        setLoadingTextStatus('')
                                    }, 300)
                                })
                                .catch((err: any) => {
                                    const ERR = JSON.parse(err.message)
                                    if (ERR.suggest_query === 'true') {
                                        setLoadingTextStatus('Validando información');
                                        isPaymentLoadingSV.set(true)
                                        setTimeout(async () => {
                                            await verifyPendigTxns()
                                            mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE')
                                            mmkvStorage.remove('PENDING_TX_DATE')
                                            isPaymentLoadingSV.set(false)
                                            setLoadingTextStatus('')
                                        }, 3000)
                                    } else if (ERR?.response_code == '99') {
                                        /* Txn no registrada */
                                        mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                                        mmkvStorage.remove('PENDING_TX_DATE')
                                        isPaymentLoadingSV.set(false)
                                        setLoadingTextStatus('')
                                    } else {
                                        setTimeout(() => {
                                            isPaymentLoadingSV.set(false)
                                            setLoadingTextStatus('')
                                        }, 300)
                                    }
                                }).finally(() => {
                                    setPrice('')
                                    setSelectedExtra('')
                                })
                        }, 4000)
                    }
                })
            }, (pendingRef && pendingDate) ? 3000 : 0)
        } else {
            setLoadingTextStatus('Sin conexión')
            isPaymentLoadingSV.set(true)
            setTimeout(() => {
                isPaymentLoadingSV.set(false)
                setLoadingTextStatus('')
            }, 3000)
        }
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

    /* ------- Effects ------- */
    useEffect(() => {
        const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
        const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');

        if (isConnected) {
            if (pendingRef && pendingDate) {
                setLoadingTextStatus('Verificando transacción inconclusa')
                isPaymentLoadingSV.set(true)
                setTimeout(async () => {
                    await verifyPendigTxns();
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
