import React from 'react';
import { Dimensions, StatusBar } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query'
import { NavigationContainer } from '@react-navigation/native';
import GlobalNavigation from './src/features/GlobalNavigation';
import { TerminalDeviceContextProvider } from './src/features/context';
import InsetsProvider from './src/core/utils/styles/insets';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BootSplash from "react-native-bootsplash";
import { BottomSheetsProvider } from './src/core/components/bottomSheets/context';
import { LoginProvider } from './src/features/accessManagement/Login/context';
import { TransactionsHistoryContextProvider } from './src/features/app/transactionsHistory/context';
import { queryClient } from './src/core/utils/queryClientConfiguration';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient} >
      <NavigationContainer onReady={async () => await BootSplash.hide({ fade: true })} >
        <TerminalDeviceContextProvider>
          <SafeAreaProvider>
            <InsetsProvider>
              <GestureHandlerRootView style={[{ height: Dimensions.get('window').height }]} >
                <BottomSheetsProvider>
                  <LoginProvider>
                    <TransactionsHistoryContextProvider>
                      {children}
                    </TransactionsHistoryContextProvider>
                  </LoginProvider>
                </BottomSheetsProvider>
              </GestureHandlerRootView>
            </InsetsProvider>
          </SafeAreaProvider>
        </TerminalDeviceContextProvider>
      </NavigationContainer>
    </QueryClientProvider>
  );
};

const App = () => {
  return <>
    <StatusBar
      barStyle={'dark-content'}
      backgroundColor="transparent"
      translucent
    />
    <Providers>
      <GlobalNavigation />
    </Providers>
  </>
};

export default App;