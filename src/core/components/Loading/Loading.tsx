import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import LoadingAnimation from '../../assets/images/frqtal_loading.json';

interface Props {
  style?: StyleProp<ViewStyle>;
}

const Loading = ({ style }: Props) => {
  const animationRef = React.useRef<LottieView>(null);

  return <LottieView style={style} source={LoadingAnimation} ref={animationRef} autoPlay loop />;
};

export default Loading;
