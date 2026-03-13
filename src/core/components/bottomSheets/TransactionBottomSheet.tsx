import { Pressable, StyleSheet, View, NativeModules } from 'react-native'
import React, { useContext, useEffect } from 'react'
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
import { isTodayTransactionDate, parseDateToDate, transactionDate, transactionDateDate, transactionDateTime } from '../../utils/transactionDate'
import { useMMKVString } from 'react-native-mmkv'
import StorageKey from '../../utils/store/keysStore'
import { mmkvStorage } from '../../store/principalStore'
import { useTransactionRegister } from '../../api/transactionRegister'
import { TransactionsHistoryContext } from '../../../features/app/transactionsHistory/context'
import { useNetInfo } from '@react-native-community/netinfo'
import { printTicket } from '../../utils/printTicket'

const { SmartWrapperModule } = NativeModules;


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
};

const statusToColor: Record<string, any> = {
    Declinada: 'notificationRed',
    cancel: 'notificationRed',
    Pendiente: 'notificationYellow',
    transaction: 'notificationGreen',
};

const txnName: Record<string, any> = {
    Declinada: '',
    cancel: 'Reembolso',
    Pendiente: '',
    transaction: 'Aprobada',
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
    const [logo64, setLogo64] = useMMKVString(StorageKey.LOGO_64, mmkvStorage)
    const [locationAddress, setLocationAdress] = useMMKVString(StorageKey.LOCATION_ADRESS, mmkvStorage)
    const { transactionBottomSheetRef, transactionSelected, setTransactionSelected } = useContext(BottomSheetsContext)
    const transactionRegisterMutator = useTransactionRegister()
    const { setRefetchData } = useContext(TransactionsHistoryContext)
    const { isConnected } = useNetInfo();

    async function handlePrintTicket() {
        try {
            const DATE = transactionDateDate(transactionSelected?.data_raw?.TXN_DATE)
            const TIME = transactionDateTime(transactionSelected?.data_raw?.TXN_TIME)
            const ID = transactionSelected?.data_raw?.TXN_UNIQUE_REF
            const CARD = `**** ${transactionSelected?.data_raw?.ACCOUNT_NUMBER?.slice(-4)}`
            const CARD_BRAND = transactionSelected?.data_raw?.TAG_50
            const CARD_TYPE = transactionSelected?.data_raw?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'
            const AUTH_TYPE = transactionSelected?.data_raw?.ENTRY_MODE == '07' ? 'Contactless' : 'Chip'
            const IMPRESSION_TYPE = 'Reimpresión'
            const AMOUNT = parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            const EXTRA = parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
            const TOTAL = transactionSelected?.data_raw?.TIP ? sumarMontosExactos(parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.AMOUNT)), parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : AMOUNT
            const BANK = transactionSelected?.data_raw?.CARD_NAME
            const AFILIATION_NUMBER = transactionSelected?.data_raw?.MERCHANT_ID
            const REFERENCE = transactionSelected?.data_raw?.SG_REFERENCE
            const AUT = transactionSelected?.data_raw?.TXN_APPROVAL_CODE
            const AID = transactionSelected?.data_raw?.AID
            const ARQC = transactionSelected?.data_raw?.ARQC
            const CVM = transactionSelected?.data_raw?.TAG_9F34
            const TVR = transactionSelected?.data_raw?.TAG_95
            const TSI = transactionSelected?.data_raw?.TAG_9B
            const TXN_TYPE = transactionSelected?.data_raw?.TXN_NAME === 'VENTA EN LINEA' ? 'abrobada' : 'cancelada'

            printTicket({
                TICKET_IMAGE: logo64,
                ADDRESS: locationAddress,
                DATE,
                TIME,
                ID,
                CARD,
                CARD_BRAND,
                CARD_TYPE,
                AUTH_TYPE,
                IMPRESSION_TYPE,
                AMOUNT,
                EXTRA,
                TOTAL,
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
        } catch (err) {
            console.error(err)
        }
    }

    async function handleRefund() {
        const AMOUNT = formatPriceFromDigits(transactionSelected?.data_raw?.AMOUNT)
        const EXTRA = formatPriceFromDigits(transactionSelected?.data_raw?.TIP)
        const DATE = parseDateToDate(transactionSelected?.data_raw?.TXN_DATE)
        const REFERENCE = transactionSelected?.data_raw?.SG_REFERENCE
        const APPROVAL_CODE = transactionSelected?.data_raw?.TXN_APPROVAL_CODE

        try {
            if (isTodayTransactionDate(transactionSelected?.data_raw?.TXN_DATE)) {
                const resp = await SmartWrapperModule.cancelTransaction(AMOUNT.replaceAll(',', ''), EXTRA.replaceAll(',', ''), DATE, REFERENCE);
                const RESP_JSON = JSON.parse(resp);
                mmkvStorage.set('PENDING_CANCEL_TRANSACTION', JSON.stringify({ ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF, device_id: deviceId }))

                if (RESP_JSON.RESPONSE_CODE === '00') {

                    await transactionRegisterMutator.mutateAsync({ ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF, device_id: deviceId }).then(async () => {
                        mmkvStorage.remove('PENDING_CANCEL_TRANSACTION')
                        setTransactionSelected({ event_name: 'cancel', data_raw: { ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF } })
                        setRefetchData(true)

                        const DATE2 = transactionDateDate(RESP_JSON?.TXN_DATE)
                        const TIME = transactionDateTime(RESP_JSON?.TXN_TIME)
                        const ID = transactionSelected?.data_raw?.TXN_UNIQUE_REF
                        const CARD = `**** ${RESP_JSON?.ACCOUNT_NUMBER?.slice(-4)}`
                        const CARD_BRAND = RESP_JSON?.TAG_50
                        const CARD_TYPE = RESP_JSON?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'
                        const AUTH_TYPE = RESP_JSON?.ENTRY_MODE == '07' ? 'Contactless' : 'Chip'
                        const IMPRESSION_TYPE = 'Reimpresión'
                        const AMOUNT2 = parseFloat(formatPriceFromDigits(RESP_JSON?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                        const EXTRA2 = parseFloat(formatPriceFromDigits(RESP_JSON?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                        const TOTAL = RESP_JSON?.TIP ? sumarMontosExactos(parseFloat(formatPriceFromDigits(RESP_JSON?.AMOUNT)), parseFloat(formatPriceFromDigits(RESP_JSON?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : AMOUNT2
                        const BANK = RESP_JSON?.CARD_NAME
                        const AFILIATION_NUMBER = RESP_JSON?.MERCHANT_ID
                        const REFERENCE2 = RESP_JSON?.SG_REFERENCE
                        const AUT = RESP_JSON?.TXN_APPROVAL_CODE
                        const AID = RESP_JSON?.AID
                        const ARQC = RESP_JSON?.ARQC
                        const CVM = RESP_JSON?.TAG_9F34
                        const TVR = RESP_JSON?.TAG_95
                        const TSI = RESP_JSON?.TAG_9B
                        const TXN_TYPE = RESP_JSON?.TXN_NAME === 'VENTA EN LINEA' ? 'abrobada' : 'cancelada'

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
                            TOTAL,
                            BANK,
                            AFILIATION_NUMBER,
                            REFERENCE: REFERENCE2,
                            AUT,
                            AID,
                            ARQC,
                            CVM,
                            TVR,
                            TSI,
                            TXN_TYPE,
                        })
                    })

                }


            } else {
                const resp = await SmartWrapperModule.refundTransaction(AMOUNT.replaceAll(',', ''), EXTRA.replaceAll(',', ''), DATE, APPROVAL_CODE);
                const RESP_JSON = JSON.parse(resp);
                mmkvStorage.set('PENDING_CANCEL_TRANSACTION', JSON.stringify({ ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF, device_id: deviceId }))
                if (RESP_JSON.RESPONSE_CODE === '00') {
                    await transactionRegisterMutator.mutateAsync({ ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF, device_id: deviceId }).then(async () => {
                        mmkvStorage.remove('PENDING_CANCEL_TRANSACTION')
                        setTransactionSelected({ event_name: 'cancel', data_raw: { ...RESP_JSON, TXN_UNIQUE_REF: transactionSelected?.data_raw?.TXN_UNIQUE_REF } })
                        setRefetchData(true)

                        const DATE2 = transactionDateDate(RESP_JSON?.TXN_DATE)
                        const TIME = transactionDateTime(RESP_JSON?.TXN_TIME)
                        const ID = transactionSelected?.data_raw?.TXN_UNIQUE_REF
                        const CARD = `**** ${RESP_JSON?.ACCOUNT_NUMBER?.slice(-4)}`
                        const CARD_BRAND = RESP_JSON?.TAG_50
                        const CARD_TYPE = RESP_JSON?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'
                        const AUTH_TYPE = RESP_JSON?.ENTRY_MODE == '07' ? 'Contactless' : 'Chip'
                        const IMPRESSION_TYPE = 'Reimpresión'
                        const AMOUNT2 = parseFloat(formatPriceFromDigits(RESP_JSON?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                        const EXTRA2 = parseFloat(formatPriceFromDigits(RESP_JSON?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                        const TOTAL = RESP_JSON?.TIP ? sumarMontosExactos(parseFloat(formatPriceFromDigits(RESP_JSON?.AMOUNT)), parseFloat(formatPriceFromDigits(RESP_JSON?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : AMOUNT2
                        const BANK = RESP_JSON?.CARD_NAME
                        const AFILIATION_NUMBER = RESP_JSON?.MERCHANT_ID
                        const REFERENCE2 = RESP_JSON?.SG_REFERENCE
                        const AUT = RESP_JSON?.TXN_APPROVAL_CODE
                        const AID = RESP_JSON?.AID
                        const ARQC = RESP_JSON?.ARQC
                        const CVM = RESP_JSON?.TAG_9F34
                        const TVR = RESP_JSON?.TAG_95
                        const TSI = RESP_JSON?.TAG_9B
                        const TXN_TYPE = RESP_JSON?.TXN_NAME === 'VENTA EN LINEA' ? 'abrobada' : 'cancelada'

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
                            TOTAL,
                            BANK,
                            AFILIATION_NUMBER,
                            REFERENCE: REFERENCE2,
                            AUT,
                            AID,
                            ARQC,
                            CVM,
                            TVR,
                            TSI,
                            TXN_TYPE,
                        })
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
    }

    useEffect(() => {
        const pendingCancelation = mmkvStorage.getString('PENDING_CANCEL_TRANSACTION');
        if (isConnected) {
            if (pendingCancelation) {
                const PENDING_CANCELATION = JSON.parse(pendingCancelation)
                setTimeout(async () => {
                    await transactionRegisterMutator.mutateAsync({ ...PENDING_CANCELATION }).then(async () => {
                        mmkvStorage.remove('PENDING_CANCEL_TRANSACTION')
                        setTransactionSelected({ event_name: 'cancel', data_raw: { ...PENDING_CANCELATION } })
                        setRefetchData(true)
                        
                        const DATE2 = transactionDateDate(PENDING_CANCELATION?.TXN_DATE)
                        const TIME = transactionDateTime(PENDING_CANCELATION?.TXN_TIME)
                        const ID = transactionSelected?.data_raw?.TXN_UNIQUE_REF
                        const CARD = `**** ${PENDING_CANCELATION?.ACCOUNT_NUMBER?.slice(-4)}`
                        const CARD_BRAND = PENDING_CANCELATION?.TAG_50
                        const CARD_TYPE = PENDING_CANCELATION?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'
                        const AUTH_TYPE = PENDING_CANCELATION?.ENTRY_MODE == '07' ? 'Contactless' : 'Chip'
                        const IMPRESSION_TYPE = 'Reimpresión'
                        const AMOUNT2 = parseFloat(formatPriceFromDigits(PENDING_CANCELATION?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                        const EXTRA2 = parseFloat(formatPriceFromDigits(PENDING_CANCELATION?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                        const TOTAL = PENDING_CANCELATION?.TIP ? sumarMontosExactos(parseFloat(formatPriceFromDigits(PENDING_CANCELATION?.AMOUNT)), parseFloat(formatPriceFromDigits(PENDING_CANCELATION?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : AMOUNT2
                        const BANK = PENDING_CANCELATION?.CARD_NAME
                        const AFILIATION_NUMBER = PENDING_CANCELATION?.MERCHANT_ID
                        const REFERENCE2 = PENDING_CANCELATION?.SG_REFERENCE
                        const AUT = PENDING_CANCELATION?.TXN_APPROVAL_CODE
                        const AID = PENDING_CANCELATION?.AID
                        const ARQC = PENDING_CANCELATION?.ARQC
                        const CVM = PENDING_CANCELATION?.TAG_9F34
                        const TVR = PENDING_CANCELATION?.TAG_95
                        const TSI = PENDING_CANCELATION?.TAG_9B
                        const TXN_TYPE = PENDING_CANCELATION?.TXN_NAME === 'VENTA EN LINEA' ? 'abrobada' : 'cancelada'

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
                            TOTAL,
                            BANK,
                            AFILIATION_NUMBER,
                            REFERENCE: REFERENCE2,
                            AUT,
                            AID,
                            ARQC,
                            CVM,
                            TVR,
                            TSI,
                            TXN_TYPE,
                        })
                    })
                })
            }
        }
    }, [isConnected])

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
                    <Pressable onPress={handlePrintTicket} hitSlop={{ right: sizeToDp(APP_PADDING * 2), left: sizeToDp(APP_PADDING * 2) }} style={[{ flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.3), paddingTop: sizeToDp(APP_PADDING * 0.2), paddingBottom: sizeToDp(APP_PADDING * 0.8) }]} >
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
                <ListItem listKey='Tipo' listValue={transactionSelected?.data_raw?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'} />
                <ListItem listKey='Autarización' listValue={transactionSelected?.data_raw?.CARD_TYPE == '07' ? 'Contactless' : 'Chip'} />
                {(transactionSelected?.data_raw?.TIP && transactionSelected?.data_raw?.TIP !== '0') && <ListItem listKey='Consumo' listValue={`${parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} MXN`} />}
                {(transactionSelected?.data_raw?.TIP && transactionSelected?.data_raw?.TIP !== '0') && <ListItem listKey='Extra' listValue={`${parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} MXN`} greenText={`${getExtraPercentage({ montoBase: transactionSelected?.data_raw?.AMOUNT, montoExtra: transactionSelected?.data_raw?.TIP })}`} />}
                {
                    transactionSelected?.data_raw?.TIP
                        ? <ListItem listKey='Total' listValue={`${sumarMontosExactos(parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.AMOUNT)), parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} MXN`} />
                        : <ListItem listKey='Total' listValue={`${parseFloat(formatPriceFromDigits(transactionSelected?.data_raw?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} MXN`} />
                }
            </View>

            <Divider text='Información bancaria' />
            <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING * 1), rowGap: sizeToDp(APP_PADDING * 0.5) }]} >
                <ListItem listKey='Banco' listValue={transactionSelected?.data_raw?.CARD_NAME} />
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

const styles = StyleSheet.create({})