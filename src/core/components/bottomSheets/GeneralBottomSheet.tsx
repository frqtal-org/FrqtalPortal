
import React, { Children, useCallback, useContext, useRef } from 'react';
import { Text, StyleSheet, Dimensions, View, Pressable } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { sizeToDp } from '../../utils/sizeToDP';
import { APP_PADDING } from '../../utils/constants';
import theme from '../../utils/styles/styles';
import { Typography } from '../Typography';
import { InsetsContext } from '../../utils/styles/insets';
import HeaderGradient from '../../utils/styles/backgroundGradients/HeaderGradient';
import SuperMenuGradient from '../../utils/styles/backgroundGradients/SuperMenuGradient';
import FastImage from 'react-native-fast-image';

const GeneralBottomSheet = ({ ref, children }: any) => {
    const INSETS = useContext(InsetsContext)

    const handleSheetChanges = useCallback((index: number) => {

    }, []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1} // Desaparece cuando el sheet está cerrado
                appearsOnIndex={0}     // Aparece desde el primer snapPoint
                opacity={0.8}            // Opacidad máxima de tu color
                pressBehavior="close"  // Cierra el Bottom Sheet si el usuario toca el fondo
                style={[{ backgroundColor: theme.colors.glassSecondary, zIndex: 999 }]} // Tu color aquí
            />
        ),
        []
    );

    // renders
    return (
        <BottomSheet
            ref={ref}
            onChange={handleSheetChanges}
            enablePanDownToClose
            index={-1}
            handleStyle={{ backgroundColor: theme.colors.black, top: sizeToDp(1), borderTopLeftRadius: sizeToDp(APP_PADDING * 1.8), borderTopRightRadius: sizeToDp(APP_PADDING * 1.8), borderTopWidth: sizeToDp(1), borderTopColor: theme.colors.notificationGreen, borderRightWidth: sizeToDp(1), borderRightColor: theme.colors.notificationGreen, borderLeftWidth: sizeToDp(1), borderLeftColor: theme.colors.notificationGreen }}
            handleIndicatorStyle={{ backgroundColor: theme.colors.selectedBlue }}
            containerStyle={{ backgroundColor: 'transparent', zIndex: 9999 }}
            backgroundStyle={{ backgroundColor: 'transparent' }}
            enableOverDrag={false}
            backdropComponent={renderBackdrop}
        >
            <BottomSheetView style={[styles.contentContainer]}>
                <SuperMenuGradient />
                {children}
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        borderRightWidth: sizeToDp(1),
        borderRightColor: theme.colors.notificationGreen,
        borderLeftWidth: sizeToDp(1),
        borderLeftColor: theme.colors.notificationGreen,
        /* aspectRatio: 1.658 */
    },
});

export default GeneralBottomSheet;
