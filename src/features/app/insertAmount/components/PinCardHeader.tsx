import {View, StyleSheet} from 'react-native';
import {sizeToDp} from '../../../../core/utils/sizeToDP.tsx';
import {APP_PADDING} from '../../../../core/utils/insets.tsx';
import theme from '../../../../core/utils/theme/theme.ts';
import {Typography} from '../../../../core/components/Typography.tsx';

import React, {memo} from 'react';
import {formatPercentageFromPrice , formatPriceFromDigits} from "../../../../core/utils/priceFormater.ts";

const PinCodeIndicator = memo(({isActive}: {isActive: boolean}) => {
  return (
    <View
      style={[
        STYLES.pinCode,
        isActive
          ? STYLES.pinIndicatorActive
          : STYLES.pinIndicatorInactive,
      ]}
    />
  );
});
const SubDataContainer = memo(({ title, data, color }: { title: string; data: string; color?: any }) => {
  return (
      <View
          style={[STYLES.subDataContainer]}>
        <Typography variant="text02Medium" color="textEleventh">
          {title}
        </Typography>
        <Typography variant="text01Bold" color={color}>
          {data}
        </Typography>
      </View>
  );
});

export const PinCardHeader = memo(
  ({
    pinCode,
    price,
    extra,
  }: {
    pinCode: string;
    price: string;
    extra: string;
  }) => {
    return (
      <>
        <View style={[STYLES.pinCodeContainer]}>
          <PinCodeIndicator isActive={pinCode.length >= 1} />
          <PinCodeIndicator isActive={pinCode.length >= 2} />
          <PinCodeIndicator isActive={pinCode.length >= 3} />
          <PinCodeIndicator isActive={pinCode.length >= 4} />
        </View>

        <View
          pointerEvents="none"
          style={[STYLES.subDataWrapper]}>
          <SubDataContainer title={'Total a pagar:'} data={`$${formatPercentageFromPrice(formatPriceFromDigits(price), extra)} MXN`} />
          <SubDataContainer title={'Subtotal:'} data={`$${formatPriceFromDigits(price)} MXN`} />
          <SubDataContainer title={'Extra:'} data={extra !== '' ? extra : '0%'} color={extra !== '' ? 'notificationGreen' : 'textPrimary'} />
        </View>
      </>
    );
  },
);

const STYLES = StyleSheet.create({
  pinCodeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: sizeToDp(APP_PADDING * 0.5),
    paddingHorizontal: sizeToDp(APP_PADDING),
    flexDirection: 'row',
    columnGap: sizeToDp(APP_PADDING * 2.8),
  },
  pinCode: {
    width: sizeToDp(APP_PADDING * 1.5),
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: sizeToDp(1),
    borderColor: theme.colors.brand200,
  },
  pinIndicatorInactive: {
    backgroundColor: theme.colors.brand200 + '44'
  },
  pinIndicatorActive: {
    backgroundColor: theme.colors.brand200
  },
  subDataWrapper: {
    marginHorizontal: sizeToDp(APP_PADDING * 1.2),
    rowGap: sizeToDp(APP_PADDING * 0.7),
    marginBottom: sizeToDp(APP_PADDING * 0.5),
  },
  subDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
});
