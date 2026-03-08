import React, { createContext, useContext } from "react";
import { mmkvStorage } from "../../../core/store/principalStore";
import { NativeModules } from "react-native";
import { TransactionsHistoryContext } from "../transactionsHistory/context";
import { BottomSheetsContext } from "../../../core/components/bottomSheets/context";
import StorageKey from "../../../core/utils/store/keysStore";
import { useMMKVString } from "react-native-mmkv";
import { useTransactionRegister } from "../../../core/api/transactionRegister";
import { calculateExtraAmount, formatPriceFromDigits } from "../../../core/utils/priceFormater";
import { getCurrentDateDDMMAAAA } from "../../../core/utils/getDateDDMMAAAA";
import uuid from 'react-native-uuid';

const InsertAmountContext = createContext<any>({});

const { SmartWrapperModule } = NativeModules;

export function InsertAmountContextProvider({ children }: { children: React.ReactNode }) {
    const { setRefetchData } = useContext(TransactionsHistoryContext)
    const { setTransactionSelected } = useContext(BottomSheetsContext)

    const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)
    const [SPIdCemmerce, setSPIdCemmerce] = useMMKVString(StorageKey.SP_ID_COMMECRE, mmkvStorage)

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
                } else {
                    /* console.log("La transacción pendiente fue rechazada por el banco."); */
                }
            } catch (error: any) {
                const ERR = JSON.parse(error.message)
                console.error(error);
                if (ERR.response_code == '97') {
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')
                }
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
            }
        } catch (error) {
            console.error(error)
            mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
            mmkvStorage.remove('PENDING_TX_DATE')
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

export { InsertAmountContext }
