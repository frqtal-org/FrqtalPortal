import { Pressable, View, NativeModules } from 'react-native'
import React, { useCallback, useContext, useEffect } from 'react'
import GeneralBottomSheet from './GeneralBottomSheet'
import { BottomSheetsContext } from './context'
import { Typography } from '../Typography'
import FastImage from 'react-native-fast-image'
import { APP_PADDING } from '../../utils/constants'
import { sizeToDp } from '../../utils/sizeToDP'
import theme from '../../utils/styles/styles'
import { toTitleCase } from '../../utils/titleCase'
import { formatPriceFromDigits } from '../../utils/priceFormater'
import { sumarMontosExactos } from '../../utils/sumarMontosExactos'
import { getExtraPercentage } from '../../utils/getExtraPercentage'
import { isTodayTransactionDate, parseDateToDate, transactionDate } from '../../utils/transactionDate'
import { useMMKVString } from 'react-native-mmkv'
import StorageKey from '../../utils/store/keysStore'
import { mmkvStorage } from '../../store/principalStore'
import { useTransactionRegister } from '../../api/transactionRegister'
import { TransactionsHistoryContext } from '../../../features/app/transactionsHistory/context'
import { useNetInfo } from '@react-native-community/netinfo'
import { printTicketAUX } from '../../utils/printTicket'
import { AppNavigationContext } from '../../../features/app/appNavigation/context'
import { InsertAmountContext } from '../../../features/app/insertAmount/context'
import { useFocusEffect } from '@react-navigation/native'

const { SmartWrapperModule } = NativeModules;

let PRINTER_ERROR_TO: number
let NO_CONNECTION_TO: number
let PENDING_CANCEL_TO: number

const ListItem = ({ listKey, listValue, greenText }: { listKey: string, listValue: string, greenText?: string }) => {
    return <View style={[{ flexDirection: 'row', alignItems: 'center' }]} >
        <Typography variant='subtitle02Regular' color='textEleventh' >{listKey}: </Typography>
        <View style={[{ flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.2) }]} >
            <Typography variant='subtitle02Medium' >{listValue}</Typography>
            {greenText && <Typography variant='text02Regular' color='notificationGreen' >{greenText}</Typography>}
        </View>
    </View>
}

const statusToImageMap: Record<string, any> = {
    Declinada: require('../../assets/images/error.webp'),
    cancel: require('../../assets/images/error.webp'),
    Pendiente: require('../../assets/images/pending.webp'),
    transaction: require('../../assets/images/accepted.webp'),
    processed: require('../../assets/images/accepted.webp'),
};

const statusToColor: Record<string, any> = {
    Declinada: 'notificationRed',
    cancel: 'notificationRed',
    Pendiente: 'notificationYellow',
    transaction: 'notificationGreen',
    processed: 'notificationGreen',
};

const txnName: Record<string, any> = {
    Declinada: '',
    cancel: 'Reembolso',
    Pendiente: '',
    transaction: 'Aprobada',
    processed: 'Aprobada',
};

const Divider = ({ text }: { text: string }) => {
    return <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING * 0.8), flexDirection: 'row', alignItems: 'center', width: '100%', columnGap: sizeToDp(APP_PADDING * 0.5), marginBottom: sizeToDp(APP_PADDING * 0.7) }]} >
        <View style={[{ height: 2, backgroundColor: theme.colors.glassPrimary, flex: 1 }]} />
        <Typography color='textEleventh'>{text}</Typography>
        <View style={[{ height: 2, backgroundColor: theme.colors.glassPrimary, flex: 1 }]} />
    </View>
}

