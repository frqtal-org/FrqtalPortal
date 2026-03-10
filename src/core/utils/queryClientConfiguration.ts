import { focusManager, keepPreviousData, onlineManager, QueryClient } from "@tanstack/react-query";
import { NativeEventEmitter, NativeModules } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const { ScreenStateModule } = NativeModules;
const screenStateEmitter = new NativeEventEmitter(ScreenStateModule);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 10,
      staleTime: 1000 * 60 * 5,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      /* refetchInterval: false, */
      networkMode: 'offlineFirst',
      retryOnMount: false,
      placeholderData: keepPreviousData,
      structuralSharing: true,
      throwOnError: false,
    },
    mutations: {
      retry: 0, // ⚠️ CRÍTICO: Nunca reintentar mutaciones automáticamente en un POS (evita pagos dobles)
      networkMode: 'offlineFirst',
    },
  },
})

export const configurarSensoresKiosco = () => {
  onlineManager.setEventListener((setOnline) => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected);
    });

    return unsubscribeNetInfo; 
  });


  focusManager.setEventListener((handleFocus) => {
    
    ScreenStateModule.startListening();

    const subscription = screenStateEmitter.addListener(
      'ScreenStateEvent',
      (event) => {
        if (event === 'ScreenOn') {
          console.log("React Query: Pantalla encendida. Refrescando...");
          handleFocus(true); 
        } else if (event === 'ScreenOff') {
          console.log("React Query: Pantalla apagada. Pausando...");
          handleFocus(false);
        }
      }
    );

    return () => {
      subscription.remove();
      ScreenStateModule.stopListening();
    };
  });
};