import React, { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, NativeModules, Pressable, StyleSheet, View } from 'react-native';
import FastImage from "react-native-fast-image";
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
import { useAnimatedStyle } from 'react-native-reanimated';
import { useNetInfo } from '@react-native-community/netinfo';
import { BottomSheetsContext } from '../../../core/components/bottomSheets/context.tsx';
import { mmkvStorage } from '../../../core/store/principalStore.ts';
import { InsertAmountContext } from '../insertAmount/context.tsx';
import { AppNavigationContext } from '../appNavigation/context.tsx';

const { SmartWrapperModule } = NativeModules;

let filterTO: number;

const TransactionsHistory = () => {
  const { setRefetchData, refetchData, handleGetHistorial } = useContext(TransactionsHistoryContext)
  const { transactionBottomSheetRef } = useContext(BottomSheetsContext)
  const { verifyPendingTransaction } = useContext(InsertAmountContext)
  const { isLoadingSV, setLoadingText } = useContext(AppNavigationContext)
  /*  */
  const listRef = useRef<FlatList<any>>(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [TXNs, setTXNs] = useState<any>([])
  const [totalAmounts, setTotalAmounts] = useState({ totalExtraToday: null, totalToday: null, totalPages: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingTxns, setIsLoadingTxns] = useState(false)
  const { isConnected } = useNetInfo();

  /* ------- Functions ------- */
  async function goToReports() {
    if (isConnected) {
      const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
      const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');

      if (pendingRef && pendingDate) {
        setLoadingText('Verificando transacción inconclusa')
        isLoadingSV.set(true)
        setTimeout(async () => {
          await verifyPendigTxns();
        }, 3000)
      } else {
        await SmartWrapperModule.getBalance();
      }
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
    handleGetHistorial(props).then((resp: any) => {
      setTotalAmounts({ totalExtraToday: resp.extraToday, totalToday: resp.totalToday, totalPages: resp.totalPages })
      setTXNs((prev: any) => [...prev, ...resp.data])
    }).finally(() => {
      setRefetchData(false)
      setIsLoadingTxns(false)
    })
  }

  function handleNextPage() {
    if (currentPage === totalAmounts.totalPages || totalAmounts.totalPages === 0 || isLoadingTxns) return
    setIsLoadingTxns(true)
    handleGetData({ status: selectedFilter, page: currentPage + 1 })
    setCurrentPage(currentPage + 1)
  }

  async function verifyPendigTxns() {
    try {
      await verifyPendingTransaction();
      isLoadingSV.set(false)
      setLoadingText('')
    } catch (error: any) {
      if (error?.message == '99') {
        setLoadingText('Porfavor espere un momento')
        isLoadingSV.set(true)
        setTimeout(() => {
          isLoadingSV.set(false)
          setLoadingText('')
        }, 3000)
      }
      if (error?.message == '97') {
        isLoadingSV.set(false)
        setLoadingText('')
      }

      throw new Error(error?.message)
    }
  }
  /* ------- END Functions ------- */


  const isLoadingStyle = useAnimatedStyle(() => ({
    opacity: isLoadingSV.get() ? 1 : 0,
    pointerEvents: isLoadingSV.get() ? 'auto' : 'none',
  }))

  /* ------- Effects ------- */
  useEffect(() => {
    setIsLoadingTxns(true)
    setTXNs([])
    setTotalAmounts((prev: any) => { return { ...prev, totalPages: 0 } })
    filterTO && clearTimeout(filterTO)
    filterTO = setTimeout(() => {
      handleGetData({ status: selectedFilter, page: currentPage })
    }, 700)
  }, [selectedFilter])

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
              <Pressable onPress={goToReports} style={[{ marginLeft: 'auto', flexDirection: 'row', columnGap: sizeToDp(APP_PADDING * 0.3), paddingBottom: sizeToDp(APP_PADDING * 0.2), right: sizeToDp(APP_PADDING * 0.2), paddingTop: sizeToDp(APP_PADDING) }]} >
                <Typography variant="text01Medium" color="brand200" >Reportes</Typography>
                <FastImage
                  source={require('../../../core/assets/images/report200.png')}
                  style={[{ width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]}
                  resizeMode='contain'
                />
              </Pressable>
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
            onVerify={(onAction: () => void) => {
              if (isConnected) {
                const pendingRef = mmkvStorage.getString('PENDING_TX_UNIQUE_REFERENCE');
                const pendingDate = mmkvStorage.getString('PENDING_TX_DATE');

                if (pendingRef && pendingDate) {
                  setLoadingText('Verificando transacción inconclusa')
                  isLoadingSV.set(true)
                  setTimeout(async () => {
                    await verifyPendigTxns();
                  }, 3000)
                } else {
                  onAction()
                }
              } else {
                setLoadingText('Sin conexión')
                isLoadingSV.set(true)
                setTimeout(() => {
                  isLoadingSV.set(false)
                  setLoadingText('')
                }, 3000)
              }
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
