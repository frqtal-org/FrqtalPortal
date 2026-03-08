import React, { createContext } from "react";

const AppNavigationContext = createContext<any>({});

export function AppNavigationContextProvider({ children }: { children: React.ReactNode }) {
    return (
        <AppNavigationContext.Provider value={{
        }} >
            {children}
        </AppNavigationContext.Provider>
    )
}

export { AppNavigationContext }
