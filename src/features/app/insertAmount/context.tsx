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

                mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                mmkvStorage.remove('PENDING_TX_DATE')

                if (respuestaJSON.RESPONSE_CODE === '00') {
                    try {
                        await transactionRegisterMutator.mutateAsync({ ...respuestaJSON, device_id: deviceId })
                        setTransactionSelected({ event_name: 'transaction', data_raw: respuestaJSON })
                        setRefetchData(true)
                        return respuestaJSON
                    } catch (err: any) {
                        console.error('ERR-222-')
                        console.error(err)
                        throw new Error(err)
                    }
                }
            } catch (error: any) {
                const ERR = JSON.parse(error?.message)
                console.error('ERR verify')
                console.error(ERR)

                if (ERR?.response_code == '97') {
                    /* Txn no registrada */
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')
                    /* TODO: PRINT NO EXISTE REGISTRO */
                }
                if (ERR?.response_code == '01') {
                    /* REVERSADA */
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')
                    /* TODO: PRINT REVERSADA */
                }
                throw new Error(ERR?.response_code)
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
                try {
                    await transactionRegisterMutator.mutateAsync({ ...respuestaJSON, device_id: deviceId })
                    mmkvStorage.remove('PENDING_TX_UNIQUE_REFERENCE');
                    mmkvStorage.remove('PENDING_TX_DATE')
                    setRefetchData(true)
                    setTransactionSelected({ event_name: 'transaction', data_raw: respuestaJSON })
                    return respuestaJSON
                } catch (err: any) {
                    console.error('ERR-222')
                    console.error(err)
                    throw new Error(err)
                }
            }
        } catch (error: any) {
            const ERR = JSON.parse(error?.message)
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

