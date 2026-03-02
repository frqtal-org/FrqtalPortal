import {View, StyleSheet } from 'react-native';
import {sizeToDp} from '../../../../core/utils/sizeToDP.tsx';
import {APP_PADDING} from '../../../../core/utils/insets.tsx';
import theme from '../../../../core/utils/theme/theme.ts';
import {Typography} from '../../../../core/components/Typography.tsx';
import React, {memo} from 'react';
import {formatPhoneFromDigits} from "../../../../core/utils/formatPhoneNumber.ts";

export const PhoneNumberHeader = memo(
  ({
    phoneNumber,
  }: {
    phoneNumber: string;
  }) => {
    return (
      <>
        <View style={[STYLES.priceContainer]}>
          <Typography style={[{textAlign: 'center'}]} variant="title01Bold">
            Tel: {formatPhoneFromDigits(phoneNumber)}
          </Typography>
        </View>
      </>
    );
  },
);

const STYLES = StyleSheet.create({
  subDataWrapper: {
    marginHorizontal: sizeToDp(APP_PADDING * 1.2),
    rowGap: sizeToDp(APP_PADDING * 0.7),
    marginBottom: sizeToDp(APP_PADDING * 0.5),
  },
  subDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: sizeToDp(APP_PADDING * 0.5),
    paddingHorizontal: sizeToDp(APP_PADDING),
  },
  extrasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: sizeToDp(APP_PADDING * 1.2),
    marginTop: -sizeToDp(APP_PADDING * 2),
  },
  extrasList: {
    columnGap: sizeToDp(APP_PADDING * 0.7),
    paddingHorizontal: sizeToDp(APP_PADDING),
    paddingTop: sizeToDp(APP_PADDING * 2.7),
    paddingBottom: sizeToDp(APP_PADDING * 0.5),
  },
  extraSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: sizeToDp(APP_PADDING * 0.5),
    paddingHorizontal: sizeToDp(APP_PADDING * 0.7),
    paddingVertical: sizeToDp(APP_PADDING * 0.3),
    borderWidth: sizeToDp(1),
    borderRadius: 999,
  },
  inactiveExtraSelectorContainer: {
    backgroundColor: theme.colors.brand400 + '22',
    borderColor: theme.colors.brand400 + '88',
  },
  activeExtraSelectorContainer: {
    backgroundColor: theme.colors.brand300 + '22',
    borderColor: theme.colors.brand300 + '88',
  },
  extraDotSelectorContainer: {
    borderColor: theme.colors.brand200,
    borderWidth: sizeToDp(1),
    width: sizeToDp(APP_PADDING * 0.7),
    aspectRatio: 1,
    borderRadius: 999,
  },
  inactiveExtraDotSelectorContainer: {
    backgroundColor: theme.colors.brand200 + '44',
  },
  activeExtraDotSelectorContainer: {
    backgroundColor: theme.colors.brand200,
  },
  deleteExtraButtonContainer: {
    marginTop: sizeToDp(APP_PADDING * 2),
  },
  deleteExtraButtonIcon: {
    width: sizeToDp(APP_PADDING * 1.7),
    aspectRatio: 1,
  },
});
