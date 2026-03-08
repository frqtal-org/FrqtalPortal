import React, { useCallback } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Typography } from '../../../core/components/Typography';
import { sizeToDp } from '../../../core/utils/sizeToDP';
import { APP_PADDING } from '../../../core/utils/constants';

interface Props {
  label?: string;
  description?: string;
  onPress?: Function;
  icon?: any;
}

const SettingsItems = ({ onPress, label, description, icon }: Props) => {
  /* ------- Functions ------- */
  const handlePressAction = useCallback(() => {
    onPress?.()
  }, [onPress])
  /* ------- END Functions ------- */

  return (
    <Pressable
      style={[STYLES.wrapper]}
      onPress={handlePressAction}
    >
      <View style={[STYLES.textContainer]}>
        <Typography variant="subtitle02SemiBold" >{label}</Typography>
        <Typography variant='text02Medium' color="textEleventh" >{description}</Typography>
      </View>

      <FastImage
        source={icon}
        style={[STYLES.icon]}
        resizeMode="contain"
      />
    </Pressable>
  );
};

export default SettingsItems;

const STYLES = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    paddingHorizontal: sizeToDp(APP_PADDING * 1),
    paddingVertical: sizeToDp(APP_PADDING * 0.8),
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    width: sizeToDp(APP_PADDING * 1.5),
    aspectRatio: 1 / 1
  },
  textContainer: {
    flex: 1,
    rowGap: sizeToDp(APP_PADDING * 0.2)
  }
})
