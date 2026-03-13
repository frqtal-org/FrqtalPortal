import React, { createContext, useState } from "react";
import { useSharedValue } from "react-native-reanimated";

const AppNavigationContext = createContext<any>({});

export function AppNavigationContextProvider({ children }: { children: React.ReactNode }) {
    const isLoadingSV = useSharedValue<boolean>(false)
    const [loadingText, setLoadingText] = useState('');

    return (
        <AppNavigationContext.Provider value={{
            isLoadingSV,
            setLoadingText,
            loadingText
        }} >
            {children}
        </AppNavigationContext.Provider>
    )
}

export { AppNavigationContext }
