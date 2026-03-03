import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { sizeToDp } from '../../../../core/utils/sizeToDP.tsx';
import { Typography } from '../../../../core/components/Typography.tsx';
import React, { memo } from 'react';
import FastImage from 'react-native-fast-image';
import { APP_PADDING } from '../../../../core/utils/constants.ts';
import theme from '../../../../core/utils/styles/styles.ts';
import { calculateExtraAmount, formatPercentageFromPrice, formatPriceFromDigits } from '../../../../core/utils/priceFormater.ts';
import HeaderGradient from '../../../../core/utils/styles/backgroundGradients/HeaderGradient.tsx';

const SubDataContainer = memo(
  ({ title, data, color }: { title: string; data: string; color?: any }) => {
    return (
      <View style={[STYLES.subDataContainer]}>
        <Typography variant="subtitle02Regular" color="textEleventh">
          {title}
        </Typography>
        <Typography variant="subtitle01SemiBold" color={color}>
          {data}
        </Typography>
      </View>
    );
  },
);

export const PaymentAmountHeader = ({
  price,
  extra,
  handleSetExtra,
  handleClear,
}: {
  price: string;
  extra: string;
  handleSetExtra: (extra: string) => void;
  handleClear: () => void;
}) => {
  return (
    <View style={[{ flex: 0.8 }]} >
      <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }]} >
        <View style={[STYLES.priceContainer]}>
          <Typography style={[{ textAlign: 'center', includeFontPadding: false }]} variant="megatitle02Bold">
            ${formatPriceFromDigits(price)} MXN
          </Typography>
          {extra !== '' && <Typography style={[{ textAlign: 'center', includeFontPadding: false }]} color='notificationGreen' variant="subtitle01Medium">
            +${calculateExtraAmount(formatPriceFromDigits(price), extra)} MXN
          </Typography>}
        </View>

      </View>

      <View style={[STYLES.subDataWrapper]}>
        {price !== '' && <View style={[{ position: 'absolute', bottom: '100%', right: 0, marginBottom: sizeToDp(APP_PADDING * 0.3),zIndex: 999  }]} >
          <Pressable onPress={handleClear} hitSlop={{ top: sizeToDp(APP_PADDING * 3), left: sizeToDp(APP_PADDING * 3), bottom: sizeToDp(APP_PADDING * 2) }} >
            <FastImage
              source={require('../../../../core/assets/images/clearRed.png')}
              style={[{ width: sizeToDp(APP_PADDING * 1.8), aspectRatio: 1 }]}
              resizeMode='contain'
            />
          </Pressable>
        </View>}
        <SubDataContainer
          title={'Extra:'}
          data={extra !== '' ? extra : '0%'}
          color={extra !== '' ? 'notificationGreen' : 'textEleventh'}
        />
        <SubDataContainer
          title={'Total a pagar:'}
          data={`$${formatPercentageFromPrice(formatPriceFromDigits(price), extra)} MXN`}
        />
      </View>

      <View style={[STYLES.extrasContainer]}>
        <FlatList
          horizontal
          scrollEnabled={false}
          data={['+5%', '+10%', '+15%']}
          contentContainerStyle={[STYLES.extrasList]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Pressable
              hitSlop={{ top: sizeToDp(APP_PADDING * 2), bottom: sizeToDp(APP_PADDING * 0.5) }}
              onPress={() => { item === extra ? handleSetExtra('') : handleSetExtra(item) }}
              style={[
                STYLES.extraSelectorContainer,
                extra === item && STYLES.activeExtraSelectorContainer,
                extra !== item && STYLES.inactiveExtraSelectorContainer,
              ]}
            >
              <Typography style={[{ includeFontPadding: false }]} color={item === extra ? 'notificationGreen' : 'textEleventh'} variant="text01Medium">{item}</Typography>
              <View
                style={[
                  item === extra
                    ? STYLES.activeExtraDotSelectorContainer
                    : STYLES.inactiveExtraDotSelectorContainer,
                  STYLES.extraDotSelectorContainer,
                ]}
              />
            </Pressable>
          )}
        />

        {extra !== '' && (
          <Pressable
            style={[STYLES.deleteExtraButtonContainer]}
            hitSlop={{
              right: sizeToDp(APP_PADDING),
              top: sizeToDp(APP_PADDING * 2),
              bottom: sizeToDp(APP_PADDING * 0.5),
              left: sizeToDp(APP_PADDING * 2),
            }}
            onPress={() => {
              handleSetExtra('');
            }}>
            <FastImage
              source={require('../../../../core/assets/images/close2.webp')}
              style={[STYLES.deleteExtraButtonIcon]}
              resizeMode={FastImage.resizeMode.contain}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const STYLES = StyleSheet.create({
  subDataWrapper: {
    marginHorizontal: sizeToDp(APP_PADDING * 1),
    rowGap: sizeToDp(APP_PADDING * 0.3)
  },
  subDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sizeToDp(APP_PADDING),
    rowGap: sizeToDp(APP_PADDING * 0.3)
  },
  extrasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: sizeToDp(APP_PADDING * 1.2),
  },
  extrasList: {
    columnGap: sizeToDp(APP_PADDING * 0.5),
    paddingHorizontal: sizeToDp(APP_PADDING * 0.8),
    paddingTop: sizeToDp(APP_PADDING * 0.5),
    paddingBottom: sizeToDp(APP_PADDING * 0.7),
  },
  extraSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: sizeToDp(APP_PADDING * 0.5),
    paddingHorizontal: sizeToDp(APP_PADDING * 0.8),
    paddingVertical: sizeToDp(APP_PADDING * 0.4),
    borderWidth: sizeToDp(1),
    borderRadius: 999,
  },
  inactiveExtraSelectorContainer: {
    backgroundColor: theme.colors.brand400 + '22',
    borderColor: theme.colors.brand400 + 'aa',
  },
  activeExtraSelectorContainer: {
    backgroundColor: theme.colors.brand300 + '22',
    borderColor: theme.colors.brand300 + 'aa',
  },
  extraDotSelectorContainer: {
    borderColor: theme.colors.brand200,
    borderWidth: sizeToDp(1),
    width: sizeToDp(APP_PADDING * 0.8),
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
  },
  deleteExtraButtonIcon: {
    width: sizeToDp(APP_PADDING * 1.7),
    aspectRatio: 1,
  },
});
