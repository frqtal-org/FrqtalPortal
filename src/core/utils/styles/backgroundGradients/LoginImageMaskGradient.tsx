import React, { memo } from 'react'

import LinearGradient from 'react-native-linear-gradient'
import { StyleSheet } from 'react-native'
import theme from '../styles';

const LoginImageMaskGradient = memo(() => {
  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
      colors={[theme.colors.glassSecondary + '22', theme.colors.glassPrimary + '66', theme.colors.glassSecondary + 'cf', theme.colors.glassSecondary + 'ff']}
      style={[STYLES.gradient]}
    />
  );
});

export default LoginImageMaskGradient;

const STYLES = StyleSheet.create({
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
