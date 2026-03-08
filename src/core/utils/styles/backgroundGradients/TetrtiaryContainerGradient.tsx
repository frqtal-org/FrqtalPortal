import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import theme from '../styles';

const TetrtiaryContainerGradient = () => {
  return <LinearGradient colors={[theme.colors.glassSecondary, theme.colors.notificationYellow]} useAngle angleCenter={{ x: 0.2, y: 0.8 }} angle={225} style={[STYLES.gradient]} />;
};

export default TetrtiaryContainerGradient;

const STYLES = StyleSheet.create({
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});
