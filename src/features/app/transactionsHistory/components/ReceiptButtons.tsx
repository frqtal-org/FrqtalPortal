import {sizeToDp} from '../../../../core/utils/sizeToDP.tsx';
import {APP_PADDING} from '../../../../core/utils/insets.tsx';
import {View, StyleSheet} from 'react-native';
import GradientButton from '../../../../core/components/buttons/GradientButton.tsx';
import React, {memo} from 'react';

export const ReceiptButtons = memo(
  ({
    miniButtonText,
    miniButtonImage,
    secondaryButtonImage,
    miniButtonAction,
    secondaryButtonAction,
    primaryButtonAction,
    secondaryButtonText,
    primaryButtonText,
    hideMiniButton = false,
    hideSecondaryButton = false,
    hidePrimaryButton = false,
    fullMiniButton = false,
  }: {
    hideMiniButton?: boolean;
    hideSecondaryButton?: boolean;
    hidePrimaryButton?: boolean;
    fullMiniButton?: boolean;
    primaryButtonText: string;
    secondaryButtonText: string;
    miniButtonImage?: string;
    secondaryButtonImage?: string;
    miniButtonText: string;
    miniButtonAction: () => void;
    secondaryButtonAction: () => void;
    primaryButtonAction: () => void;
  }) => {
    return (
      <View style={[STYLES.componentWrapper]}>
        <View style={[STYLES.componentContainer]}>
          {!hideMiniButton && (
            <GradientButton
            title={miniButtonText}
            onPress={miniButtonAction}
            variant="secondary"
              /* borderType='mid-rounded' */
              size='small'
              icon={miniButtonImage}
              style={[{ flexGrow: 0 }, fullMiniButton && STYLES.medButton]}
            />
          )}
          {!hideSecondaryButton && (
            <GradientButton
            /* borderType='mid-rounded' */
              title={secondaryButtonText}
              onPress={secondaryButtonAction}
              icon={secondaryButtonImage}
              variant="secondary"
              size='small'
              style={[STYLES.fullButton, fullMiniButton && STYLES.medButton]}
            />
          )}
        </View>
        {!hidePrimaryButton && <GradientButton
          title={primaryButtonText}
          onPress={primaryButtonAction}
        />}
      </View>
    );
  },
);

const STYLES = StyleSheet.create({
  componentWrapper: {
    rowGap: sizeToDp(APP_PADDING * 0.5),
  },
  componentContainer: {
    flexDirection: 'row',
    width: '100%',
    columnGap: sizeToDp(APP_PADDING * 0.5),
  },
    fullButton: {
        flexGrow: 1,
    },
    medButton: {
      flexGrow: 1,
    }
});
