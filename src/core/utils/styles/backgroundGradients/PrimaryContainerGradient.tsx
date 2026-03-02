import React, { memo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import theme from '../styles';

const PrimaryContainerGradient = memo(() => {
  return <LinearGradient colors={[theme.colors.glassPrimary, theme.colors.glassSecondary]} useAngle angleCenter={{ x: 0, y: 1 }} angle={45} style={[STYLES.gradient]} />;
});

export default PrimaryContainerGradient;

const STYLES = StyleSheet.create({
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
