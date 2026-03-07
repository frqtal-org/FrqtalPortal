import React, { createContext, useState } from "react";

const TransactionsHistoryContext = createContext<any>({});

export function TransactionsHistoryContextProvider({ children }: { children: React.ReactNode }) {
    const [refetchData, setRefetchData] = useState(false);

    return (
        <TransactionsHistoryContext.Provider value={{ refetchData, setRefetchData }} >
            {children}
        </TransactionsHistoryContext.Provider>
    )
}

export { TransactionsHistoryContext }
