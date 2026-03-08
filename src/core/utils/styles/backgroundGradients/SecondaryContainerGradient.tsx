import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import theme from '../styles';

const SecondaryContainerGradient = () => {
  return <LinearGradient colors={[theme.colors.glassSecondary, theme.colors.brand300]} useAngle angleCenter={{ x: 0.2, y: 0.8 }} angle={225} style={[STYLES.gradient]} />;
};

export default SecondaryContainerGradient;

const STYLES = StyleSheet.create({
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
