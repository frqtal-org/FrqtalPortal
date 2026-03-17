import React, { createContext, useState } from "react";
import StorageKey from "../../../core/utils/store/keysStore";
import { mmkvStorage } from "../../../core/store/principalStore";
import { useMMKVString } from "react-native-mmkv";
import { useGetAllTransactions } from "../../../core/api/getAllTransactions";

const TransactionsHistoryContext = createContext<any>({});

export function TransactionsHistoryContextProvider({ children }: { children: React.ReactNode }) {
    const [refetchData, setRefetchData] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)
    const getAllTransactionsMutator = useGetAllTransactions()

    async function handleGetHistorial({ status = 'all', page = 1 }: any) {
        try {
            const { data } = await getAllTransactionsMutator.mutateAsync({ data: { status, page }, serialNumber: deviceId });
            return data
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <TransactionsHistoryContext.Provider value={{ refetchData, setRefetchData, handleGetHistorial, isScreenFocused, setIsScreenFocused }} >
            {children}
        </TransactionsHistoryContext.Provider>
    )
}

export { TransactionsHistoryContext }
