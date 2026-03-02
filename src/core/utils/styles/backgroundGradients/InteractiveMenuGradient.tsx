import React, { memo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import theme from '../styles';

const InteractiveMenuGradient = (() => {
  return <LinearGradient colors={[theme.colors.glassSecondary + 'f7', theme.colors.black]} start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }} style={[STYLES.gradient]} />;
});

export default InteractiveMenuGradient;

const STYLES = StyleSheet.create({
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
