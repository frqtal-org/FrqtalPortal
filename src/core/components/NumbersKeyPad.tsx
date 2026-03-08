import { sizeToDp } from '../utils/sizeToDP.tsx';
import { Pressable, StyleSheet, View } from 'react-native';
import { Typography } from './Typography.tsx';
import React from 'react';
import theme from '../utils/styles/styles.ts';
import { APP_PADDING } from '../utils/constants.ts';

const KeyCode = ({ onPress, text, pressColor, onLongPress }: { onPress: () => void, text: string, pressColor?: string, onLongPress?: () => void }) => {
  return <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => [STYLES.keyButton, pressed && { backgroundColor: pressColor === 'red' ? theme.colors.notificationRed : theme.colors.glassBorder }]}>
    <Typography style={[{ includeFontPadding: false }]} variant="title02SemiBold">{text}</Typography>
  </Pressable>
}

export const NumbersKeyPad = ({ onPressNumber = () => { }, onResetDigits }: { onPressNumber: (number: string) => void; onResetDigits: () => void; }) => {
  return <View style={[STYLES.keysWrapper]}>
    <View style={[STYLES.keyRowWrapper]}>
      <KeyCode onPress={() => onPressNumber('1')} text='1' />
      <KeyCode onPress={() => onPressNumber('2')} text='2' />
      <KeyCode onPress={() => onPressNumber('3')} text='3' />
    </View>

    <View style={[STYLES.keyRowWrapper]}>
      <KeyCode onPress={() => onPressNumber('4')} text='4' />
      <KeyCode onPress={() => onPressNumber('5')} text='5' />
      <KeyCode onPress={() => onPressNumber('6')} text='6' />
    </View>

    <View style={[STYLES.keyRowWrapper]}>
      <KeyCode onPress={() => onPressNumber('7')} text='7' />
      <KeyCode onPress={() => onPressNumber('8')} text='8' />
      <KeyCode onPress={() => onPressNumber('9')} text='9' />
    </View>

    <View style={[STYLES.keyRowWrapper]}>
      <View style={[STYLES.keyButton]} />
      <KeyCode onPress={() => onPressNumber('0')} text='0' />
      <KeyCode onPress={() => onPressNumber('delete')} text='⌫' pressColor='red' onLongPress={onResetDigits} />
    </View>
  </View>
};

const STYLES = StyleSheet.create({
  keyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sizeToDp(APP_PADDING * 0.8)
  },
  keyRowWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: sizeToDp(APP_PADDING)
  },
  keysWrapper: {
    flex: 1,
    alignItems: 'center',
  },
});
