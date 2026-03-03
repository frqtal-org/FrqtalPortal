import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, FlatList, NativeModules, Pressable, StyleSheet, View } from 'react-native';
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
import FastImage from "react-native-fast-image";

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

const { SmartWrapperModule } = NativeModules;

const TransactionsHistory = memo(() => {
  /*  */
  const listRef = useRef<FlatList<any>>(null)

  async function goToReports() {
    await SmartWrapperModule.getBalance();
  }

  return (
    <BasicScreenWrapper noHeader noPaddingBottom >
      <View style={[STYLES.listHeaderStyle]}>
        <View >
          <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING), paddingTop: sizeToDp(APP_PADDING * 1), flexDirection: 'row', alignItems: 'flex-end', width: '100%'}]} >
            <BalanceHeaderInfo
              balanceTitle={'Ganancias totales:'}
              filterTitleText={'Hoy'}
              onPressFilterTitle={() => { }}
              balance={`$19,743.20`}
              currency={'MXN'}
              equivalentBalance={`+$2,723.54`}
              equivalentBalanceColor={'notificationGreen'}
              equivalentMiniText='Extra:'
            />
            <Pressable onPress={goToReports} style={[{ marginLeft: 'auto', flexDirection: 'row', columnGap: sizeToDp(APP_PADDING * 0.3), paddingBottom: sizeToDp(APP_PADDING * 0.2), right: sizeToDp(APP_PADDING * 0.2), paddingTop: sizeToDp(APP_PADDING) }]} >
              <Typography variant="text01Medium" color="brand200" >Reporte</Typography>
              <FastImage
                source={require('../../../core/assets/images/report200.png')}
                style={[{ width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]}
                resizeMode='contain'
              />
            </Pressable>
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
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "C0DB62B2874AB8D6",
            "TXN_UNIQUE_REF": "frq03032026015629274",
            "APP_LABEL": "Mastercard",
            "TAG_50": "Mastercard",
            "TAG_95": "0000008001",
            "AMOUNT": "53200",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "532829******5876",
            "AID": "A0000000041010",
            "ARQC": "C0DB62B2874AB8D6",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "015637",
            "TXN_APPROVAL_CODE": "075299",
            "TAG_9F34": "1E0300",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "015636",
            "EXPIRATION_DATE": "3011",
            "TAG_5F2A": "0484",
            "SIGNATURE_BYTES": "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",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460912",
            "RESPONSE_CODE": "00",
            "SG_REFERENCE_FOLIO": "260620492407",
            "CARD_TYPE": "1",
            "MNEMO_NAME": "DD",
            "TERMINAL_ID": "caja07",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "PREFERRED_NAME": "Mastercard",
            "RESPONSE_MESSAGE": "Aprobada",
            "SIGNATURE_FLAG": "1",
            "TXN_NAME": "VENTA EN LINEA",
            "TAG_9F12": "Mastercard",
            "CARD_NAME": "Didi",
            "TRANSACTION_TYPE": "1",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TXN_DATE": "260303",
            "TIP": "7980",
            "BANK_NAME": "MASTERCARD",
            "MERCHANT_ID": "12345678"
          },
          {
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "5145531052E27871",
            "TXN_UNIQUE_REF": "frq02032026132527243",
            "APP_LABEL": "VISA CREDITO",
            "TAG_50": "VISA CREDITO",
            "TAG_95": "0000000000",
            "CARD_HOLDER_NAME": "PAYWAVE/VISA   ",
            "AMOUNT": "54566",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "407561******4389",
            "AID": "A0000000031010",
            "ARQC": "5145531052E27871",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "132521",
            "TXN_APPROVAL_CODE": "SBTA11",
            "TAG_9F34": "1E0000",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "132529",
            "EXPIRATION_DATE": "3003",
            "TAG_5F2A": "0484",
            "SIGNATURE_BYTES": "UklGRnIQAABXRUJQVlA4WAoAAAAgAAAADAEA0wAASUNDUBgCAAAAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANlZQOCA0DgAAMEQAnQEqDQHUAD7RZqtRKCUjoqKVGlkAGglpbuFx4Rvzk/EP9p7Q/7f4e+L/1TIPbvtR35P92v339v82f8/4E+/v+t9QL8k/lv+P8SHYxax/kfQC9mPs3fm/4noR9j/+B7gH6u/8f1W/4fgp/cf+n7AH8n/wf/l/ufupf1f7Vecf9E/yf7PfAN+uvppexj91vZC/br//j7FTGM5blM5Mvefwk8aLNk5DoGNAIMEwvY2b6UNiJI87vrZO/ivHmqNjmQ4Qkg8zPSZCIdXSRuLquI3xcPI1JOTzztS3IHtkhKgFgQzsc1lDoGbgM894n0+aAoLMqswe55POzGQOyHGG+YDX3L0e6ZA7INd27Tc0j+o0v2yCjSijsoWYsaUSYj/qIaQ1N9c2+8T+Vcy81h6PLGlSRO1HTHQvc0iC2X9/6FgN/+wh0RQjpsbW+BiniBpS5YwjpyZ7EOMZsvWJ7xf+fJtGMFSiWKj7eYbHkscLUpCJEeoLbN/OKHWzKg75TieG2/N3Sd/pWGX7ae1pve87ovTFwUQsgedyiBb7vGf/+B4xXVP+wXkhSJjOksEiPI4253Dbyta96M9zjanTdXPwLIFU1qnFoXcz97ZZ5WwLLwgwImylJYb2X3xTTjT1EVFdYE/9rA4cFOPF51BIGYJDzxu/zRLqY1OXDha+ZhDH2WI2YYWuumQOyHCAYtlrB10yB2Q4WpScuL0e6ZA7IcLUpOXF6PdMgdkOFigA/v5eISL3eq3xqQ/0eU2q6XLhEcfy3hmw2y6llZscNZZI2xWtsES/9E/tjTXOAEp6FVO6iYFFU4HYlXcuWIoAPWJkjSZ7IkOZloEMvBqxvoaHut2eSs6u1pPJQvJsBZQx7DysffpFS8KcuXotBRnXgyaCOftzlRVKyaMo7DLDQBCn4+QkVvowlqI5FBV780Uj3T1VE/TGqTFjcwaYNRF8kIeW/ZEmrGydXGtFLzFb83QRgaLNBl6E80fg5XdXCIRORmQK1ywy4cdzzGuYWEetrzHiI9/kZAMUH+foXqGNFsK3RTWjrgLV/dUEtpUysHF/SvYELMbFfD5TnrfDIspZKTJNNPMkUjLC+VdgMj0i7j8MCKFne+MV0DCyKQ8aEVvRwQWcHWyqfJpCsLuVltMKmgncdprTgbp1jfPrJC93SZ5uF5hAotTxIrDUQHGMBORvS9LPJDS/YalkuV9lFHHC4mmw97+bCi7TCdZgXc3w6lpr9zXEziXzxT8nk9EM1tmnQZTpuAywARUQTQfrggqAD1KD/G8Sr9RkBMWQ1YC4NVG3fZe6Ecrs3iZ+LFWF/JWGYahkGcteOaTtBiQwzuk1xgrB/shcMZY1k6/vPeCFemzxaTRWuQqmSeER3zgAUnG0TrLijOwgmoCpFhaNOeDYh438wxYSFWTdtmZYU+LZjS6R3m0Rg0+2Nz+nz8wJBFAlW5XUb6TR4sQo/5v6rBsEh28v7bmV0VNEL9ApFlqEmW5K313ZNjOnSRm6xhGXgaqdAaI5ReT0SaKV+wBWUWsdfqa1l6Ornd69U/uVJ4kFE0Wo1HkixG01ani2/Oxjgu7v+mYNHhZKYM3I8DVsTi46x9GsR6sTiSu+sCBo6Y0gfxTmrxihAzRQ4RIgBje4aCp7HftFjfVElxKBmEaqYZqW1jAvS0DAvHHLQG4gG718wAAeRyxy34TXsoudkF3SvjJ3339vRIpY4mP5dIV5cxoqL7wMviprdTf9b4vMXSNRgqvLj1gNeGJsoxQzyVyaLUYM3+C0teHHZ/GB7oez5qwk/1ZTRv6UkjwmPWCdU6TKgdOVJMHdsG63eYynDyGWiyW3adlXxjf5J7IVsiT8Yur9Pdr8awPZkiXuSTdIrC621mM17Ykb0SNGtqxnNT2Zzr0dXs3gIz252jM8xxkrm3MeR5EUPtrLNAOqC3j5dsqUlQgBA5s17EKfZfSzxeAwMOta1w9ffZ8dDd0HlDqKZPhgXxX5brBcbSWqXr1eMnZXMtK0OBmJvAEibaie1EyJKN7SJduFt4QZXmMlr2pgLbMbeyG2bkElvcsiIjqiW/qmzwuck6VCKpsLWPrNaSgh9D9zx3fHFgiZtoV6FkhAwRJOblMc8It/5fN0MIJU4hrVP7WWIhXPoxGsCbfCyzBCG5WWiVkrFicMYqChLndybb/kLSIaVt4vhAoOSFMUx2hQdaBPVYYckdIwVtuv62kwAs/zhtb5EPlOYzAxoOnEFnvPr+OkNP+iFTR/ACJHjXPT2WGUdgXIvM33DWEEERNpIxADyQM3cvfJ6LaUEYVfz0Mlj4JBgW7PO38Mh7AV3jbcceq1QGgksZP26hF/l4rXPIVPtPXi2NH3bqPlest2PAVBRZ8pa1+lvBCaP2I84p36f+xOH3iVbOciTLM4EZoYoD+XEjSPw6adRnS/fiqDmgQ4g/qjRvNFYOxQuGrgZpUb4E5BXMnGaAu8bNNjAXhKxfJtZ/Lb6KnRNkuE2fHpCCrQi+Z7aPPeEL6ZClrVUb6fpGyGO+u8yTx4mH6g7Obena3lXa1OIk9mZ7rCDVWwD+8CKQ5xi+louCEYwAoaCbYbY9KT9qOzIQzIv9jrvtz3Ovi/6E2VqJXC5/768GbKwBfFTvyLXioiYWXnR0BXYKLVebaJSF7Agz+Kt7iTaOLq74ZwjTYjsoLSzuWcjritcFtyhwb8NsD7FaTctrJZLWI5mplZUgiUPPt9a4NNHpDYjKAmy7qvkSG051vWLL63XBaH6DTCThuOR9YrFC6XTZzQ6NrLHnFu74CxTQlnMrmiQGUL0HNfQr6l2T7ohoSihkhmVs4RcQZuBJiQpN5i36P9TFwJ4/iQnQYf01PeGbCPf2n8cDywCS7HinSVM/13IgdyPsF03k8bWazDP6X67u2WY+/0NmYvQCo8G7BHVjvf6RpPRIA+hNhUF4FOSUAYdrGiC2xRuLvBP7u1m//LbIRe2At5SmvvBnEfFcZhpc++95iNC3Jr4TOLRnVzN3PGRPysLVcSYJj8b2tI65qPM28Xzv4DuY0ozXFg9JniJ2FbKHcgCycmPYjba9G9bkaGC5f3bX1l72rXTkZFCW7zrkoFSTf0FE+b7d1XuvmKdJkotAjDGhC42p+bh1/MciFU50fOvcrhrAvYUN9UxJfjVbDp6Pd5NRnwj2KzaKtCVO06kZKeiaaYsYUmNYXxdkyuRQzQJgL/zCG4zbQsOp71mbiH7Fqa0co7l00MQ4/UXk6G2XkPA/6IfcQEmi72BKaVyYrt2iH9aOyz051WnZFowl4ZlrbZinqP3BfHJXiVIQ5J/bIwe2wI6T1efF8C+RocNgQUaRo+ysY9V3qP1+tefyqT/bLtpjJyggiH7i0SEdGeKY+/l50kfqjmi9JrLwH1wyrnGyKOR+on49Ra80BgfGCtJd2SVNsA3ENXhlSAtQBC2OeqXkytRsotkx6YA1/6Di0WRtqT513vw1vej6TXgmCUH5TCDGDt7rg90p7Ra/bs7FzJFS6ifxhhZZkHixzwgvKJ7E+DD0PMG19hpvUTvg5Igp5A81vPk7ssdM/hVrciTPSQr975j2dk5A5kSPjMd+Yt/pDr0DYCSTchGawVH7uLNsc+kihMe+ORiJiklQcvdxp06gSCCctZsqrcXL4DHFT0cRGSJKflZfi8rdqtY2Bd5aefEinVUIziFgfkAaoTdEAnK2nqMCphn5KvtEJSKZ1xtzfttpGL9Vd0l5z4NH8D0r6d8vwv6pc7b9zB8DSGQtEEIiiMG3e4EfSRJDRcqtLGuQpsY/1igNq4Q0/+RCXpNcYjj04b1/25pyNrv24tctdDKETsquRoGTPuwR3AvP63PgRF2yVTxoRRttbDHkNHuU0wBJGv+q1tmyLqdXm2P+ZL9Aqzu02bZaRj5xloHxFyce60xpBNThyNPmk7rn2eoZP2IJ4J2qrsVynBPTUJJZis+3UmNyxDgmlnjIFmBEUM4eljJkrIHPH5DDyDBrZuyQ80UY73mByAW485xVMBoLsc0x/iCUdjEVtafga2Czeh/uT1w6jMBpmZ9TPcxTObdGo22EUt3WEWlGic8ED9ofQpggrPNYnKHcDX6ExCzcnqdTF/uZzTY6Ultumd6T+66ctjLxWcUwQrjcHk8LqUmQzl3ri1m8XUwA7JyWu0yUnSiFiIY6HR0cjNkuMb9HDgM/Dio+6qPxHywwZCj/S8gTKInxEFPllAtMel/8UXjgjH2+mUhNLaxZv5J7Q2fx1eIWD5KCaoec0vrKDSCYrKhDZTaXUBtcH3THYWUtZc7SdZ2HBx4IjPzNcfP9Yg/tbzz05r3YwmgOwtXcS/youyu6KqYi9H9cZL3DTqQRIsHIMvZUQVuAxm+W8rVrIaSf1BdBblGKSkadxZ+2AHfVevDeQCdVQ+4vttm4apcpsGlRojNwgdJmhgcucx0/9ZDSTSGFXrYZPFikNmdSTmBm1kKkv8k+eiTcSvAnASxcUmtQn11G5eXaSUcLzsebOBTxThDSPUPj2lyXcTBD/LoWNSrRpDuhnzJrYTt1ZTGaqLGHkqA3jmBR9xmgUIuUYoixH64mchr20QxtLisNXC5+a/Ip1VHZpfugKMTRk38J7CgzUECjARxUcWVWTaz3Bu7SI4h3ILCj0EPyqU7cpI9Sq60EtMv0g3m8TUzwJ/FEBd9Im30jnPLVXKyOSRQNpJqDzPVrPw2HuslqWMbczTH7kVvB7MVHS3jrJ0cBj2oMM89DFcVstDMcNe09+Ii+Jm4b78pno4GfOAX3+ildT0U4T/UQL6RiTbrN8Fma53Eq5s23mDLNQnfk8oaL3hc6qAyA5JyBkyvBcO9OMVZtL2Lt1SnU4XzUdnnAAAAAAA",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460689",
            "RESPONSE_CODE": "00",
            "SG_REFERENCE_FOLIO": "260610436644",
            "CARD_TYPE": "1",
            "MNEMO_NAME": "RC",
            "TERMINAL_ID": "caja07",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "PREFERRED_NAME": "VISA CREDITO",
            "RESPONSE_MESSAGE": "Aprobada",
            "SIGNATURE_FLAG": "1",
            "TXN_NAME": "VENTA EN LINEA",
            "TAG_9F12": "VISA CREDITO",
            "CARD_NAME": "RAPIDCARD",
            "TRANSACTION_TYPE": "1",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "VISA",
            "TXN_DATE": "260302",
            "TIP": "8185",
            "BANK_NAME": "VISA",
            "MERCHANT_ID": "12345678"
          },
          {
            "RESPONSE_CODE": "00",
            "POS_ID": "caja07",
            "TAG_9B": "0000",
            "TAG_9F26": "2C38BD9791022ED6",
            "TXN_UNIQUE_REF": "frq02032026132259864",
            "SG_REFERENCE_FOLIO": "260610436457",
            "CARD_TYPE": "0",
            "MNEMO_NAME": "SV",
            "TERMINAL_ID": "caja07",
            "APP_LABEL": "Debit Mastercard",
            "TAG_50": "Debit Mastercard",
            "TAG_95": "0000008001",
            "CURRENCY_CODE": "484",
            "HEADER_1": "SMART PAYMENT SERVICES",
            "BILLABLE": "true",
            "AMOUNT": "25496",
            "PAYMENT_PLAN_OPTION": "0",
            "SUGGEST_QUERY_TXN": "false",
            "PREFERRED_NAME": "Debit Mastercard",
            "RESPONSE_MESSAGE": "Aprobada",
            "APP_VERSION: ": "2.1.0.0.7",
            "ACCOUNT_NUMBER": "510125******8695",
            "AID": "A0000000041010",
            "SIGNATURE_FLAG": "2",
            "ARQC": "2C38BD9791022ED6",
            "TXN_NAME": "VENTA EN LINEA",
            "SERVICE_NAME": "Banco_P",
            "TXN_TIME": "132300",
            "TAG_9F12": "Debit Mastercard",
            "TXN_APPROVAL_CODE": "SBT754",
            "TAG_9F34": "1F0302",
            "CARD_NAME": "SI VALE",
            "HEADER_2": "Insurgentes #1581",
            "STATUS_FLAG_TXN": "2",
            "HEADER_3": "Col. San Jose Insurgentes",
            "TRANSACTION_TYPE": "1",
            "HEADER_4": "C.P. 03900 CDMX",
            "TSN": "132309",
            "EXPIRATION_DATE": "3208",
            "ENTRY_MODE": "07",
            "BRAND_NAME": "MASTERCARD",
            "TAG_5F2A": "0484",
            "TXN_DATE": "260302",
            "controles": "{\"data\":[]}",
            "SG_REFERENCE": "000038460687",
            "TIP": "3824",
            "BANK_NAME": "SI VALE",
            "MERCHANT_ID": "12345678"
          },
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
            "RESPONSE_MESSAGE": "Reembolso",
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
            "RESPONSE_MESSAGE": "Declinada",
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
