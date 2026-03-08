import React from 'react';

import { View } from 'react-native';
import { Typography } from './Typography';
import { sizeToDp } from '../utils/sizeToDP';
import { APP_PADDING } from '../utils/constants';
import Loading from './Loading/Loading';
import theme from '../utils/styles/styles';

const LoadingListLoader = ({ title, subtitle, showLoader = true }: any) => {
  return (
    <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING * 0.8), flex: 1 }]}>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: sizeToDp(APP_PADDING * 0.5),
            borderWidth: sizeToDp(1),
            borderColor: theme.colors.glassSecondaryTransparent,
            borderRadius: sizeToDp(APP_PADDING * 0.8),
            borderStyle: 'dashed',
            paddingHorizontal: sizeToDp(APP_PADDING),
            paddingVertical: sizeToDp(APP_PADDING * 0.8),
          },
        ]}>
        {showLoader && <Loading style={[{ height: '100%', aspectRatio: 1 / 1, marginLeft: -sizeToDp(APP_PADDING * 0.2) }]} />}
        <View style={[{ flex: 1 }]} >
          <Typography variant="text01Medium" color="textEleventh">
            {title}
          </Typography>
          <Typography variant="text02Regular" color="textSecondary">
            {subtitle}
          </Typography>
        </View>
      </View>
    </View>
  );
};

export default LoadingListLoader;
