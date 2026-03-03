import BottomSheet from "@gorhom/bottom-sheet";
import React, { createContext, useRef } from "react";

const BottomSheetsContext = createContext<any>({});

export function BottomSheetsProvider({ children }: { children: React.ReactNode }) {
    const transactionBottomSheetRef = useRef<BottomSheet>(null);

    return (
        <BottomSheetsContext.Provider value={{
            transactionBottomSheetRef
        }} >
            {children}
        </BottomSheetsContext.Provider>
    )
}

export { BottomSheetsContext }
