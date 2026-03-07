import React, { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, NativeModules, Pressable, StyleSheet, View } from 'react-native';
import FastImage from "react-native-fast-image";
import { BottomSheetsContext } from '../../../core/components/bottomSheets/context.tsx';
import BalanceHeaderInfo from "../../../core/components/headers/BalanceHeaderInfo.tsx";
import LoadingListLoader from "../../../core/components/LoadingListLoader.tsx";
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper.tsx';
import { Typography } from '../../../core/components/Typography.tsx';
import { APP_PADDING } from "../../../core/utils/constants.ts";
import { formatPriceFromDigits } from '../../../core/utils/priceFormater.ts';
import { obtenerTotalCobrado, obtenerTotalPropinas, obtenerTransaccionesPorEstado } from '../../../core/utils/registerTxn.ts';
import { sizeToDp } from '../../../core/utils/sizeToDP.tsx';
import theme from "../../../core/utils/styles/styles.ts";
import { Filters } from "./components/Filters.tsx";
import TransactionListItem from "./components/TransactionListItem.tsx";
import { useSharedValue } from 'react-native-reanimated';
import { useMMKVString } from 'react-native-mmkv';
import StorageKey from '../../../core/utils/store/keysStore.ts';
import { mmkvStorage } from '../../../core/store/principalStore.ts';
import { useGetAllTransactions } from '../../../core/api/getAllTransactions.ts';
import { TransactionsHistoryContext } from './context.tsx';
;

type DateFilterItem = {
  label: string;
  selectionValue: string;
  dateStart: string
  dateEnd: string;
  infoText: string;
};

export function buildTransactionsRangeText(
  items: DateFilterItem[],
  selectionValue: string
): string {
  const item = items.find(i => i.selectionValue === selectionValue);
  if (!item) return 'Transacciones de: —';

  // Parse seguro en UTC para evitar problemas de huso horario/DST
  const parseYMD = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };

  const start = parseYMD(item.dateStart);
  const endExclusive = parseYMD(item.dateEnd);

  // Mostramos fin inclusivo => endExclusive - 1 día
  const endInclusive = new Date(endExclusive);
  endInclusive.setUTCDate(endInclusive.getUTCDate() - 1);

  const MONTH_ABBR_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fmt = (d: Date) =>
    `${String(d.getUTCDate()).padStart(2, '0')} ${MONTH_ABBR_ES[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(-2)}`;

  return `Transacciones de: ${fmt(start)} - ${fmt(endInclusive)}`;
}

const { SmartWrapperModule } = NativeModules;

let filterTO: number;

