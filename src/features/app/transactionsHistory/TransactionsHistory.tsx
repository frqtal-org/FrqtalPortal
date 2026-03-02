import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, FlatList, StyleSheet, View } from 'react-native';
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper.tsx';
import { Typography } from '../../../core/components/Typography.tsx';;
import { sizeToDp } from '../../../core/utils/sizeToDP.tsx';
import { APP_PADDING } from "../../../core/utils/constants.ts";
import theme from "../../../core/utils/styles/styles.ts";
import TransactionListItem from "./components/TransactionListItem.tsx";
import BalanceHeaderInfo from "../../../core/components/headers/BalanceHeaderInfo.tsx";
import { Filters } from "./components/Filters.tsx";
import LoadingListLoader from "../../../core/components/LoadingListLoader.tsx";
import HeaderGradient from "../../../core/utils/styles/backgroundGradients/HeaderGradient.tsx";

type DateFilterItem = {
  label: string;
  selectionValue: string;
  dateStart: string; // 'YYYY-MM-DD'
  dateEnd: string;   // 'YYYY-MM-DD' (fin exclusivo)
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

const TransactionsHistory = memo(() => {
  /*  */
  /* const BOTTOM_SHEETS_CONTEXT = useContext(BottomSheetsContext)
  const TRANSACTIONS_CONTEXT = useContext(TransactionsContext); */
  /*  */
  /* const [allTransactions, setAllTransactions] = useState(TRANSACTIONS_CONTEXT.historialListSV.value);
  const [isHistorialLoading, setIsHistorialLoading] = useState(TRANSACTIONS_CONTEXT.isHistorialLoadingSV.value);
  const [selectedFilter, setSelectedFilter] = useState(TRANSACTIONS_CONTEXT.selectedFilterSV.value);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(TRANSACTIONS_CONTEXT.selectedStatusFilterSV.value);
  const [isCancelingTransaction, setIsCancelingTransaction] = useState(TRANSACTIONS_CONTEXT.isActionLoading.value);
  const [totalAmounts, setTotalAmounts] = useState(TRANSACTIONS_CONTEXT.totalAmountsSV.value);
  const [totalAmountsFilterList, setTotalAmountsFilterList] = useState<any>([]);
  const [dateFiltersDates, setDateFiltersDates] = useState<any>(TRANSACTIONS_CONTEXT.dateFiltersDatesSV.value);
  const [totalPages, setTotalPages] = useState<any>(TRANSACTIONS_CONTEXT.transactionsTotalPagesSV.value);
  const [selectedPage, setSelectedPage] = useState<any>(TRANSACTIONS_CONTEXT.transactionsSelectedPageSV.value); */
  /*  */
  const listRef = useRef<FlatList<any>>(null)
  /*  */
  /* const { goBack } = useNavigation();
  const { params } = useRoute<any>(); */
  /*  */
  /* const ALL_TRANSACTIONS = useMemo(() => JSON.parse(allTransactions), [allTransactions]);
  const TOTAL_AMOUNTS = useMemo(() => JSON.parse(totalAmounts), [totalAmounts])
  const DATE_FILTERS_DATES = useMemo(() => JSON.parse(dateFiltersDates), [dateFiltersDates]) */


  /* ------- FUNCTIONS ------- */
  /* function handleNetPage() {
    if (selectedPage === totalPages || totalPages === 0 || isHistorialLoading) return
    TRANSACTIONS_CONTEXT.isHistorialLoadingSV.value = true
    TRANSACTIONS_CONTEXT.transactionsSelectedPageSV.value = TRANSACTIONS_CONTEXT.transactionsSelectedPageSV.value + 1
  } */
  /* ------- END FUNCTIONS ------- */

  /* ------- ANIMATIONS ------- */
  /* useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.selectedFilterSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setSelectedFilter, currentValue)
    }
  })
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.selectedStatusFilterSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setSelectedStatusFilter, currentValue)
    }
  })
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.transactionsSelectedPageSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setSelectedPage, currentValue)
    }
  })
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.historialListSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setAllTransactions, currentValue)
    }
  })
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.isHistorialLoadingSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setIsHistorialLoading, currentValue)
    }
  })
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.isActionLoading.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setIsCancelingTransaction, currentValue)
    }
  })
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.totalAmountsSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setTotalAmounts, currentValue)
    }
  })
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.dateFiltersDatesSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setDateFiltersDates, currentValue)
    }
  })
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.transactionsTotalPagesSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setTotalPages, currentValue)
    }
  }) */
  /* ------- END ANIMATIONS ------- */

  /* ------- EFFECTS ------- */
  useFocusEffect(
    useCallback(() => {
      /* TRANSACTIONS_CONTEXT.montoToRefundSV.value = ''
      TRANSACTIONS_CONTEXT.codigoAprobacionToRefundSV.value = ''
      TRANSACTIONS_CONTEXT.referenciaBancoToRefundSV.value = ''
      TRANSACTIONS_CONTEXT.transactionSignSV.value = ''
      TRANSACTIONS_CONTEXT.transactionDateToRefundSV.value = ''
      TRANSACTIONS_CONTEXT.emailToSendVoucherSV.value = ''
      const onBackPress = () => {
        goBack();
        TRANSACTIONS_CONTEXT.selectedFilterSV.value = 'week'
        TRANSACTIONS_CONTEXT.selectedStatusFilterSV.value = 'all'
        ALL_TRANSACTIONS.length > 0 && listRef.current?.scrollToIndex?.({ index: 0 })
        TRANSACTIONS_CONTEXT.transactionsTotalPagesSV.value = 1
        TRANSACTIONS_CONTEXT.transactionsSelectedPageSV.value = 1
        TRANSACTIONS_CONTEXT.historialListSV.value = '[]'
        BOTTOM_SHEETS_CONTEXT.transactionsFilterBottomSheetRef.current.close()
        return true
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove(); */
    }, [])
  );

  /* useEffect(() => {
    if (selectedPage === 1) return
    TRANSACTIONS_CONTEXT.handleGetHistorial({ filter: selectedFilter, status: selectedStatusFilter, page: selectedPage });
  }, [selectedPage]) */

  /* useFocusEffect(useCallback(() => {
    if (!params.loadData || params.bypassLoadData) {
      params.bypassLoadData = false
      return
    }
    TRANSACTIONS_CONTEXT.transactionsTotalPagesSV.value = 0
    TRANSACTIONS_CONTEXT.transactionsSelectedPageSV.value = 1
    TRANSACTIONS_CONTEXT.historialListSV.value = '[]'
    TRANSACTIONS_CONTEXT.handleGetHistorial({ filter: selectedFilter, status: selectedStatusFilter, page: 1 });
  }, [selectedFilter, selectedStatusFilter])) */


  useEffect(() => {
    /* if (!TOTAL_AMOUNTS?.totalThisWeek && TOTAL_AMOUNTS?.totalThisWeek !== 0) return
    const FILTERS_WITH_AMOUNTS = TRANSACTIONS_CONTEXT.LIST_DATE_FILTERS.map((dateItem: any) => {
      if (dateItem.selectionValue === 'week') { dateItem.infoText = `${TOTAL_AMOUNTS['totalThisWeek']}` }
      if (dateItem.selectionValue === 'lastWeek') { dateItem.infoText = `${TOTAL_AMOUNTS['totalLastWeek']}` }
      if (dateItem.selectionValue === 'month') { dateItem.infoText = `${TOTAL_AMOUNTS['totalThisMonth']}` }
      if (dateItem.selectionValue === 'lastMonth') { dateItem.infoText = `${TOTAL_AMOUNTS['totalLastMonth']}` }
      if (dateItem.selectionValue === 'yesterday') { dateItem.infoText = `${TOTAL_AMOUNTS['totalYesterday']}` }
      return dateItem
    })
    setTotalAmountsFilterList(FILTERS_WITH_AMOUNTS) */
  }, [/* TOTAL_AMOUNTS */])
  /* ------- END EFFECTS ------- */

  return (
    <BasicScreenWrapper noHeader noPaddingBottom >
      <View style={[STYLES.listHeaderStyle]}>
        <View >
          <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING), paddingTop: sizeToDp(APP_PADDING * 1) }]} >
            <BalanceHeaderInfo
              balanceTitle={'Ganancias totales:'}
              filterTitleText={'Semana'}
              onPressFilterTitle={() => { }}
              balance={`$0.00`}
              currency={'MXN'}
              equivalentBalance={`$0.00`}
              equivalentBalanceColor={'notificationGreen'}
              equivalentMiniText='Hoy:'
            />
          </View>

          <Filters style={{ paddingTop: sizeToDp(APP_PADDING * 0.7), paddingBottom: sizeToDp(APP_PADDING * 0.8) }} />
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
        /* key={`transactions-history-${selectedFilter}-${selectedStatusFilter}`} */
        keyExtractor={(item: any, index: number) => `all-transactions-list-${index}`}
        /* drawDistance={700} */
        showsVerticalScrollIndicator={false}
        /* contentContainerStyle={[(ALL_TRANSACTIONS.length === 0 && !isHistorialLoading) && { flex: 1 }]}
        ListEmptyComponent={!isHistorialLoading ? <View style={[STYLES.emptyListContainer, { flex: 1 }]} ><Typography style={[{ textAlign: 'center' }]} variant='text02Medium' color='textSecondary' >Sin transacciones en el periodo seleccionado</Typography></View> : <></>} */
        data={[
          {
            "RESPONSE_CODE": "00",
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "BB00CAAAE2613275",
            "TXN_UNIQUE_REF": "01032026174108306",
            "SG_REFERENCE_FOLIO": "260600348849",
            "CARD_TYPE": "0",
            "MNEMO_NAME": "SV",
            "TERMINAL_ID": "caja07",
            "APP_LABEL": "Debit Mastercard",
            "TAG_50": "Debit Mastercard",
            "TAG_95": "0000008001",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "AMOUNT": "25000",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "PREFERRED_NAME": "Debit Mastercard",
            "RESPONSE_MESSAGE": "Aprobada",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "510125******8695",
            "AID": "A0000000041010",
            "SIGNATURE_FLAG": "2",
            "ARQC": "BB00CAAAE2613275",
            "TXN_NAME": "VENTA EN LINEA",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "174106",
            "TAG_9F12": "Debit Mastercard",
            "TXN_APPROVAL_CODE": "082730",
            "TAG_9F34": "1F0302",
            "CARD_NAME": "SI VALE",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "TRANSACTION_TYPE": "1",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "174111",
            "EXPIRATION_DATE": "3208",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TAG_5F2A": "0484",
            "TXN_DATE": "260301",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460468",
            "TIP": "3750",
            "BANK_NAME": "SI VALE",
            "MERCHANT_ID": "12345678"
          },
          {
            "RESPONSE_CODE": "00",
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "AF88D434C6A86A24",
            "TXN_UNIQUE_REF": "01032026165844089",
            "SG_REFERENCE_FOLIO": "260600345694",
            "CARD_TYPE": "0",
            "MNEMO_NAME": "SV",
            "TERMINAL_ID": "caja07",
            "APP_LABEL": "Debit Mastercard",
            "TAG_50": "Debit Mastercard",
            "TAG_95": "0000008001",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "AMOUNT": "2558",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "PREFERRED_NAME": "Debit Mastercard",
            "RESPONSE_MESSAGE": "Pendiente",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "510125******8695",
            "AID": "A0000000041010",
            "SIGNATURE_FLAG": "2",
            "ARQC": "AF88D434C6A86A24",
            "TXN_NAME": "VENTA EN LINEA",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "165840",
            "TAG_9F12": "Debit Mastercard",
            "TXN_APPROVAL_CODE": "018840",
            "TAG_9F34": "1F0302",
            "CARD_NAME": "SI VALE",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "TRANSACTION_TYPE": "1",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "165845",
            "EXPIRATION_DATE": "3208",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TAG_5F2A": "0484",
            "TXN_DATE": "260301",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460458",
            "BANK_NAME": "SI VALE",
            "MERCHANT_ID": "12345678"
          },
          {
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "D0E0A9E78D1093AF",
            "TXN_UNIQUE_REF": "01032026165906813",
            "APP_LABEL": "Debit Mastercard",
            "TAG_50": "Debit Mastercard",
            "TAG_95": "0000008001",
            "AMOUNT": "52364",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "510125******8695",
            "AID": "A0000000041010",
            "ARQC": "D0E0A9E78D1093AF",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "165903",
            "TXN_APPROVAL_CODE": "025249",
            "TAG_9F34": "1E0300",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "165908",
            "EXPIRATION_DATE": "3208",
            "TAG_5F2A": "0484",
            "SIGNATURE_BYTES": "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",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460459",
            "RESPONSE_CODE": "00",
            "SG_REFERENCE_FOLIO": "260600345732",
            "CARD_TYPE": "0",
            "MNEMO_NAME": "SV",
            "TERMINAL_ID": "caja07",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "PREFERRED_NAME": "Debit Mastercard",
            "RESPONSE_MESSAGE": "Cancelada",
            "SIGNATURE_FLAG": "1",
            "TXN_NAME": "VENTA EN LINEA",
            "TAG_9F12": "Debit Mastercard",
            "CARD_NAME": "SI VALE",
            "TRANSACTION_TYPE": "1",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TXN_DATE": "260301",
            "TIP": "5236",
            "BANK_NAME": "SI VALE",
            "MERCHANT_ID": "12345678"
          },
          {
            "RESPONSE_CODE": "00",
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "A9E0A6FADA590458",
            "TXN_UNIQUE_REF": "01032026165928396",
            "SG_REFERENCE_FOLIO": "260600345770",
            "CARD_TYPE": "0",
            "MNEMO_NAME": "SV",
            "TERMINAL_ID": "caja07",
            "APP_LABEL": "Debit Mastercard",
            "TAG_50": "Debit Mastercard",
            "TAG_95": "0000008001",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "AMOUNT": "255",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "PREFERRED_NAME": "Debit Mastercard",
            "RESPONSE_MESSAGE": "Devuelta",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "510125******8695",
            "AID": "A0000000041010",
            "SIGNATURE_FLAG": "2",
            "ARQC": "A9E0A6FADA590458",
            "TXN_NAME": "VENTA EN LINEA",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "165925",
            "TAG_9F12": "Debit Mastercard",
            "TXN_APPROVAL_CODE": "066227",
            "TAG_9F34": "1F0302",
            "CARD_NAME": "SI VALE",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "TRANSACTION_TYPE": "1",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "165930",
            "EXPIRATION_DATE": "3208",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TAG_5F2A": "0484",
            "TXN_DATE": "260301",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460460",
            "TIP": "38",
            "BANK_NAME": "SI VALE",
            "MERCHANT_ID": "12345678"
          },
          {
            "RESPONSE_CODE": "00",
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "7FF8FA26F1420369",
            "TXN_UNIQUE_REF": "01032026162832205",
            "SG_REFERENCE_FOLIO": "260600343461",
            "CARD_TYPE": "1",
            "MNEMO_NAME": "MG",
            "TERMINAL_ID": "caja07",
            "APP_LABEL": "Mastercard",
            "TAG_50": "Mastercard",
            "TAG_95": "0000008001",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "AMOUNT": "35400",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "RESPONSE_MESSAGE": "Aprobada",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "531722******0431",
            "AID": "A0000000041010",
            "SIGNATURE_FLAG": "1",
            "ARQC": "7FF8FA26F1420369",
            "TXN_NAME": "VENTA EN LINEA",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "162829",
            "TXN_APPROVAL_CODE": "094233",
            "TAG_9F34": "1E0300",
            "CARD_NAME": "Mastercard Gen",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "TRANSACTION_TYPE": "1",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "162834",
            "EXPIRATION_DATE": "3211",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TAG_5F2A": "0484",
            "SIGNATURE_BYTES": "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",
            "TXN_DATE": "260301",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460445",
            "TIP": "5310",
            "BANK_NAME": "MASTERCARD",
            "MERCHANT_ID": "12345678"
          },
          {
            "RESPONSE_CODE": "00",
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "A61785BF6A024A27",
            "TXN_UNIQUE_REF": "01032026163219322",
            "SG_REFERENCE_FOLIO": "260600343725",
            "CARD_TYPE": "1",
            "MNEMO_NAME": "MG",
            "TERMINAL_ID": "caja07",
            "APP_LABEL": "Mastercard",
            "TAG_50": "Mastercard",
            "TAG_95": "0000008001",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "AMOUNT": "560",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "RESPONSE_MESSAGE": "Aprobada",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "531722******0431",
            "AID": "A0000000041010",
            "SIGNATURE_FLAG": "2",
            "ARQC": "A61785BF6A024A27",
            "TXN_NAME": "VENTA EN LINEA",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "163216",
            "TXN_APPROVAL_CODE": "078943",
            "TAG_9F34": "1F0302",
            "CARD_NAME": "Mastercard Gen",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "TRANSACTION_TYPE": "1",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "163221",
            "EXPIRATION_DATE": "3211",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TAG_5F2A": "0484",
            "TXN_DATE": "260301",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460450",
            "TIP": "84",
            "BANK_NAME": "MASTERCARD",
            "MERCHANT_ID": "12345678"
          },
          {
            "RESPONSE_CODE": "00",
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "420B214DAE5AD4D0",
            "TXN_UNIQUE_REF": "01032026163240537",
            "SG_REFERENCE_FOLIO": "260600343763",
            "CARD_TYPE": "1",
            "MNEMO_NAME": "MG",
            "TERMINAL_ID": "caja07",
            "APP_LABEL": "Mastercard",
            "TAG_50": "Mastercard",
            "TAG_95": "0000008001",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "AMOUNT": "569",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "RESPONSE_MESSAGE": "Aprobada",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "531722******0431",
            "AID": "A0000000041010",
            "SIGNATURE_FLAG": "2",
            "ARQC": "420B214DAE5AD4D0",
            "TXN_NAME": "VENTA EN LINEA",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "163237",
            "TXN_APPROVAL_CODE": "015971",
            "TAG_9F34": "1F0302",
            "CARD_NAME": "Mastercard Gen",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "TRANSACTION_TYPE": "1",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "163242",
            "EXPIRATION_DATE": "3211",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TAG_5F2A": "0484",
            "TXN_DATE": "260301",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460451",
            "BANK_NAME": "MASTERCARD",
            "MERCHANT_ID": "12345678"
          },
          {
            "RESPONSE_CODE": "00",
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "117099F611E62EBE",
            "TXN_UNIQUE_REF": "01032026164738533",
            "SG_REFERENCE_FOLIO": "260600344877",
            "CARD_TYPE": "1",
            "MNEMO_NAME": "MG",
            "TERMINAL_ID": "caja07",
            "APP_LABEL": "Mastercard",
            "TAG_50": "Mastercard",
            "TAG_95": "0000008001",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "AMOUNT": "33333",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "RESPONSE_MESSAGE": "Aprobada",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "531722******0431",
            "AID": "A0000000041010",
            "SIGNATURE_FLAG": "2",
            "ARQC": "117099F611E62EBE",
            "TXN_NAME": "VENTA EN LINEA",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "164735",
            "TXN_APPROVAL_CODE": "059715",
            "TAG_9F34": "1F0302",
            "CARD_NAME": "Mastercard Gen",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "TRANSACTION_TYPE": "1",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "164740",
            "EXPIRATION_DATE": "3211",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TAG_5F2A": "0484",
            "TXN_DATE": "260301",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460455",
            "TIP": "5000",
            "BANK_NAME": "MASTERCARD",
            "MERCHANT_ID": "12345678"
          }
        ]}
        onEndReachedThreshold={2}
        renderItem={({ item }) => <TransactionListItem {...item} />}
        ListFooterComponent={!([].length > 0 || false) ? (<View ><LoadingListLoader showLoader={false/* !(totalPages === selectedPage && !isHistorialLoading) */} title={/* !(totalPages === selectedPage && !isHistorialLoading) ?  (selectedPage === 1 ? `Cargando transacciones` : `Cargando página ${selectedPage}/${totalPages}`) :  */`Fin de la lista`} subtitle={/* !(totalPages === selectedPage && !isHistorialLoading) ?  `Por favor espera...` :  */`No hay más transacciones`} /></View>) : <></>}
        ListFooterComponentStyle={[!([].length === 0) ? { marginBottom: sizeToDp(APP_PADDING * 0.2) } : { marginTop: sizeToDp(APP_PADDING * 0.2), marginBottom: sizeToDp(APP_PADDING * 0.8) }]}
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
      {/* {isHistorialLoading && <LoadingScreen />} */}
    </BasicScreenWrapper>
  );
});

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
