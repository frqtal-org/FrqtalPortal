import { BackHandler, StyleSheet, View } from 'react-native';
import React, { memo, useContext, useEffect } from 'react';
import FastImage from 'react-native-fast-image';
import { sizeToDp } from '../../utils/sizeToDP.tsx';
import { Typography } from '../Typography.tsx';
import { BackButton } from '../buttons/BackButton.tsx';
import { APP_PADDING } from '../../utils/constants.ts';
import { InsetsContext } from '../../utils/styles/insets.tsx';

const GeneralHeader = memo(
  ({
    titleText,
    onBack,
    rightImage,
    rightImageSize,
    rightComponent,
    noBackButton,
    noTopInset,
    subText,
    isTransactionLoading,
    noGoBack = false,
  }: {
    titleText?: string;
    onBack?: () => void;
    rightImage?: any;
    rightImageSize?: number;
    rightComponent?: React.ReactNode;
    noBackButton?: boolean;
    noTopInset?: boolean;
    noGoBack?: boolean;
    isTransactionLoading?: boolean;
    subText?: string;
  }) => {
    /*  */
    const INSETS = useContext(InsetsContext);
    /*  */
    const HEADER_HEIGHT = INSETS.top + sizeToDp(APP_PADDING * 3);

    /* ------- Effects ------- */
    useEffect(() => {
      const onBackPress = () => {
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      if (!isTransactionLoading) {
        subscription.remove();
      }

      return () => subscription.remove();
    }, [isTransactionLoading]);
    /* ------- END Effects ------- */

    return (
      <View
        style={[
          STYLES.animatedWrapper,
          { height: HEADER_HEIGHT },
          STYLES.headerGradientContainer,
        ]}>
        {/*<HeaderGradient />*/}
        <View style={[STYLES.headerContainer, !noTopInset && { marginTop: INSETS.top }]}>
          {!noBackButton ? (
            <BackButton
              noGoBack={isTransactionLoading || noGoBack}
              onBack={onBack || (() => { })}
            />
          ) : (
            <View pointerEvents="none" style={[{ opacity: 0 }]}>
              <BackButton
                noGoBack={isTransactionLoading}
                onBack={onBack || (() => { })}
              />
            </View>
          )}

          {titleText && (
            <View style={[STYLES.titleContainer]}>
              <Typography variant="text01Bold">{titleText}</Typography>
              {subText && (
                <Typography variant="text03Regular" color="textEleventh">
                  {subText}
                </Typography>
              )}
            </View>
          )}

          {rightImage && (
            <FastImage
              source={rightImage}
              resizeMode="contain"
              style={[STYLES.rightImage, { width: rightImageSize }]}
            />
          )}
          {rightComponent && !rightImage && rightComponent}
        </View>
      </View>
    );
  },
);

export default GeneralHeader;

const STYLES = StyleSheet.create({
  animatedWrapper: {
    width: '100%',
    zIndex: +9999,
  },
  headerContainer: {
    paddingHorizontal: sizeToDp(APP_PADDING),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGradientContainer: {
    /*borderBottomWidth: sizeToDp(1),
    borderColor: theme.colors.glassPrimary,*/
    marginBottom: sizeToDp(APP_PADDING * 0.3),
  },
  titleContainer: {
    width: '100%',
    position: 'absolute',
    alignItems: 'center',
    right: sizeToDp(APP_PADDING)
  },
  rightImage: {
    aspectRatio: 1,
  },
});
