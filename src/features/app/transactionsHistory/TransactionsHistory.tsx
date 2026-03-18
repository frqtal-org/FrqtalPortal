import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FlatList, NativeModules, Pressable, StyleSheet, View } from 'react-native';
import BalanceHeaderInfo from "../../../core/components/headers/BalanceHeaderInfo.tsx";
import LoadingListLoader from "../../../core/components/LoadingListLoader.tsx";
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper.tsx';
import { Typography } from '../../../core/components/Typography.tsx';
import { APP_PADDING } from "../../../core/utils/constants.ts";
import { sizeToDp } from '../../../core/utils/sizeToDP.tsx';
import theme from "../../../core/utils/styles/styles.ts";
import { Filters } from "./components/Filters.tsx";
import TransactionListItem from "./components/TransactionListItem.tsx";
import { TransactionsHistoryContext } from './context.tsx';
import { useNetInfo } from '@react-native-community/netinfo';
import { BottomSheetsContext } from '../../../core/components/bottomSheets/context.tsx';
import { mmkvStorage } from '../../../core/store/principalStore.ts';
import { InsertAmountContext } from '../insertAmount/context.tsx';
import { AppNavigationContext } from '../appNavigation/context.tsx';
import StorageKey from '../../../core/utils/store/keysStore.ts';
import { useFocusEffect } from '@react-navigation/native';

const { SmartWrapperModule } = NativeModules;

let filterTO: number;

