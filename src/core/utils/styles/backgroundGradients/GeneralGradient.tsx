import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import theme from '../styles';

const GeneralGradient = () => {
  return <LinearGradient useAngle angle={0} style={[STYLES.gradient]} angleCenter={{ x: 0, y: 1 }} colors={[theme.colors.glassPrimary, theme.colors.glassSecondary]} />;
};

export default GeneralGradient;

const STYLES = StyleSheet.create({
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
