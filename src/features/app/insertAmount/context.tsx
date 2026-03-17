import React, { createContext, useContext } from "react";
import { NativeModules } from "react-native";
import { useMMKVString } from "react-native-mmkv";
import uuid from 'react-native-uuid';
import { useTransactionRegister } from "../../../core/api/transactionRegister";
import { BottomSheetsContext } from "../../../core/components/bottomSheets/context";
import { mmkvStorage, mmkvStorageTemporal } from "../../../core/store/principalStore";
import { getCurrentDateDDMMAAAA } from "../../../core/utils/getDateDDMMAAAA";
import { calculateExtraAmount, formatPriceFromDigits } from "../../../core/utils/priceFormater";
import StorageKey, { TemporalStorageKey } from "../../../core/utils/store/keysStore";
import { TransactionsHistoryContext } from "../transactionsHistory/context";
import { AppNavigationContext } from "../appNavigation/context";
import { printErrorTicketAUX, printTicketAUX } from "../../../core/utils/printTicket";
import { fetch } from "@react-native-community/netinfo";

const InsertAmountContext = createContext<any>({});

const { SmartWrapperModule } = NativeModules;

export function InsertAmountContextProvider({ children }: { children: React.ReactNode }) {
    const { setRefetchData } = useContext(TransactionsHistoryContext)
    const { setTransactionSelected } = useContext(BottomSheetsContext)
    const { isLoadingSV, setLoadingText } = useContext(AppNavigationContext)

    const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)
    const [SPIdCemmerce, setSPIdCemmerce] = useMMKVString(StorageKey.SP_ID_COMMECRE, mmkvStorage)

    const transactionRegisterMutator = useTransactionRegister()

    async function handlePrintTicket(ticketData: any) {
        isLoadingSV.set(true)
        setLoadingText('Imprimiendo ticket')

        await printTicketAUX(ticketData)
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

    async function handlePrintErrorTicket(text: any) {
        isLoadingSV.set(true)
        setLoadingText('Imprimiendo ticket')

        await printErrorTicketAUX(text)
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

    async function verifyPendingTransaction() {
        const pendingRef = mmkvStorageTemporal.getString(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE);
        const pendingDate = mmkvStorageTemporal.getString(TemporalStorageKey.PENDING_TX_DATE);

        if (pendingRef && pendingDate) {
            try {
                setLoadingText('Verificando transacción inconclusa')
                isLoadingSV.set(true)

                const respuestaString = await SmartWrapperModule.queryUniqueTransaction(pendingRef, pendingDate);
                const respuestaJSON = JSON.parse(respuestaString);

                if (respuestaJSON.RESPONSE_CODE === '00') {
                    try {
                        await transactionRegisterMutator.mutateAsync({ ...respuestaJSON, device_id: deviceId }).then(async () => {
                            mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE);
                            mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_DATE)
                            await handlePrintTicket(respuestaJSON)
                        }).finally(() => {
                            setTransactionSelected({ event_name: 'transaction', data_raw: respuestaJSON })
                            setRefetchData(true)
                        })
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

                if (ERR?.response_code == '99') {
                    setLoadingText('Porfavor espere un momento')
                    isLoadingSV.set(true)
                    setTimeout(() => {
                        isLoadingSV.set(false)
                        setLoadingText('')
                    }, 3000)
                }
                if (ERR?.response_code == '97') {
                    /* Txn no registrada */
                    mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE);
                    mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_DATE)
                    await handlePrintErrorTicket('Transacción no existe en plataforma')
                }
                if (ERR?.response_code == '01') {
                    /* REVERSADA */
                    mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE);
                    mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_DATE)
                    await handlePrintErrorTicket('Reversada')
                }
                if (ERR?.response_code == '') {
                    /* Timeout */
                    mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE);
                    mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_DATE)
                    await handlePrintErrorTicket('Tiempo de espera agotado')
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

            mmkvStorageTemporal.set(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE, UNIQUE_REFERENCE);
            mmkvStorageTemporal.set(TemporalStorageKey.PENDING_TX_DATE, DATE);

            const respuestaSale = await SmartWrapperModule.sale(AMOUNT_TO_PAY.replaceAll(',', ''), EXTRA.replaceAll(',', ''), DATE, UNIQUE_REFERENCE, SPIdCemmerce);

            const respuestaJSON = JSON.parse(respuestaSale);
            if (respuestaJSON.RESPONSE_CODE === '00') {
                try {
                    await transactionRegisterMutator.mutateAsync({ ...respuestaJSON, device_id: deviceId }).then(async () => {
                        mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE);
                        mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_DATE)
                        await handlePrintTicket(respuestaJSON)
                    }).finally(() => {
                        setRefetchData(true)
                        setTransactionSelected({ event_name: 'transaction', data_raw: respuestaJSON })
                    })
                    return respuestaJSON
                } catch (err: any) {
                    console.error('ERR-222')
                    console.error(err)
                    throw new Error(err)
                }
            }
        } catch (error: any) {
            try {
                const ERR = JSON.parse(error?.message)
                console.error('ERR')
                console.error(ERR)

                fetch().then(async state => {
                    if (!state.isConnected) {
                        isLoadingSV.set(false)
                        setLoadingText('')
                        if (ERR?.response_code) {
                            await handlePrintErrorTicket(ERR?.error_message)
                        }
                        return null
                    }

                    if (ERR.suggest_query === 'true') {
                        setLoadingText('Validando información');
                        isLoadingSV.set(true)
                        setTimeout(async () => {
                            await verifyPendingTransaction()
                        }, 3000)
                    } else if (ERR?.response_code) {
                        /* Txn no registrada, retirada por el user, cancelada por el user, Imposible conectarse al servidor */
                        mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_UNIQUE_REFERENCE);
                        mmkvStorageTemporal.remove(TemporalStorageKey.PENDING_TX_DATE)
                        isLoadingSV.set(false)
                        setLoadingText('')
                        await handlePrintErrorTicket(ERR?.error_message)
                    } else {
                        isLoadingSV.set(false)
                        setLoadingText('')
                    }
                });
            } catch (err: any) {
                console.log('ERR-222-3')
                console.log(err)
                console.log(err?.message)
                console.log('err')
                isLoadingSV.set(false)
                setLoadingText('')
            }

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

