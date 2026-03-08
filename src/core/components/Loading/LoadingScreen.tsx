import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { sizeToDp } from '../../utils/sizeToDP';
import theme from '../../utils/styles/styles';
import Loading from './Loading';
import { APP_PADDING } from '../../utils/constants';
import { Typography } from '../Typography';

const LoadingScreen = ({ text }: { text: string }) => {  
  return <View style={[STYLES.wrapper]}>
    <LinearGradient
      colors={[theme.colors.glassPrimary + 'ff', theme.colors.glassSecondary + 'ef']}
      useAngle
      angleCenter={{ x: 0, y: 1 }}
      angle={0}
      style={[STYLES.gradient]}
    />
    <Loading style={[STYLES.loadingAnimationContainer]} />
    {text && <Typography  variant='subtitle01Medium' color='textEleventh' style={[{ maxWidth: '80%', textAlign: 'center' }]} >{text}</Typography>}
  </View>
}

export default LoadingScreen;

const STYLES = StyleSheet.create({
  wrapper: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  loadingAnimationContainer: {
    width: sizeToDp(APP_PADDING * 7.8),
    aspectRatio: 1 / 1,
    marginBottom: sizeToDp(APP_PADDING * 0.3)
  }
})