const TransactionsHistory = () => {
  const { setRefetchData, refetchData, handleGetHistorial, isScreenFocused, setIsFirstScreenRendered } = useContext(TransactionsHistoryContext)
  const { transactionBottomSheetRef } = useContext(BottomSheetsContext)
  const { verifyPendingTransaction } = useContext(InsertAmountContext)
  const { isLoadingSV, setLoadingText } = useContext(AppNavigationContext)
  /*  */
  const listRef = useRef<FlatList<any>>(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [TXNs, setTXNs] = useState<any>([])
  const [totalAmounts, setTotalAmounts] = useState(mmkvStorage.getString(StorageKey.TOTAL_AMOUNTS) ? JSON.parse(mmkvStorage.getString(StorageKey.TOTAL_AMOUNTS)!) : { totalExtraToday: null, totalToday: null, totalPages: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingTxns, setIsLoadingTxns] = useState(false)
  const { isConnected } = useNetInfo();
  const abortControllerRef = useRef<AbortController>(null);

  /* ------- Functions ------- */
  async function goToReports() {
    if (isConnected) {
      const pendingRef = mmkvStorage.getString(StorageKey.PENDING_TX_UNIQUE_REFERENCE);
      const pendingDate = mmkvStorage.getString(StorageKey.PENDING_TX_DATE);

      setLoadingText('Verificando transacción inconclusa')
      isLoadingSV.set(true)
      setTimeout(async () => {
        await verifyPendingTransaction().then(async () => {
          await SmartWrapperModule.getBalance();
        });
      }, (pendingRef && pendingDate) ? 3000 : 0)

    } else {
      setLoadingText('Sin conexión')
      isLoadingSV.set(true)
      setTimeout(() => {
        isLoadingSV.set(false)
        setLoadingText('')
      }, 3000)
    }
  }

  function handleGetData(props: any) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const currentSignal = abortControllerRef.current.signal;

    handleGetHistorial({ ...props, signal: currentSignal }).then((resp: any) => {
      if (currentSignal.aborted) {
        console.log("Ignorando respuesta de petición abortada.");
        return;
      }

      const TOTAL_AMOUNTS = { totalExtraToday: resp.extraToday, totalToday: resp.totalToday, totalPages: resp.totalPages };
      mmkvStorage.set(StorageKey.TOTAL_AMOUNTS, JSON.stringify(TOTAL_AMOUNTS))
      setTotalAmounts(TOTAL_AMOUNTS)
      setTXNs((prev: any) => {
        if (props.page === 1) {
          return resp.data;
        }
        return [...prev, ...resp.data];
      });

      setRefetchData(false)
      setIsLoadingTxns(false)

    }).catch((error: any) => {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || currentSignal.aborted) {
        console.log("Petición anterior abortada por cambio de filtro.");
        return;
      }
      console.error("Error real en la petición:", error);
      setRefetchData(false)
      setIsLoadingTxns(false)
    });
  }

  function handleNextPage() {
    if (currentPage === totalAmounts.totalPages || totalAmounts.totalPages === 0 || isLoadingTxns) return
    setIsLoadingTxns(true)
    handleGetData({ status: selectedFilter, page: currentPage + 1 })
    setCurrentPage(currentPage + 1)
  }
  /* ------- END Functions ------- */

  /* ------- Effects ------- */
  useEffect(() => {
    if (isScreenFocused) {
      setIsLoadingTxns(true)
      setTXNs([])
      setTotalAmounts((prev: any) => { return { ...prev, totalPages: 0 } })
      filterTO && clearTimeout(filterTO)
      filterTO = setTimeout(() => {
        handleGetData({ status: selectedFilter, page: 1 })
      })
    }
  }, [selectedFilter])

  useEffect(() => {
    if (isScreenFocused) {
      setIsFirstScreenRendered(isScreenFocused)
    }
  }, [isScreenFocused])

  useEffect(() => {
    if (refetchData) {
      setIsLoadingTxns(true)
      setTXNs([])
      setTotalAmounts((prev: any) => { return { ...prev, totalPages: 0 } })
      setCurrentPage(1)
      handleGetData({ status: selectedFilter, page: 1 })
    }
  }, [refetchData])

  useEffect(() => {
    if (isConnected) handleNextPage()
    else transactionBottomSheetRef.current.close()
  }, [isConnected])

  useFocusEffect(useCallback(() => {
    return () => {
      setIsFirstScreenRendered(false)
      const TOTAL_AMOUNTS = { ...totalAmounts, totalPages: 0 };
      mmkvStorage.set(StorageKey.TOTAL_AMOUNTS, JSON.stringify(TOTAL_AMOUNTS))
    }
  }, []))
  /* ------- END Effects ------- */

  return (
    <>
      <BasicScreenWrapper noHeader noPaddingBottom >
        <View style={[STYLES.listHeaderStyle]}>
          <View >
            <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING), paddingTop: sizeToDp(APP_PADDING * 1), flexDirection: 'row', alignItems: 'flex-end', width: '100%' }]} >
              <BalanceHeaderInfo
                balanceTitle={'Ganancias totales:'}
                filterTitleText={'Hoy'}
                onPressFilterTitle={() => { }}
                balance={totalAmounts.totalToday || '0.00'}
                currency={'MXN'}
                equivalentCurrency={'MXN'}
                equivalentBalance={totalAmounts.totalExtraToday || '0.00'}
                equivalentBalanceColor={'notificationGreen'}
                equivalentMiniText='Extra:'
              />
              {/* <Pressable onPress={goToReports} style={[{ marginLeft: 'auto', flexDirection: 'row', columnGap: sizeToDp(APP_PADDING * 0.3), paddingBottom: sizeToDp(APP_PADDING * 0.2), right: sizeToDp(APP_PADDING * 0.2), paddingTop: sizeToDp(APP_PADDING) }]} >
                <Typography variant="text01Medium" color="brand200" >Reportes</Typography>
                <FastImage
                  source={require('../../../core/assets/images/report200.png')}
                  style={[{ width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]}
                  resizeMode='contain'
                />
              </Pressable> */}
            </View>

            <Filters
              onVerify={(onAction: () => void) => {
                if (isConnected) {
                  onAction()
                } else {
                  setLoadingText('Sin conexión')
                  isLoadingSV.set(true)
                  setTimeout(() => {
                    isLoadingSV.set(false)
                    setLoadingText('')
                  }, 3000)
                }
              }}
              onPress={(filter: any) => {
                abortControllerRef.current?.abort()
                setCurrentPage(1)
                setSelectedFilter(filter)
              }} style={{ paddingTop: sizeToDp(APP_PADDING * 0.7), paddingBottom: sizeToDp(APP_PADDING * 0.8) }} />
          </View>
        </View>
        <FlatList
          ref={listRef}
          keyExtractor={(item: any, index: number) => `all-transactions-list-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[(TXNs.length === 0 && !isLoadingTxns) && { flex: 1 }]}
          ListEmptyComponent={!isLoadingTxns ? <View style={[STYLES.emptyListContainer, { height: '100%', paddingBottom: sizeToDp(APP_PADDING * 0.8) }]} ><Typography style={[{ textAlign: 'center' }]} variant='subtitle02Regular' color='textSecondary' >Sin transacciones</Typography></View> : <></>}
          data={TXNs}
          onEndReachedThreshold={2}
          renderItem={({ item }) => <TransactionListItem
            onVerify={async (onAction: () => void) => {
              await verifyPendingTransaction().then(() => {
                onAction()
              });
            }}
            {...item}
          />}
          ListFooterComponent={(TXNs.length > 0 || isLoadingTxns) ? (<View style={[(isLoadingTxns && TXNs.length === 0) && { marginTop: sizeToDp(APP_PADDING) }]} ><LoadingListLoader showLoader={!isConnected ? false : (!(totalAmounts.totalPages === currentPage && !isLoadingTxns))} title={!isConnected ? 'Sin conexión' : (!(totalAmounts.totalPages === currentPage && !isLoadingTxns) ? (currentPage === 1 ? `Cargando transacciones` : `Cargando página ${currentPage}/${totalAmounts.totalPages}`) : `Fin de la lista`)} subtitle={!isConnected ? 'Reintenta de nuevo más tarde' : (!(totalAmounts.totalPages === currentPage && !isLoadingTxns) ? `Por favor espera...` : `No hay más transacciones`)} /></View>) : <></>}
          ListFooterComponentStyle={[(TXNs.length === 0) ? { marginBottom: sizeToDp(APP_PADDING * 0.2) } : { marginTop: sizeToDp(APP_PADDING * 0.2), marginBottom: sizeToDp(APP_PADDING * 0.8) }]}
          style={[STYLES.listStyle]}
          onEndReached={(totalAmounts.totalPages <= 1 || isLoadingTxns) ? () => { } : (isConnected ? handleNextPage : () => { })}
        />
      </BasicScreenWrapper>
    </>
  );
};

export default TransactionsHistory;

const STYLES = StyleSheet.create({
  listStyle: {
    flex: 1,
  },
  listHeaderStyle: {
    borderBottomWidth: sizeToDp(1),
    borderBottomColor: theme.colors.glassPrimary,
    marginBottom: -sizeToDp(1),
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sizeToDp(APP_PADDING * 4),
  },
  loadingScreenWrapper: {
    position: 'absolute',
    flex: 1,
    top: 0,
    left: 0,
    zIndex: 9999,
    width: '100%',
    height: '100%',
  },
});
