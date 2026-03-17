import React, { useContext } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { sizeToDp } from '../../../../core/utils/sizeToDP.tsx';
import { Typography } from '../../../../core/components/Typography.tsx';
import { formatPriceFromDigits } from '../../../../core/utils/priceFormater.ts';
import { APP_PADDING } from '../../../../core/utils/constants.ts';
import theme from '../../../../core/utils/styles/styles.ts';
import { transactionDate } from '../../../../core/utils/transactionDate.ts';
import { BottomSheetsContext } from '../../../../core/components/bottomSheets/context.tsx';
import { toTitleCase } from '../../../../core/utils/titleCase.ts';
import { getExtraPercentage } from '../../../../core/utils/getExtraPercentage.ts';
import { printTicketAUX } from '../../../../core/utils/printTicket.ts';
import { AppNavigationContext } from '../../appNavigation/context.tsx';

const statusToImageMap: Record<string, any> = {
  cancel: require('../../../../core/assets/images/error.webp'),
  transaction: require('../../../../core/assets/images/accepted.webp'),
};

const statusText: Record<string, any> = {
  cancel: 'Reembolso',
  transaction: 'Aprobada',
};


const Transaction = ({ onBack, onVerify, ...item }: any) => {
  const { transactionBottomSheetRef, setTransactionSelected } = useContext(BottomSheetsContext)
  const { isLoadingSV, setLoadingText } = useContext(AppNavigationContext)

  const {
    ACCOUNT_NUMBER,
    AMOUNT,
    TXN_TIME,
    TXN_DATE,
    BRAND_NAME,
    TIP,
    SG_REFERENCE,
  } = item.data_raw;

  function handleViewTransaction() {
    onVerify(async () => {
      setTransactionSelected(item)
      transactionBottomSheetRef.current.expand()
    })
  }

  function handlePrintTicket() {
    onVerify(async () => {
      try {
        isLoadingSV.set(true)
        setLoadingText('Imprimiendo ticket')

        await printTicketAUX(item?.data_raw)
          .then(() => {
            setLoadingText('')
            isLoadingSV.set(false)
          })
          .catch((err) => {
            console.error('err printing')
            console.error(err)
            isLoadingSV.set(true)
            setLoadingText(err.message)
            setTimeout(() => {
              setLoadingText('')
              isLoadingSV.set(false)
            }, 3000)
          })

      } catch (err) {
        console.error(err)
      }
    })
  }

  return (
    <View style={[STYLES.componentWrapper]}>
      <Pressable
        style={[STYLES.itemListWrapper]}
        onPress={handleViewTransaction}
        onLongPress={handlePrintTicket}
      >
        <View style={[STYLES.itemListContainer]}>
          <FastImage
            source={statusToImageMap[item.event_name]}
            style={[STYLES.itemImage]}
            resizeMode="contain"
          />

          <View>
            <View style={[STYLES.itemTitleContainer]}>
              <Typography variant="subtitle02SemiBold" numberOfLines={1}>
                {statusText[item.event_name]}
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
              {(TIP && TIP !== '0') && <Typography
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
};

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
