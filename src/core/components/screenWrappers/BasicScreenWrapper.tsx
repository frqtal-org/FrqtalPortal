import React, { useContext } from 'react';
import { View, StyleSheet, ViewComponent } from 'react-native';
import { InsetsContext } from '../../utils/styles/insets.tsx';
import GeneralHeader from '../headers/GeneralHeader.tsx';
import GeneralGradient from '../../utils/styles/backgroundGradients/GeneralGradient.tsx';
/* import GeneralHeader from '../headers/GeneralHeader.tsx'; */

const BasicScreenWrapper = ({
    children,
    headerCenterText,
    headerRightImage,
    headerRightImageSize,
    noHeader,
    noPaddingBottom,
    noBackButton,
    headerSubText,
    noGradient,
    isTransactionLoading = false,
    onBackPress,
    noGoBack,
    noPaddingTop,
    onTouchStart = () => {}
  }: {
    children: React.ReactNode;
    headerCenterText?: string;
    headerRightImage?: string;
    headerRightImageSize?: number;
    noHeader?: boolean;
    noPaddingBottom?: boolean;
    noBackButton?: boolean;
    headerSubText?: string;
    noGradient?: boolean;
    isTransactionLoading?: boolean;
    noGoBack?: boolean;
    noPaddingTop?: boolean;
    onBackPress?: () => void;
    onTouchStart?: () => void
  }) => {
    /*  */
    const INSETS = useContext(InsetsContext);

    return (
      <>
        {!noGradient && <GeneralGradient />}
        <View
          onTouchStart={onTouchStart}
          style={[
            STYLES.appWrapper,
            !noPaddingBottom && { paddingBottom: INSETS.bottom },
            (noHeader && !noPaddingTop) && { marginTop: INSETS.top },
          ]}
        >
          {!noHeader && (
            <GeneralHeader
              subText={headerSubText}
              titleText={headerCenterText}
              noBackButton={noBackButton}
              rightImage={headerRightImage}
              rightImageSize={headerRightImageSize}
              isTransactionLoading={isTransactionLoading}
              onBack={onBackPress}
              noGoBack={noGoBack}
            />
          )}
          {children}
        </View>
      </>
    );
  };

const STYLES = StyleSheet.create({
  appWrapper: {
    flex: 1,
  },
});

export default BasicScreenWrapper;
