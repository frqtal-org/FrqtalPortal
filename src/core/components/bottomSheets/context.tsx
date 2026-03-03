import BottomSheet from "@gorhom/bottom-sheet";
import React, { createContext, useRef, useState } from "react";

const BottomSheetsContext = createContext<any>({});

export function BottomSheetsProvider({ children }: { children: React.ReactNode }) {
    const transactionBottomSheetRef = useRef<BottomSheet>(null);
    const [transactionSelected, setTransactionSelected] = useState({});

    return (
        <BottomSheetsContext.Provider value={{
            transactionBottomSheetRef,
            setTransactionSelected,
            transactionSelected
        }} >
            {children}
        </BottomSheetsContext.Provider>
    )
}

export { BottomSheetsContext }
