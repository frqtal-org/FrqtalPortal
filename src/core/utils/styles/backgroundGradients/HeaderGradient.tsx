import React, { memo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import theme from '../styles';

const HeaderGradient = memo(() => {
  return <LinearGradient useAngle angle={0} style={[STYLES.gradient]} angleCenter={{ x: 0, y: 0.8 }} colors={[theme.colors.black + 'dc', theme.colors.glassSecondary]} />;
});

export default HeaderGradient;

const STYLES = StyleSheet.create({
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
