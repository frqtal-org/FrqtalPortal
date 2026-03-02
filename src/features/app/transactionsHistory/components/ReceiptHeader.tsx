import {sizeToDp} from '../../../../core/utils/sizeToDP.tsx';
import {APP_PADDING} from '../../../../core/utils/insets.tsx';
import FastImage from 'react-native-fast-image';
import {View, StyleSheet} from 'react-native';
import {Typography} from '../../../../core/components/Typography.tsx';
import {
  formatPercentageFromPrice,
  formatPriceFromDigits,
} from '../../../../core/utils/priceFormater.ts';
import React from 'react';

export const ReceiptHeader = ({
  statusIcon,
  title,
  price,
  receiptId,
}: {
  statusIcon: any;
  title: string;
  price: string;
  receiptId: string;
}) => {
  return (
    <View style={[STYLES.contentWrapper]}>
      <FastImage
        source={statusIcon}
        style={[STYLES.statusIcon]}
        resizeMode={FastImage.resizeMode.contain}
      />
      <View style={[STYLES.titleContainer]}>
        <Typography style={[{ textAlign: 'center' }]} variant="title01Bold">{title}</Typography>
        <Typography variant="subtitle01Bold">
          ${formatPriceFromDigits(price)} MXN
        </Typography>
      </View>
      <Typography variant="text02Medium" color={'textEleventh'}>
        {receiptId}
      </Typography>
    </View>
  );
};

const STYLES = StyleSheet.create({
  contentWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    width: sizeToDp(APP_PADDING * 5.8),
    aspectRatio: 1,
  },
  titleContainer: {
    marginTop: sizeToDp(APP_PADDING * 1.2),
    marginBottom: sizeToDp(APP_PADDING * 0.8),
    alignItems: 'center',
  },
});
