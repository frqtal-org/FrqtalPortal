import React, { createContext, useContext } from "react";
import { NativeModules } from "react-native";
import { useMMKVString } from "react-native-mmkv";
import uuid from 'react-native-uuid';
import { useTransactionRegister } from "../../../core/api/transactionRegister";
import { BottomSheetsContext } from "../../../core/components/bottomSheets/context";
import { mmkvStorage } from "../../../core/store/principalStore";
import { getCurrentDateDDMMAAAA } from "../../../core/utils/getDateDDMMAAAA";
import { calculateExtraAmount, formatPriceFromDigits } from "../../../core/utils/priceFormater";
import StorageKey from "../../../core/utils/store/keysStore";
import { TransactionsHistoryContext } from "../transactionsHistory/context";
import { printTicket } from "../../../core/utils/printTicket";
import { transactionDateDate, transactionDateTime } from "../../../core/utils/transactionDate";
import { sumarMontosExactos } from "../../../core/utils/sumarMontosExactos";

const InsertAmountContext = createContext<any>({});

const { SmartWrapperModule } = NativeModules;

export function InsertAmountContextProvider({ children }: { children: React.ReactNode }) {
    const { setRefetchData } = useContext(TransactionsHistoryContext)
    const { setTransactionSelected } = useContext(BottomSheetsContext)

    const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)
    const [SPIdCemmerce, setSPIdCemmerce] = useMMKVString(StorageKey.SP_ID_COMMECRE, mmkvStorage)
    const [logo64, setLogo64] = useMMKVString(StorageKey.LOGO_64, mmkvStorage)
    const [locationAddress, setLocationAddress] = useMMKVString(StorageKey.LOCATION_ADRESS, mmkvStorage)

    const transactionRegisterMutator = useTransactionRegister()

    async function verifyPendingTransaction() {
        const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
        const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');

        if (pendingRef && pendingDate) {
            try {
                const respuestaString = await SmartWrapperModule.queryUniqueTransaction(pendingRef, pendingDate);
                const respuestaJSON = JSON.parse(respuestaString);

                if (respuestaJSON.RESPONSE_CODE === '00') {
                    await transactionRegisterMutator.mutateAsync({ ...respuestaJSON, device_id: deviceId })
                    setTransactionSelected({ event_name: 'transaction', data_raw: respuestaJSON })
                    setRefetchData(true)
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')

                    const DATE2 = transactionDateDate(respuestaJSON?.TXN_DATE)
                    const TIME = transactionDateTime(respuestaJSON?.TXN_TIME)
                    const ID = respuestaJSON?.TXN_UNIQUE_REF
                    const CARD = `**** ${respuestaJSON?.ACCOUNT_NUMBER?.slice(-4)}`
                    const CARD_BRAND = respuestaJSON?.TAG_50
                    const CARD_TYPE = respuestaJSON?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'
                    const AUTH_TYPE = respuestaJSON?.ENTRY_MODE == '07' ? 'Contactless' : 'Chip'
                    const IMPRESSION_TYPE = 'Reimpresión'
                    const AMOUNT2 = parseFloat(formatPriceFromDigits(respuestaJSON?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    const EXTRA2 = parseFloat(formatPriceFromDigits(respuestaJSON?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    const TOTAL2 = respuestaJSON?.TIP ? sumarMontosExactos(parseFloat(formatPriceFromDigits(respuestaJSON?.AMOUNT)), parseFloat(formatPriceFromDigits(respuestaJSON?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : AMOUNT2
                    const BANK = respuestaJSON?.CARD_NAME
                    const AFILIATION_NUMBER = respuestaJSON?.MERCHANT_ID
                    const REFERENCE = respuestaJSON?.SG_REFERENCE
                    const AUT = respuestaJSON?.TXN_APPROVAL_CODE
                    const AID = respuestaJSON?.AID
                    const ARQC = respuestaJSON?.ARQC
                    const CVM = respuestaJSON?.TAG_9F34
                    const TVR = respuestaJSON?.TAG_95
                    const TSI = respuestaJSON?.TAG_9B
                    const TXN_TYPE = respuestaJSON?.TXN_NAME === 'VENTA EN LINEA' ? 'abrobada' : 'cancelada'

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
                } else {
                    /* console.log("La transacción pendiente fue rechazada por el banco."); */
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')
                }
            } catch (error: any) {
                const ERR = JSON.parse(error?.message)
                console.error('ERR verify')
                console.error(ERR)
                throw new Error(ERR.response_code)
            }
        }
    }

    async function handlePayAmount({ price, selectedExtra }: any) {
        try {
            const AMOUNT_TO_PAY = formatPriceFromDigits(price);
            const EXTRA = calculateExtraAmount(formatPriceFromDigits(price), selectedExtra);
            const DATE = getCurrentDateDDMMAAAA();
            const UNIQUE_REFERENCE = `frq${uuid.v4().replaceAll('-', '').slice(-16)}`;
            mmkvStorage.set('PENDING_TX_UNIQUE_REFERENCE', UNIQUE_REFERENCE);
            mmkvStorage.set('PENDING_TX_DATE', DATE);

            const respuestaSale = await SmartWrapperModule.sale(AMOUNT_TO_PAY.replaceAll(',', ''), EXTRA.replaceAll(',', ''), DATE, UNIQUE_REFERENCE, SPIdCemmerce);

            const respuestaJSON = JSON.parse(respuestaSale);
            if (respuestaJSON.RESPONSE_CODE === '00') {
                await transactionRegisterMutator.mutateAsync({ ...respuestaJSON, device_id: deviceId })
                setTransactionSelected({ event_name: 'transaction', data_raw: respuestaJSON })
                mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                mmkvStorage.remove('PENDING_TX_DATE')
                setRefetchData(true)

                const DATE2 = transactionDateDate(respuestaJSON?.TXN_DATE)
                const TIME = transactionDateTime(respuestaJSON?.TXN_TIME)
                const ID = respuestaJSON?.TXN_UNIQUE_REF
                const CARD = `**** ${respuestaJSON?.ACCOUNT_NUMBER?.slice(-4)}`
                const CARD_BRAND = respuestaJSON?.TAG_50
                const CARD_TYPE = respuestaJSON?.CARD_TYPE == '0' ? 'Débito' : 'Crédito'
                const AUTH_TYPE = respuestaJSON?.ENTRY_MODE == '07' ? 'Contactless' : 'Chip'
                const IMPRESSION_TYPE = 'Reimpresión'
                const AMOUNT2 = parseFloat(formatPriceFromDigits(respuestaJSON?.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                const EXTRA2 = parseFloat(formatPriceFromDigits(respuestaJSON?.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                const TOTAL2 = respuestaJSON?.TIP ? sumarMontosExactos(parseFloat(formatPriceFromDigits(respuestaJSON?.AMOUNT)), parseFloat(formatPriceFromDigits(respuestaJSON?.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : AMOUNT2
                const BANK = respuestaJSON?.CARD_NAME
                const AFILIATION_NUMBER = respuestaJSON?.MERCHANT_ID
                const REFERENCE = respuestaJSON?.SG_REFERENCE
                const AUT = respuestaJSON?.TXN_APPROVAL_CODE
                const AID = respuestaJSON?.AID
                const ARQC = respuestaJSON?.ARQC
                const CVM = respuestaJSON?.TAG_9F34
                const TVR = respuestaJSON?.TAG_95
                const TSI = respuestaJSON?.TAG_9B
                const TXN_TYPE = respuestaJSON?.TXN_NAME === 'VENTA EN LINEA' ? 'abrobada' : 'cancelada'

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
            }
        } catch (error: any) {
            const ERR = JSON.parse(error.message)
            console.error('ERR')
            console.error(ERR)
            throw new Error(error.message)
        }
    };

    return (
        <InsertAmountContext.Provider value={{
            verifyPendingTransaction,
            handlePayAmount,
        }} >
            {children}
        </InsertAmountContext.Provider>
    )
}

export { InsertAmountContext };

