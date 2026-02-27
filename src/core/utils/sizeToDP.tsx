import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design size (mockup base, usualmente iPhone 8, XR o 375x812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const scaleWidth = SCREEN_WIDTH / BASE_WIDTH;
const scaleHeight = SCREEN_HEIGHT / BASE_HEIGHT;

function scale(size: number, basedOn: 'width' | 'height' = 'width') {
  const scaled = basedOn === 'height' ? size * scaleHeight : size * scaleWidth;
  return Math.round(scaled);
}

export const sizeToDp = (designSize: number) => scale(designSize, 'width');
