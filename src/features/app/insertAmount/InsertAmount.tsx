import { StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { sizeToDp } from '../../../core/utils/sizeToDP'
import { APP_PADDING } from '../../../core/utils/constants'
import { PaymentAmountHeader } from './components/PaymentAmountHeader'
import { NumbersKeyPad } from '../../../core/components/NumbersKeyPad'
import GradientButton from '../../../core/components/buttons/GradientButton'
import { InsetsContext } from '../../../core/utils/styles/insets'
import { InsertAmountContext } from './context'
import { mmkvStorage } from '../../../core/store/principalStore'
import { useNetInfo, fetch } from "@react-native-community/netinfo";
import { obtenerFechaActual, obtenerHoraActual, transactionDateDate, transactionDateTime } from '../../../core/utils/transactionDate'
import { formatPriceFromDigits } from '../../../core/utils/priceFormater'
import { sumarMontosExactos } from '../../../core/utils/sumarMontosExactos'
import StorageKey from '../../../core/utils/store/keysStore'
import { useMMKVString } from 'react-native-mmkv'
import { printErrorTicket, printTicket } from '../../../core/utils/printTicket'
import { AppNavigationContext } from '../appNavigation/context'

const InsertAmount = () => {
    /*  */
    const INSETS = useContext(InsetsContext)
    const { handlePayAmount, verifyPendingTransaction } = useContext(InsertAmountContext)
    const { isLoadingSV, setLoadingText } = useContext(AppNavigationContext)
    const [logo64, setLogo64] = useMMKVString(StorageKey.LOGO_64, mmkvStorage)
    const [locationAddress, setLocationAddress] = useMMKVString(StorageKey.LOCATION_ADRESS, mmkvStorage)
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

    async function verifyPendigTxns() {
        try {
            await verifyPendingTransaction().then(async (res: any) => {
                if (res) {
                    isLoadingSV.set(true)
                    setLoadingText('Imprimiendo ticket')
                    setPrice('')
                    setSelectedExtra('')

                    const DATE2 = transactionDateDate(res?.TXN_DATE)
                    const TIME = transactionDateTime(res?.TXN_TIME)
                    const ID = res?.TXN_UNIQUE_REF
                    const CARD = `**** ${res?.ACCOUNT_NUMBER?.slice(-4)}`
                    const CARD_BRAND = res?.TAG_50
                    const CARD_TYPE = res?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'
                    const AUTH_TYPE = res?.ENTRY_MODE == '07' ? 'Contactless' : 'Chip'
                    const IMPRESSION_TYPE = 'Original'
                    const AMOUNT2 = parseFloat(formatPriceFromDigits(res?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    const EXTRA2 = parseFloat(formatPriceFromDigits(res?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    const TOTAL2 = res?.TIP ? sumarMontosExactos(parseFloat(formatPriceFromDigits(res?.AMOUNT)), parseFloat(formatPriceFromDigits(res?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : AMOUNT2
                    const BANK = res?.CARD_NAME
                    const AFILIATION_NUMBER = res?.MERCHANT_ID
                    const REFERENCE = res?.SG_REFERENCE
                    const AUT = res?.TXN_APPROVAL_CODE
                    const AID = res?.AID
                    const ARQC = res?.ARQC
                    const CVM = res?.TAG_9F34
                    const TVR = res?.TAG_95
                    const TSI = res?.TAG_9B
                    const TXN_TYPE = res?.TXN_NAME === 'VENTA EN LINEA' ? 'abrobada' : 'cancelada'

                    await printTicket({
                        TICKET_IMAGE: logo64,
                        ADDRESS: locationAddress,
                        DATE: DATE2,
                        TIME,
                        ID,
                        CARD,
                        CARD_BRAND,
                        CARD_TYPE,
                        AUTH_TYPE,
                        IMPRESSION_TYPE,
                        AMOUNT: AMOUNT2,
                        EXTRA: EXTRA2,
                        TOTAL: TOTAL2,
                        BANK,
                        AFILIATION_NUMBER,
                        REFERENCE,
                        AUT,
                        AID,
                        ARQC,
                        CVM,
                        TVR,
                        TSI,
                        TXN_TYPE,
                    })
                        .then(() => {
                            setLoadingText('')
                            isLoadingSV.set(false)
                        })
                        .catch((err) => {
                            console.error('err printing')
                            console.error(err)
                            isLoadingSV.set(true)
                            setLoadingText(err.message)
                            setTimeout(() => {
                                setLoadingText('')
                                isLoadingSV.set(false)
                            }, 3000)
                        })
                }
            });
        } catch (error: any) {
            if (error?.message == '99') {
                setLoadingText('Porfavor espere un momento')
                isLoadingSV.set(true)
                setTimeout(() => {
                    isLoadingSV.set(false)
                    setLoadingText('')
                }, 3000)
            }
            if (error?.message == '97') {
                /* Txn no registrada */
                isLoadingSV.set(false)
                setLoadingText('')

                if (price != '') {
                    isLoadingSV.set(true)
                    setLoadingText('Iniciando cobro')
                    setTimeout(() => {
                        handleProceedPay();
                    }, 1500)
                }

                await printErrorTicket({
                    TICKET_IMAGE: logo64,
                    ADDRESS: locationAddress,
                    DATE: obtenerFechaActual(),
                    TIME: obtenerHoraActual(),
                    TXN_TYPE: 'Transacción no existe en plataforma',
                })
                    .then(() => {
                        setLoadingText('')
                        isLoadingSV.set(false)
                    })
                    .catch((err) => {
                        console.error('err printing')
                        console.error(err)
                        isLoadingSV.set(true)
                        setLoadingText(err.message)
                        setTimeout(() => {
                            setLoadingText('')
                            isLoadingSV.set(false)
                        }, 3000)
                    })
            }
            if (error?.message == '01') {
                /* REVERSADA */
                isLoadingSV.set(false)
                setLoadingText('')

                await printErrorTicket({
                    TICKET_IMAGE: logo64,
                    ADDRESS: locationAddress,
                    DATE: obtenerFechaActual(),
                    TIME: obtenerHoraActual(),
                    TXN_TYPE: 'Reversada',
                })
                    .then(() => {
                        setLoadingText('')
                        isLoadingSV.set(false)
                    })
                    .catch((err) => {
                        console.error('err printing')
                        console.error(err)
                        isLoadingSV.set(true)
                        setLoadingText(err.message)
                        setTimeout(() => {
                            setLoadingText('')
                            isLoadingSV.set(false)
                        }, 3000)
                    })
            }
            if (error?.message == '') {
                isLoadingSV.set(false)
                setLoadingText('')

                await printErrorTicket({
                    TICKET_IMAGE: logo64,
                    ADDRESS: locationAddress,
                    DATE: obtenerFechaActual(),
                    TIME: obtenerHoraActual(),
                    TXN_TYPE: 'Tiempo de espera agotado',
                })
                    .then(() => {
                        setLoadingText('')
                        isLoadingSV.set(false)
                    })
                    .catch((err) => {
                        console.error('err printing')
                        console.error(err)
                        isLoadingSV.set(true)
                        setLoadingText(err.message)
                        setTimeout(() => {
                            setLoadingText('')
                            isLoadingSV.set(false)
                        }, 3000)
                    })
            }

            throw new Error(error?.message)
        }
    }

    function handleProceedPay() {
        handlePayAmount({ price, selectedExtra })
            .then(async (res: any) => {

                isLoadingSV.set(true)
                setLoadingText('Imprimiendo ticket')
                setPrice('')
                setSelectedExtra('')

                const DATE2 = transactionDateDate(res?.TXN_DATE)
                const TIME = transactionDateTime(res?.TXN_TIME)
                const ID = res?.TXN_UNIQUE_REF
                const CARD = `**** ${res?.ACCOUNT_NUMBER?.slice(-4)}`
                const CARD_BRAND = res?.TAG_50
                const CARD_TYPE = res?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'
                const AUTH_TYPE = res?.ENTRY_MODE == '07' ? 'Contactless' : 'Chip'
                const IMPRESSION_TYPE = 'Original'
                const AMOUNT2 = parseFloat(formatPriceFromDigits(res?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                const EXTRA2 = parseFloat(formatPriceFromDigits(res?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                const TOTAL2 = res?.TIP ? sumarMontosExactos(parseFloat(formatPriceFromDigits(res?.AMOUNT)), parseFloat(formatPriceFromDigits(res?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : AMOUNT2
                const BANK = res?.CARD_NAME
                const AFILIATION_NUMBER = res?.MERCHANT_ID
                const REFERENCE = res?.SG_REFERENCE
                const AUT = res?.TXN_APPROVAL_CODE
                const AID = res?.AID
                const ARQC = res?.ARQC
                const CVM = res?.TAG_9F34
                const TVR = res?.TAG_95
                const TSI = res?.TAG_9B
                const TXN_TYPE = res?.TXN_NAME === 'VENTA EN LINEA' ? 'abrobada' : 'cancelada'

                await printTicket({
                    TICKET_IMAGE: logo64,
                    ADDRESS: locationAddress,
                    DATE: DATE2,
                    TIME,
                    ID,
                    CARD,
                    CARD_BRAND,
                    CARD_TYPE,
                    AUTH_TYPE,
                    IMPRESSION_TYPE,
                    AMOUNT: AMOUNT2,
                    EXTRA: EXTRA2,
                    TOTAL: TOTAL2,
                    BANK,
                    AFILIATION_NUMBER,
                    REFERENCE,
                    AUT,
                    AID,
                    ARQC,
                    CVM,
                    TVR,
                    TSI,
                    TXN_TYPE,
                })
                    .then(() => {
                        setLoadingText('')
                        isLoadingSV.set(false)
                    })
                    .catch((err) => {
                        console.error('err printing')
                        console.error(err)
                        isLoadingSV.set(true)
                        setLoadingText(err.message)
                        setTimeout(() => {
                            setLoadingText('')
                            isLoadingSV.set(false)
                        }, 3000)
                    })
            })
            .catch((err: any) => {
                const ERR = JSON.parse(err.message)

                setPrice('')
                setSelectedExtra('')

                fetch().then(async state => {

                    if (!state.isConnected) {
                        isLoadingSV.set(false)
                        setLoadingText('')
                        return null
                    }

                    if (ERR.suggest_query === 'true') {
                        setLoadingText('Validando información');
                        isLoadingSV.set(true)

                        setTimeout(async () => {
                            await verifyPendigTxns()
                        }, 3000)
                    } else if (ERR?.response_code == '99') {
                        /* Txn no registrada, retirada por el user, cancelada por el user, Imposible conectarse al servidor */
                        mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                        mmkvStorage.remove('PENDING_TX_DATE')
                        isLoadingSV.set(false)
                        setLoadingText('')

                        await printErrorTicket({
                            TICKET_IMAGE: logo64,
                            ADDRESS: locationAddress,
                            DATE: obtenerFechaActual(),
                            TIME: obtenerHoraActual(),
                            TXN_TYPE: ERR?.error_message,
                        })
                            .then(() => {
                                setLoadingText('')
                                isLoadingSV.set(false)
                            })
                            .catch((err) => {
                                console.error('err printing')
                                console.error(err)
                                isLoadingSV.set(true)
                                setLoadingText(err.message)
                                setTimeout(() => {
                                    setLoadingText('')
                                    isLoadingSV.set(false)
                                }, 3000)
                            })
                    }
                });
            })
    }

    async function handlePay() {
        if (isConnected) {
            if (price.length === 0) return
            const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
            const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');

            setLoadingText((pendingRef && pendingDate) ? 'Validando información' : 'Iniciando cobro')
            isLoadingSV.set(true)

            setTimeout(async () => {
                await verifyPendigTxns().then(() => {
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
        const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
        const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');

        if (isConnected) {
            if (pendingRef && pendingDate) {
                setLoadingText('Verificando transacción inconclusa')
                isLoadingSV.set(true)
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
