import React, { memo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';

const BalanceContainerGradient = memo(() => {
  return <LinearGradient colors={['#8c4de1', '#8c4de1']} start={{ x: 0.4, y: 0.4 }} end={{ x: 1, y: 1 }} style={[STYLES.gradient]} />;
});

export default BalanceContainerGradient;

const STYLES = StyleSheet.create({
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});
