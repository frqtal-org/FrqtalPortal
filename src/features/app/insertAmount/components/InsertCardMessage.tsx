import {Pressable, View, StyleSheet, TextInput} from 'react-native';
import {sizeToDp} from '../../../../core/utils/sizeToDP.tsx';
import {APP_PADDING, InsetsContext} from '../../../../core/utils/insets.tsx';
import FastImage from 'react-native-fast-image';
import {Typography} from '../../../../core/components/Typography.tsx';
import {
  formatPercentageFromPrice,
  formatPriceFromDigits,
} from '../../../../core/utils/priceFormater.ts';
import React, {memo, useContext} from 'react';
import GeneralGradient from '../../../../core/components/backgroundGradients/GeneralGradient.tsx';

export const InsertCardMessage = memo(
  ({
    price,
    extra,
    triggerCardAction,
  }: {
    price: string;
    extra: string;
    triggerCardAction: () => void;
  }) => {
    const INSETS = useContext(InsetsContext);
    return (
      <>
        <GeneralGradient />
        <Pressable
          onPress={() => triggerCardAction()}
          style={[
            STYLES.wrapper,
            {
              paddingTop:
                INSETS.top + sizeToDp(APP_PADDING * 3 + APP_PADDING * 0.7),
              paddingBottom: INSETS.bottom + sizeToDp(APP_PADDING * 1.3),
            },
          ]}>
          <FastImage
            source={require('../../../../core/assets/images/contactless.webp')}
            style={[STYLES.nfcImage]}
            resizeMode={FastImage.resizeMode.contain}
          />
          <View
            style={[STYLES.centerTextContainer]}>
            <View>
              <Typography color='notificationYellow' style={[{textAlign: 'center'}]} variant="subtitle01Bold">
                Inserte o acerque la
              </Typography>
              <Typography color='notificationYellow' style={[{textAlign: 'center'}]} variant="subtitle01Bold">
                 tarjeta para pagar:
              </Typography>
            </View>
            <Typography style={[{textAlign: 'center'}]} variant="title01Bold">
              ${formatPercentageFromPrice(formatPriceFromDigits(price), extra)}{' '}
              MXN
            </Typography>
          </View>
          <FastImage
            source={require('../../../../core/assets/images/insertCardNew.webp')}
            style={[STYLES.insertCardImage]}
            resizeMode={FastImage.resizeMode.contain}
          />
        </Pressable>
      </>
    );
  },
);

const STYLES = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    rowGap: sizeToDp(APP_PADDING * 2.7),
    height: '100%',
    justifyContent: 'space-between',
  },
  nfcImage: {
    width: '44%',
    aspectRatio: 1.2,
    opacity: 1,
  },
  insertCardImage: {
    width: '42%',
    aspectRatio: 1.2,
    opacity: 0.8,
  },
  centerTextContainer: {
    marginBottom: sizeToDp(APP_PADDING * 2.8),
    rowGap: sizeToDp(APP_PADDING * 0.7),
  }
});
