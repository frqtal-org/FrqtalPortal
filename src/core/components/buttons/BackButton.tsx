import React , {memo} from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {sizeToDp} from '../../utils/sizeToDP.tsx';
import { APP_PADDING } from '../../utils/constants.ts';
import theme from '../../utils/styles/styles.ts';

interface Props {
  onBack?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  isCloseButton?: boolean;
  closeBack?: boolean;
  noGoBack?: boolean;
}

export const BackButton = memo(({
  onBack,
  style,
  isCloseButton = false,
  closeBack = false,
  noGoBack = false,
  onClose,
}: Props) => {
  const {goBack, navigate} = useNavigation<any>();

  const onPress = () => {
    if (isCloseButton && !closeBack) {
      !noGoBack && navigate('Home');
      onClose?.();
    } else {
      onBack?.();
      !noGoBack && goBack();
    }
  };

  return (
    <Pressable
      hitSlop={sizeToDp(APP_PADDING * 2)}
      style={[
        STYLES.buttonContainer,
        style,
      ]}
      onPress={onPress}>
      {!isCloseButton && (
        <FastImage
          source={require('../../assets/images/BackIcon.webp')}
          style={[STYLES.icon]}
        />
      )}
      {isCloseButton && (
        <FastImage
          source={require('../../assets/images/close.webp')}
          style={[STYLES.icon]}
        />
      )}
    </Pressable>
  );
});

const STYLES = StyleSheet.create({
  buttonContainer: {
    zIndex: +999,
    backgroundColor: theme.colors.glassSecondary + 'cc',
    borderRadius: 999,
  },
  icon: {
    width: sizeToDp(34),
    height: sizeToDp(34),
  }
})
