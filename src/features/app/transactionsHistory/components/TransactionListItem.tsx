import React, { memo, useContext } from 'react';
import { NativeModules, Pressable, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { sizeToDp } from '../../../../core/utils/sizeToDP.tsx';
import { Typography } from '../../../../core/components/Typography.tsx';
import {
  formatPriceFromDigits,
} from '../../../../core/utils/priceFormater.ts';
import { APP_PADDING } from '../../../../core/utils/constants.ts';
import theme from '../../../../core/utils/styles/styles.ts';
import { transactionDate } from '../../../../core/utils/transactionDate.ts';
import { BottomSheetsContext } from '../../../../core/components/bottomSheets/context.tsx';
import { toTitleCase } from '../../../../core/utils/titleCase.ts';
import { mmkvStorage } from '../../../../core/store/principalStore.ts';
import { getExtraPercentage } from '../../../../core/utils/getExtraPercentage.ts';
/* import { formatDate } from '../../../../core/utils/formatDate.ts'; */
/* import { capitalizarPalabrasEnString } from '../../../../core/utils/capitalizarPalabrasEnString.ts'; */
/* import { parseFechaStringToDate } from '../../../../core/utils/parseFechaStringToDate.ts'; */

const statusToImageMap: Record<string, any> = {
  Declinada: require('../../../../core/assets/images/error.webp'),
  Reembolso: require('../../../../core/assets/images/error.webp'),
  Pendiente: require('../../../../core/assets/images/pending.webp'),
  Aprobada: require('../../../../core/assets/images/accepted.webp'),
};

const { SmartWrapperModule } = NativeModules;

const Transaction = memo(({ onBack, ...item }: any) => {
  const { transactionBottomSheetRef, setTransactionSelected } = useContext(BottomSheetsContext)

  const {
    RESPONSE_MESSAGE,
    ACCOUNT_NUMBER,
    AMOUNT,
    TXN_TIME,
    TXN_DATE,
    BRAND_NAME,
    TIP,
    SG_REFERENCE,
  } = item;

  function handleViewTransaction() {
    setTransactionSelected(item)
    transactionBottomSheetRef.current.expand()
  }

  async function printTicket() {
    await SmartWrapperModule.reprintTicket(SG_REFERENCE);
  }

  return (
    <View style={[STYLES.componentWrapper]}>
      <Pressable
        style={[STYLES.itemListWrapper]}
        onPress={handleViewTransaction}
        onLongPress={printTicket}
      >
        <View style={[STYLES.itemListContainer]}>
          <FastImage
            source={statusToImageMap[RESPONSE_MESSAGE]}
            style={[STYLES.itemImage]}
            resizeMode="contain"
          />

          <View>
            <View style={[STYLES.itemTitleContainer]}>
              <Typography variant="subtitle02SemiBold" numberOfLines={1}>
                {RESPONSE_MESSAGE}
              </Typography>
            </View>
            <Typography
              variant="text02Regular"
              color="textEleventh"
              style={[STYLES.dateContainer]}>
              {transactionDate(TXN_DATE, TXN_TIME)}
            </Typography>
          </View>
        </View>

        <View style={[STYLES.itemRightContainer]}>
          <View style={[STYLES.itemPriceContainer]}>
            <View style={[{ flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.2) }]} >
              {TIP && <Typography
                numberOfLines={1}
                ellipsizeMode="middle"
                variant="text02Regular"
                color='notificationGreen'
              >
                +{getExtraPercentage({ montoBase: AMOUNT, montoExtra: TIP })}
              </Typography>}
              <Typography
                numberOfLines={1}
                ellipsizeMode="middle"
                variant="subtitle02Medium">
                ${formatPriceFromDigits(AMOUNT)}
              </Typography>
            </View>
          </View>

          <Typography
            variant="text03Regular"
            color={'textEleventh'}>
            **** {ACCOUNT_NUMBER.slice(-4)} / {toTitleCase(BRAND_NAME)}
          </Typography>
        </View>
      </Pressable>
    </View>
  );
});

export default Transaction;

const STYLES = StyleSheet.create({
  componentWrapper: {
    borderTopWidth: sizeToDp(1),
    borderColor: theme.colors.brand600,
    flex: 1,
    columnGap: sizeToDp(APP_PADDING / 2.2),
  },
  itemListWrapper: {
    paddingVertical: sizeToDp(APP_PADDING),
    marginHorizontal: sizeToDp(APP_PADDING * 1.2),
    justifyContent: 'space-between',
    flexDirection: 'row',
    flex: 1,
  },
  itemListContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: sizeToDp(APP_PADDING * 0.8),
  },
  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: sizeToDp(APP_PADDING / 2.2),
  },
  dateContainer: {
    marginRight: sizeToDp(APP_PADDING / 2.2),
  },
  itemRightContainer: {
    flex: 0.8,
    alignItems: 'flex-end',
    columnGap: sizeToDp(APP_PADDING * 0.8),
    justifyContent: 'center',
  },
  itemPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  itemImage: {
    width: sizeToDp(APP_PADDING * 1.22),
    height: sizeToDp(APP_PADDING * 1.22),
  },
});
