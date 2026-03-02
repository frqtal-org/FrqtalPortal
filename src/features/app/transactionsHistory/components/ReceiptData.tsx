import {sizeToDp} from '../../../../core/utils/sizeToDP.tsx';
import {APP_PADDING} from '../../../../core/utils/insets.tsx';
import {StyleSheet, View} from 'react-native';
import {Typography} from '../../../../core/components/Typography.tsx';
import {
  formatPercentageFromPrice,
  formatPriceFromDigits,
} from '../../../../core/utils/priceFormater.ts';
import React, {memo} from 'react';

export const ReceiptData = memo(
  ({
    transactionDate,
    cardLastNumbers,
    price,
  }: {
    transactionDate: string;
    cardLastNumbers: string;
    price: string;
  }) => {
    return (
      <View style={[STYLES.componentWrapper]}>
        <View style={[STYLES.fieldTextContainer]}>
          <Typography color='textEleventh' variant="text02">Fecha:</Typography>
          <Typography variant="text02Medium">{transactionDate}</Typography>
        </View>
        <View style={[STYLES.fieldTextContainer]}>
          <Typography color='textEleventh' variant="text02">Tarjeta:</Typography>
          <Typography variant="text02Medium">{cardLastNumbers}</Typography>
        </View>
        <View style={[STYLES.fieldTextContainer]}>
          <Typography color='textEleventh' variant="text02">Total pagado:</Typography>
          <Typography variant="text02Medium">
            ${formatPriceFromDigits(price)} MXN
          </Typography>
        </View>
      </View>
    );
  },
);

const STYLES = StyleSheet.create({
  componentWrapper: {
    marginTop: sizeToDp(APP_PADDING * 0),
    rowGap: sizeToDp(APP_PADDING * 0.5),
  },
  fieldTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
