import React, { createContext } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sizeToDp } from '../sizeToDP';
import { APP_PADDING } from '../constants';

const INITIAL_VALUES = {
  top: 0,
  bottom: 0,
  superMenuBottom: 0,
};

export const InsetsContext = createContext(INITIAL_VALUES);

export default function InsetsProvider({ children }: any) {
  /*  */
  const insets = useSafeAreaInsets();
  /*  */
  let top = 0;
  let bottom = 0;
  let superMenuBottom = 0;

  if (Platform.OS === 'android') {
    if (insets.bottom == 0) {
      bottom = sizeToDp(APP_PADDING * 0.8);
      superMenuBottom = sizeToDp(APP_PADDING * 0.8);
    } else {
      bottom = sizeToDp(insets.bottom * 0.8);
      superMenuBottom = sizeToDp(insets.bottom * 0.8)
    }

    top = insets.top + sizeToDp(APP_PADDING);
  } else {
    if (insets.bottom == 0) {
      bottom = sizeToDp(APP_PADDING * 0.8);
      superMenuBottom = sizeToDp(APP_PADDING * 0.8);
    } else {
      bottom = sizeToDp(insets.bottom * 0.8);
      superMenuBottom = sizeToDp(insets.bottom * 0.8);
    }

    if (insets.top < 24) {
      top = insets.top + sizeToDp(APP_PADDING * 0.8);
    } else {
      top = insets.top + sizeToDp(APP_PADDING * 0.3);
    }
  }

  return (
    <InsetsContext.Provider
      value={{
        top,
        bottom,
        superMenuBottom,
      }}>
      {children}
    </InsetsContext.Provider>
  );
}
