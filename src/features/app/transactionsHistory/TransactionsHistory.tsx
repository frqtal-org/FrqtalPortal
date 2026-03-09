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

const { SmartWrapperModule } = NativeModules;

let filterTO: number;

const TransactionsHistory = () => {
  const { setRefetchData, refetchData, handleGetHistorial } = useContext(TransactionsHistoryContext)
  /*  */
  const listRef = useRef<FlatList<any>>(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [TXNs, setTXNs] = useState<any>([])
  const [totalAmounts, setTotalAmounts] = useState({ totalExtraToday: null, totalToday: null, totalPages: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  /* ------- Functions ------- */
  async function goToReports() {
    await SmartWrapperModule.getBalance();
  }

  function handleGetData(props: any) {
    handleGetHistorial(props).then((resp: any) => {
      setTotalAmounts({ totalExtraToday: resp.extraToday, totalToday: resp.totalToday, totalPages: resp.totalPages })
      setTXNs((prev: any) => [...prev, ...resp.data])
    }).finally(() => {
      setRefetchData(false)
      setIsLoading(false)
    })
  }

  function handleNextPage() {
    if (currentPage === totalAmounts.totalPages || totalAmounts.totalPages === 0 || isLoading) return
    setIsLoading(true)
    handleGetData({ status: selectedFilter, page: currentPage + 1 })
    setCurrentPage(currentPage + 1)
  }
  /* ------- END Functions ------- */


  /* ------- Effects ------- */
  useEffect(() => {
    setIsLoading(true)
    setTXNs([])
    filterTO && clearTimeout(filterTO)
    filterTO = setTimeout(() => {
      handleGetData({ status: selectedFilter, page: currentPage })
    }, 700)
  }, [selectedFilter])

  useEffect(() => {
    if (refetchData) {
      setIsLoading(true)
      setTXNs([])
      setCurrentPage(1)
      handleGetData({ status: selectedFilter, page: 1 })
    }
  }, [refetchData])
  /* ------- END Effects ------- */

  return (
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

          <Filters onPress={(filter: any) => {
            setCurrentPage(1)
            setSelectedFilter(filter)
          }} style={{ paddingTop: sizeToDp(APP_PADDING * 0.7), paddingBottom: sizeToDp(APP_PADDING * 0.8) }} />
        </View>
      </View>
      <FlatList
        ref={listRef}
        keyExtractor={(item: any, index: number) => `all-transactions-list-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[(TXNs.length === 0 && !isLoading) && { flex: 1 }]}
        ListEmptyComponent={!isLoading ? <View style={[STYLES.emptyListContainer, { height: '100%', paddingBottom: sizeToDp(APP_PADDING * 0.8) }]} ><Typography style={[{ textAlign: 'center' }]} variant='subtitle02Regular' color='textSecondary' >Sin transacciones</Typography></View> : <></>}
        data={TXNs}
        onEndReachedThreshold={2}
        renderItem={({ item }) => <TransactionListItem {...item} />}
        ListFooterComponent={(TXNs.length > 0 || isLoading) ? (<View style={[isLoading && { marginTop: sizeToDp(APP_PADDING) }]} ><LoadingListLoader showLoader={!(totalAmounts.totalPages === currentPage && !isLoading)} title={!(totalAmounts.totalPages === currentPage && !isLoading) ? (currentPage === 1 ? `Cargando transacciones` : `Cargando página ${currentPage}/${totalAmounts.totalPages}`) : `Fin de la lista`} subtitle={!(totalAmounts.totalPages === currentPage && !isLoading) ? `Por favor espera...` : `No hay más transacciones`} /></View>) : <></>}
        ListFooterComponentStyle={[(TXNs.length === 0) ? { marginBottom: sizeToDp(APP_PADDING * 0.2) } : { marginTop: sizeToDp(APP_PADDING * 0.2), marginBottom: sizeToDp(APP_PADDING * 0.8) }]}
        style={[STYLES.listStyle]}
        onEndReached={(totalAmounts.totalPages <= 1 || isLoading) ? () => { } : handleNextPage}
      />
    </BasicScreenWrapper>
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
  }
});
