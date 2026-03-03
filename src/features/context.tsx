import React, { createContext, useEffect } from "react";
import { getUniqueIdSync, getVersion } from 'react-native-device-info';
import { mmkvStorage } from "../core/store/principalStore";
import StorageKey from "../core/utils/store/keysStore";

const TerminalDeviceContext = createContext<any>({});

export function TerminalDeviceContextProvider({ children }: { children: React.ReactNode }) {

    useEffect(() => {
        (async () => {
            mmkvStorage.set(StorageKey.DEVICE_SERIAL_NUMBER, getUniqueIdSync())
            mmkvStorage.set(StorageKey.APP_VERSION_NAME, getVersion())
            mmkvStorage.set(StorageKey.SP_API_KEY, "6fac5de4-4c4c-43ae-a475-baf32459509d")
            mmkvStorage.set(StorageKey.SP_ID_COMMECRE, "FRQTAL")
            mmkvStorage.set(StorageKey.SP_ID_INTEGRATOR, "cd72212a339392abf3ec8b0eca7ae6d5d4b3fdc7")
        })()
    } , [])

    return (
        <TerminalDeviceContext.Provider value={{
            /* deviceSerialNumberSV */
        }} >
            {children}
        </TerminalDeviceContext.Provider>
    )
}

export { TerminalDeviceContext }
