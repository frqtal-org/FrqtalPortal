import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import React from 'react'
import { sizeToDp } from '../../../../core/utils/sizeToDP'
import { Typography } from '../../../../core/components/Typography'
import { APP_PADDING } from '../../../../core/utils/constants'
import FastImage from 'react-native-fast-image'
import { Pagination } from 'react-native-reanimated-carousel'
import theme from '../../../../core/utils/styles/styles'

const DemoHeaderNav = ({ text, icon, onPress }: any) => {
    return <Pressable onPress={onPress} style={[{ columnGap: sizeToDp(APP_PADDING * 0.3), paddingTop: sizeToDp(APP_PADDING * 0.3), paddingBottom: sizeToDp((APP_PADDING * 0.8) + 1), flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 1 }]} >
        {icon && <FastImage
            source={icon}
            style={[{ width: sizeToDp(APP_PADDING * 1.28), aspectRatio: 1 }]}
            resizeMode='contain'
        />}
        <Typography variant={'text01SemiBold'} >{text}</Typography>
    </Pressable>
}

const AppPagination = ({ pages, progressSV, onPress }: any) => {
    return <View style={[{ position: 'absolute', zIndex: 999, width: '100%' }]} >
        <View style={[{ flexDirection: 'row' }]} >
            <DemoHeaderNav onPress={() => { onPress?.(0) }} icon={require('../../../../core/assets/images/settings.webp')} text='Ajustes' />
            <DemoHeaderNav onPress={() => { onPress?.(1) }} icon={require('../../../../core/assets/images/bill.webp')} text='Cobrar' />
            <DemoHeaderNav onPress={() => { onPress?.(2) }} icon={require('../../../../core/assets/images/Transactions.webp')} text='Historial' />
        </View>
        <Pagination.Basic
            progress={progressSV}
            data={pages}
            dotStyle={STYLES.paginationDotStyle}
            activeDotStyle={STYLES.paginationActiveDot}
            containerStyle={STYLES.paginationContainer}
        />
    </View>
}

export default AppPagination

const STYLES = StyleSheet.create({
    wrapper: {
        marginTop: sizeToDp(APP_PADDING * 0.8)
    },
    indicatorsContainer: {
    },
    paginationDotStyle: {
        width: Dimensions.get('window').width / 3,
        /* bottom: -sizeToDp(APP_PADDING * 0.2), */
        height: sizeToDp(APP_PADDING * 0.2)
    },
    paginationActiveDot: {
        backgroundColor: theme.colors.selectedBlue,
        borderRadius: 999,
        width: Dimensions.get('window').width / 3,
    },
    paginationContainer: {
    },
    loadingScreenWrapper: {
        position: 'absolute',
        flex: 1,
        top: 0,
        left: 0,
        zIndex: 9999,
        width: '100%',
        height: '100%',
    },
})

