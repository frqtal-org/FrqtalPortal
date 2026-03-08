import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import theme from '../styles';

const SuperMenuGradient = () => {
  return (
    <LinearGradient
      colors={[theme.colors.glassSecondary + 'f7', theme.colors.black]}
      useAngle
      angleCenter={{ x: 0, y: 0.8 }}
      angle={0}
      style={[STYLES.gradient]}
    />
  );
};

export default SuperMenuGradient;

const STYLES = StyleSheet.create({
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