const TransactionsHistory = () => {
  const { transactionSelected } = useContext(BottomSheetsContext)
  const { setRefetchData, refetchData } = useContext(TransactionsHistoryContext)
  /*  */
  const listRef = useRef<FlatList<any>>(null)
  const [total, setTotal] = useState('0')
  const [extra, setExtra] = useState('0')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [TXNs, setTXNs] = useState<any>([])
  const [totalAmounts, setTotalAmounts] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  /*  */

  const isHistorialLoadingSV = useSharedValue(false)

  const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)

    const getAllTransactionsMutator = useGetAllTransactions()

  async function goToReports() {
    await SmartWrapperModule.getBalance();
  }

  function handleGetHistorial({ status = 'all', page = 1 }: any) {
    isHistorialLoadingSV.value = true;

    getAllTransactionsMutator.mutateAsync({
      data: {
        status,
        page,
      },
      serialNumber: deviceId
    }).then((resp: any) => {
      /* transactionsTotalPagesSV.value = resp.data.totalPages
      transactionsSelectedPageSV.value = page */

      const totalAmounts: any = {}
      totalAmounts.totalThisMonth = resp.data.totalThisMonth
      totalAmounts.totalLastMonth = resp.data.totalLastMonth
      totalAmounts.totalThisWeek = resp.data.totalThisWeek
      totalAmounts.totalLastWeek = resp.data.totalLastWeek
      totalAmounts.totalYesterday = resp.data.totalYesterday
      totalAmounts.totalToday = resp.data.totalToday
      totalAmounts.totalItems = resp.data.totalItems

      setTotalAmounts(totalAmounts)
      console.log(resp.data.data[0])
      setTXNs((prev: any) => [...prev, ...resp.data.data])
    }).catch((err: any) => {
      console.log('---err ' + err)
    }).finally(() => {
      isHistorialLoadingSV.value = false
      setRefetchData(false)
      setIsLoading(false)
    });
  }

  useEffect(() => {
    /* setTotal(formatPriceFromDigits?.(obtenerTotalCobrado().toString()))
    setExtra(formatPriceFromDigits?.(obtenerTotalPropinas().toString())) */
  }, [transactionSelected])


  useEffect(() => {
    setIsLoading(true)
    setTXNs([])
    filterTO && clearTimeout(filterTO)
    filterTO = setTimeout(() => {      
      handleGetHistorial({ status: selectedFilter })
    }, 700)
  }, [selectedFilter])

  useEffect(() => {
    if (refetchData){
      setIsLoading(true)
      setTXNs([])
      handleGetHistorial({ status: selectedFilter })
    }
  }, [refetchData])

  useEffect(() => {
    setRefetchData(true)
  }, [])

  return (
    <BasicScreenWrapper noHeader noPaddingBottom >
      <View style={[STYLES.listHeaderStyle]}>
        <View >
          <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING), paddingTop: sizeToDp(APP_PADDING * 1), flexDirection: 'row', alignItems: 'flex-end', width: '100%' }]} >
            <BalanceHeaderInfo
              balanceTitle={'Ganancias totales:'}
              filterTitleText={'Hoy'}
              onPressFilterTitle={() => { }}
              balance={total}
              currency={'MXN'}
              equivalentCurrency={'MXN'}
              equivalentBalance={extra}
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

          <Filters onPress={(filter: any) => setSelectedFilter(filter)} style={{ paddingTop: sizeToDp(APP_PADDING * 0.7), paddingBottom: sizeToDp(APP_PADDING * 0.8) }} />
        </View>

        <View>
          {/* <HeaderGradient /> */}
          {/* <View style={[{ alignItems: 'center', paddingVertical: sizeToDp(APP_PADDING * 0.5), borderTopWidth: sizeToDp(1), borderColor: theme.colors.glassPrimary }]} >
              <Typography variant='text03Medium' color='textQuinary' >{TOTAL_AMOUNTS?.totalItems || 0} {buildTransactionsRangeText(DATE_FILTERS_DATES, selectedFilter)}</Typography>
            </View> */}
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
        ListFooterComponent={(TXNs.length > 0 || isLoading) ? (<View style={[isLoading && { marginTop: sizeToDp(APP_PADDING) }]} ><LoadingListLoader showLoader={isLoading} title={isLoading ? `Cargando transacciones` : `Fin de la lista`} subtitle={isLoading ? `Por favor espera...` : `No hay más transacciones`} /></View>) : <></>}
        ListFooterComponentStyle={[(TXNs.length === 0) ? { marginBottom: sizeToDp(APP_PADDING * 0.2) } : { marginTop: sizeToDp(APP_PADDING * 0.2), marginBottom: sizeToDp(APP_PADDING * 0.8) }]}
        style={[STYLES.listStyle]}
      /* onEndReached={(totalPages <= 1 || isHistorialLoading)? () => { } : handleNetPage} */
      /* refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => {
            TRANSACTIONS_CONTEXT.transactionsTotalPagesSV.value = 1
            TRANSACTIONS_CONTEXT.transactionsSelectedPageSV.value = 1
            TRANSACTIONS_CONTEXT.historialListSV.value = '[]'
            TRANSACTIONS_CONTEXT.handleGetHistorial({ filter: selectedFilter, status: selectedStatusFilter, page: 1 })
          }}
        />
      } */
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
    /* paddingBottom: sizeToDp(APP_PADDING * 0.8), */
    borderBottomWidth: sizeToDp(1),
    borderBottomColor: theme.colors.glassPrimary,
    marginBottom: -sizeToDp(1),
    /* paddingHorizontal: sizeToDp(APP_PADDING), */
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sizeToDp(APP_PADDING * 4),
  }
});
