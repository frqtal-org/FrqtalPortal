import React from 'react';
import { StatusBar } from 'react-native';
import { keepPreviousData, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NavigationContainer } from '@react-navigation/native';
import GlobalNavigation from './src/features/GlobalNavigation';
import { TerminalDeviceContextProvider } from './src/features/context';
import InsetsProvider from './src/core/utils/styles/insets';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 30,
      staleTime: 1000 * 60 * 10,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
      networkMode: 'always',
      retryOnMount: false,
      placeholderData: keepPreviousData,
      structuralSharing: true,
      throwOnError: false,
    },
    mutations: {
      retry: 1,
      networkMode: 'always',
    },
  },
})

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient} >
      <NavigationContainer>
        <TerminalDeviceContextProvider>
          <SafeAreaProvider>
            <InsetsProvider>
              <GestureHandlerRootView>
                {children}
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