import React, {memo} from 'react';
import { View, StyleSheet, PressableProps, Pressable, StyleProp, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {sizeToDp} from '../../utils/sizeToDP.tsx';
import {Typography} from '../Typography.tsx';
import FastImage from 'react-native-fast-image';
import theme from '../../utils/styles/styles.ts';
import { APP_PADDING } from '../../utils/constants.ts';

type ButtonVariant = 'primary' | 'secondary' | 'black';
export type SizeVariant = 'large' | 'small' | 'medium' | 'extraSmall';
type BorderTypes = keyof typeof borders;
type Props = {
  title?: string | React.ReactNode;
  icon?: any;
  isDisabled?: boolean;
  variant?: ButtonVariant;
  size?: SizeVariant;
  disablePadding?: boolean;
  fitWidth?: boolean;
  borderType?: BorderTypes;
  style?: StyleProp<ViewStyle>;
} & PressableProps;

const colorGradients = theme.colorGradients as any;
const colors = {
  primary: {
    inactive: colorGradients.primary.inactive,
    pressed: colorGradients.primary.pressed,
  },
  secondary: {
    inactive: colorGradients.secondary.inactive,
    pressed: colorGradients.secondary.pressed,
  },
  disabled: {
    inactive: colorGradients.disabled.inactive,
    pressed: colorGradients.disabled.pressed,
  },
  black: {
    inactive: [theme.colors.black, theme.colors.black],
    pressed: [theme.colors.black, theme.colors.black],
  },
} as any;

const getColorVariant = (type: any) => ({
  inactive: [...colors[type].inactive],
  pressed: [...colors[type].pressed],
  start: colorGradients[type].start,
  end: colorGradients[type].end,
  locations: colorGradients[type].location,
});

const borders = {
  'mid-rounded': sizeToDp(APP_PADDING * 0.8),
  rounded: sizeToDp(APP_PADDING),
  radius: '999px',
  sharp: sizeToDp(APP_PADDING / 2),
} as any;

const Button = memo(
  ({
    onPress,
    variant = 'primary',
    borderType = 'rounded',
    icon,
    title,
    isDisabled,
    size = 'large',
    disablePadding,
    fitWidth = false,
    ...rest
  }: Props) => {
    const colorVariant = getColorVariant(isDisabled ? 'disabled' : variant);
    const getFontSize = {
      mini: 'text02',
      small: 'text02Medium',
      extraSmall: 'text02',
      large: 'text02Medium',
    } as any;

    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        {...rest}
        style={[
          fitWidth ? STYLES.fitWidthContainer : {},
          STYLES.buttonWrapper,
          {
            borderRadius: borders[borderType],
          },
          ...(Array.isArray(rest.style) ? rest.style : [rest.style]),
        ]}>
        <LinearGradient
          colors={colorVariant.inactive}
          start={colorVariant.start}
          end={colorVariant.end}
          locations={colorVariant.locations}
          style={[STYLES.gradient]}
        />

        <View
          style={[
            STYLES.buttonContentContainer,
            size === 'large' && STYLES.buttonLargeContainer,
            size === 'small' && STYLES.buttonSmallContainer,
            size === 'extraSmall' && STYLES.buttonExtraSmallContainer,
            disablePadding && STYLES.buttonNoPaddingContainer,
          ]}>
          {icon && (
            <FastImage
              source={icon}
              style={[STYLES.iconImage]}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}

          {title && (
            <Typography
              variant={getFontSize[size]}
              style={[icon ? STYLES.textPadded : {}, { includeFontPadding: false }]}
              color={isDisabled ? 'textEleventh' : "textPrimary"}>
              {title}
            </Typography>
          )}
        </View>
      </Pressable>
    );
  },
);

export default Button;

const STYLES = StyleSheet.create({
  fitWidthContainer: {
    alignSelf: 'flex-start',
  },
  buttonWrapper: {
    borderWidth: sizeToDp(1),
    borderColor: theme.colors.brand600,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  iconImage: {
    width: sizeToDp(APP_PADDING),
    height: sizeToDp(APP_PADDING),
  },
  textPadded: {
    marginLeft: sizeToDp(7 * 1.2),
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonNoPaddingContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  buttonLargeContainer: {
    paddingVertical: sizeToDp(APP_PADDING * 1.3),
    paddingHorizontal: sizeToDp(APP_PADDING * 1.5),
  },
  buttonSmallContainer: {
    paddingVertical: sizeToDp(APP_PADDING),
    paddingHorizontal: sizeToDp(APP_PADDING * 1.2),
  },
  buttonExtraSmallContainer: {
    paddingVertical: sizeToDp(APP_PADDING * 0.8),
    paddingHorizontal: sizeToDp(APP_PADDING),
  },
});
