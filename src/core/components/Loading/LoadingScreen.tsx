import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { sizeToDp } from '../../utils/sizeToDP';
import theme from '../../utils/styles/styles';
import Loading from './Loading';
import { APP_PADDING } from '../../utils/constants';

const LoadingScreen = () => {  
  return <View style={[STYLES.wrapper]}>
    <LinearGradient
      colors={[theme.colors.glassPrimary + 'ff', theme.colors.glassSecondary + 'ef']}
      useAngle
      angleCenter={{ x: 0, y: 1 }}
      angle={0}
      style={[STYLES.gradient]}
    />
    <Loading style={[STYLES.loadingAnimationContainer]} />
  </View>
}

export default LoadingScreen;

const STYLES = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  loadingAnimationContainer: {
    width: sizeToDp(APP_PADDING * 8.2),
    aspectRatio: 1 / 1
  }
})