const TransactionBottomSheet = () => {
    const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)
    const { transactionBottomSheetRef, transactionSelected, setTransactionSelected } = useContext(BottomSheetsContext)
    const transactionRegisterMutator = useTransactionRegister()
    const { setRefetchData } = useContext(TransactionsHistoryContext)
    const { isConnected } = useNetInfo();
    const { isLoadingSV, setLoadingText } = useContext(AppNavigationContext)
    const { verifyPendingTransaction } = useContext(InsertAmountContext)


    const rawAmount = parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.AMOUNT).replaceAll(',', ''));
    const rawTip = transactionSelected?.data_raw?.TIP ? parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.TIP).replaceAll(',', '')) : 0;
    const AMOUNT = rawAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const EXTRA = rawTip.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const TOTAL = sumarMontosExactos(rawAmount, rawTip).toLocaleString('en-US', { style: 'currency', currency: 'USD' });



    async function handlePrintTicket(ticketData: any) {
        try {
            setLoadingText('Imprimiendo ticket')
            isLoadingSV.set(true)

            await printTicketAUX(ticketData)
                .then(() => {
                    setLoadingText('')
                    isLoadingSV.set(false)
                })
                .catch((err) => {
                    console.error('err printing')
                    console.error(err)
                    setLoadingText(err.message)
                    isLoadingSV.set(true)
                    PRINTER_ERROR_TO && clearTimeout(PRINTER_ERROR_TO)
                    PRINTER_ERROR_TO = setTimeout(() => {
                        setLoadingText('')
                        isLoadingSV.set(false)
                    }, 3000)
                })
        } catch (err) {
            console.error(err)
        }
    }

    async function handleRefund() {
        if (isConnected) {
            await verifyPendingTransaction().then(async () => {
                const AMOUNT_TO_REFUND = formatPriceFromDigits(transactionSelected?.data_raw?.AMOUNT)
                const EXTRA_TO_REFUND = formatPriceFromDigits(transactionSelected?.data_raw?.TIP)
                const DATE = parseDateToDate(transactionSelected?.data_raw?.TXN_DATE)
                const REFERENCE = transactionSelected?.data_raw?.SG_REFERENCE
                const APPROVAL_CODE = transactionSelected?.data_raw?.TXN_APPROVAL_CODE

                try {
                    if (isTodayTransactionDate(transactionSelected?.data_raw?.TXN_DATE)) {
                        const resp = await SmartWrapperModule.cancelTransaction(AMOUNT_TO_REFUND.replaceAll(',', ''), EXTRA_TO_REFUND.replaceAll(',', ''), DATE, REFERENCE);
                        const RESP_JSON = JSON.parse(resp);
                        mmkvStorage.set(StorageKey.PENDING_CANCEL_TRANSACTION, JSON.stringify({ ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF, device_id: deviceId }))

                        if (RESP_JSON.RESPONSE_CODE === '00') {

                            await transactionRegisterMutator.mutateAsync({ ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF, device_id: deviceId }).then(async () => {
                                mmkvStorage.remove(StorageKey.PENDING_CANCEL_TRANSACTION)
                                setTransactionSelected({ event_name: 'cancel', data_raw: { ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF } })
                                setRefetchData(true)
                                await handlePrintTicket({ ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF })
                            })

                        }


                    } else {
                        const resp = await SmartWrapperModule.refundTransaction(AMOUNT_TO_REFUND.replaceAll(',', ''), EXTRA_TO_REFUND.replaceAll(',', ''), DATE, APPROVAL_CODE);
                        const RESP_JSON = JSON.parse(resp);
                        mmkvStorage.set(StorageKey.PENDING_CANCEL_TRANSACTION, JSON.stringify({ ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF, device_id: deviceId }))
                        if (RESP_JSON.RESPONSE_CODE === '00') {
                            await transactionRegisterMutator.mutateAsync({ ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF, device_id: deviceId }).then(async () => {
                                mmkvStorage.remove(StorageKey.PENDING_CANCEL_TRANSACTION)
                                setTransactionSelected({ event_name: 'cancel', data_raw: { ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF } })
                                setRefetchData(true)
                                const ID = transactionSelected?.data_raw?.TXN_UNIQUE_REF
                                await handlePrintTicket({ ...RESP_JSON, ID })
                            })
                        }
                    }
                } catch (error: any) {
                    const ERR = JSON.parse(error?.message)
                    console.error(ERR);
                    if (ERR.response_code == '67') {
                        /* Txn cancelada previamente - NO HAY FORMA DE VERIFICAR O GARDAR LA DATA PENDIENTE */
                    }
                    throw new Error(ERR.response_code)
                }
            })
        } else {
            setLoadingText('Sin conexión')
            isLoadingSV.set(true)
            NO_CONNECTION_TO && clearTimeout(NO_CONNECTION_TO)
            NO_CONNECTION_TO = setTimeout(() => {
                isLoadingSV.set(false)
                setLoadingText('')
            }, 3000)
        }
    }

    useEffect(() => {
        const pendingCancelation = mmkvStorage.getString(StorageKey.PENDING_CANCEL_TRANSACTION);
        if (isConnected) {
            if (pendingCancelation) {
                const PENDING_CANCELATION = JSON.parse(pendingCancelation)
                PENDING_CANCEL_TO && clearTimeout(PENDING_CANCEL_TO)
                PENDING_CANCEL_TO = setTimeout(async () => {
                    await transactionRegisterMutator.mutateAsync({ ...PENDING_CANCELATION }).then(async () => {
                        mmkvStorage.remove(StorageKey.PENDING_CANCEL_TRANSACTION)
                        setTransactionSelected({ event_name: 'cancel', data_raw: { ...PENDING_CANCELATION } })
                        setRefetchData(true)
                        const ID = transactionSelected?.data_raw?.TXN_UNIQUE_REF
                        await handlePrintTicket({ ...PENDING_CANCELATION, ID })
                    })
                })
            }
        }
    }, [isConnected])

    useFocusEffect(useCallback(() => {
        return () => {
            PRINTER_ERROR_TO && clearTimeout(PRINTER_ERROR_TO);
            NO_CONNECTION_TO && clearTimeout(NO_CONNECTION_TO);
            PENDING_CANCEL_TO && clearTimeout(PENDING_CANCEL_TO);
        }
    }, []))

    return (
        <GeneralBottomSheet borderColor={statusToColor[transactionSelected?.event_name]} ref={transactionBottomSheetRef} >
            <View style={[{ alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.7), paddingHorizontal: sizeToDp(APP_PADDING * 0.8), paddingTop: sizeToDp(APP_PADDING * 0.8), rowGap: sizeToDp(APP_PADDING * 0.5) }]} >
                <FastImage
                    source={statusToImageMap[transactionSelected?.event_name]}
                    style={[{ width: sizeToDp(APP_PADDING * 4.5), aspectRatio: 1 }]}
                    resizeMode='contain'
                />
                <View style={[{ rowGap: sizeToDp(APP_PADDING * 0.3), alignItems: 'center' }]} >
                    <Typography variant='title01Bold' >{txnName[transactionSelected?.event_name]}</Typography>
                    <Typography variant='subtitle02Regular' color='textEleventh' >{transactionDate(transactionSelected?.data_raw?.TXN_DATE, transactionSelected?.data_raw?.TXN_TIME)}</Typography>
                    <Pressable onPress={() => handlePrintTicket(transactionSelected?.data_raw)} hitSlop={{ right: sizeToDp(APP_PADDING * 2), left: sizeToDp(APP_PADDING * 2) }} style={[{ flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.3), paddingTop: sizeToDp(APP_PADDING * 0.2), paddingBottom: sizeToDp(APP_PADDING * 0.8) }]} >
                        <Typography variant='subtitle02Medium' color='brand200' >Imprimir</Typography>
                        <FastImage
                            source={require('../../assets/images/print200.png')}
                            style={[{ width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]}
                            resizeMode='contain'
                        />
                    </Pressable>
                </View>
            </View>

            <Divider text='Transacción' />
            <View style={[{ rowGap: sizeToDp(APP_PADDING * 0.5), paddingHorizontal: sizeToDp(APP_PADDING * 1), marginBottom: sizeToDp(APP_PADDING * 0.8) }]} >
                {transactionSelected?.data_raw?.TXN_UNIQUE_REF && <ListItem listKey='Id' listValue={`${transactionSelected?.data_raw?.TXN_UNIQUE_REF}`} />}
                <ListItem listKey='Tarjeta' listValue={`**** ${transactionSelected?.data_raw?.ACCOUNT_NUMBER?.slice(-4)}`} />
                <ListItem listKey='Marca' listValue={toTitleCase(transactionSelected?.data_raw?.TAG_50)} />
                {/* <ListItem listKey='Tipo' listValue={transactionSelected?.data_raw?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'} /> */}
                <ListItem listKey='Autarización' listValue={transactionSelected?.data_raw?.CARD_TYPE == '07' ? 'Contactless' : 'Chip'} />
                {(transactionSelected?.data_raw?.TIP && transactionSelected?.data_raw?.TIP !== '0') && <ListItem listKey='Consumo' listValue={`${AMOUNT} MXN`} />}
                {(transactionSelected?.data_raw?.TIP && transactionSelected?.data_raw?.TIP !== '0') && <ListItem listKey='Extra' listValue={`${EXTRA} MXN`} greenText={`${getExtraPercentage({ montoBase: transactionSelected?.data_raw?.AMOUNT, montoExtra: transactionSelected?.data_raw?.TIP })}`} />}
                {
                    transactionSelected?.data_raw?.TIP
                        ? <ListItem listKey='Total' listValue={`${TOTAL} MXN`} />
                        : <ListItem listKey='Total' listValue={`${AMOUNT} MXN`} />
                }
            </View>

            <Divider text='Información bancaria' />
            <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING * 1), rowGap: sizeToDp(APP_PADDING * 0.5) }]} >
                {/* <ListItem listKey='Banco' listValue={transactionSelected?.data_raw?.CARD_NAME} /> */}
                <ListItem listKey='Referencia' listValue={transactionSelected?.data_raw?.SG_REFERENCE} />
                <ListItem listKey='Código de aprovación' listValue={transactionSelected?.data_raw?.TXN_APPROVAL_CODE} />
            </View>


            {(transactionSelected?.event_name !== 'cancel' && transactionSelected?.event_name !== 'Reembolso') && <View style={[{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingHorizontal: sizeToDp(APP_PADDING) }]} >
                <Pressable onPress={handleRefund} style={[{ paddingBottom: sizeToDp(APP_PADDING), paddingTop: sizeToDp(APP_PADDING * 1.2), flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.3) }]} >
                    <Typography variant='subtitle02Medium' color='notificationRed' >Reembolso</Typography>
                    <FastImage
                        source={require('../../assets/images/refundRed.png')}
                        style={[{ width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]}
                        resizeMode='contain'
                    />
                </Pressable>
            </View>}

            {!(transactionSelected?.event_name !== 'cancel' && transactionSelected?.event_name !== 'Reembolso') && <View style={[{ height: sizeToDp(APP_PADDING * 0.8) }]} />}
        </GeneralBottomSheet>
    )
}

export default TransactionBottomSheet
