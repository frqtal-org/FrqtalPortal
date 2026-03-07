import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import React, { memo } from 'react'
import FastImage from 'react-native-fast-image';
import { sizeToDp } from '../../utils/sizeToDP';
import { Typography } from '../Typography';
import { APP_PADDING } from '../../utils/constants';

const BalanceHeaderInfo = memo(({ onPressFilterTitle, balance, currency, equivalentBalance, equivalentCurrency, iconActions, balanceTitle, filterTitleText, equivalentBalanceColor, equivalentMiniText }: any) => {
    return (
        <View>
            <View style={[STYLES.headerButtonsWrapper]}>
                <View style={[{ flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.3) }]} >
                    <Typography variant="subtitle01SemiBold">{balanceTitle}</Typography>
                    {filterTitleText && <Pressable onPress={onPressFilterTitle} style={[{ columnGap: sizeToDp(APP_PADDING * 0.2), flexDirection: 'row', alignItems: 'center', zIndex: 999}]} hitSlop={sizeToDp(APP_PADDING * 1.3)} >
                        <Typography variant="subtitle01SemiBold" color='textEleventh' >{filterTitleText}</Typography>
                        {/* <FastImage
                            source={require('../../assets/images/down-arrow.webp')}
                            style={[STYLES.cryptoSelectorChevron]}
                            resizeMode="contain"
                        /> */}
                    </Pressable>}
                </View>
                {iconActions && iconActions}
            </View>
            <View style={[STYLES.currencyContainer]}>
                <Typography
                    variant="megatitle02Bold"
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    style={[STYLES.balanceTitleAmount]}
                >
                    {`${parseFloat(balance).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} ${currency}`}
                </Typography>

                <View style={[{ flexDirection: 'row', alignItems: 'center' }]} >
                    {equivalentMiniText && <Typography
                        variant="text01Medium"
                        color='textEleventh'
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {equivalentMiniText + ' '}
                    </Typography>}
                    {equivalentBalance && <Typography
                        variant="subtitle02Medium"
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        color={equivalentBalanceColor && equivalentBalanceColor}
                    >
                        +{parseFloat(equivalentBalance).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} {equivalentCurrency && equivalentCurrency}
                    </Typography>}
                </View>
            </View>
        </View>
    )
})

export default BalanceHeaderInfo;

const STYLES = StyleSheet.create({
    currencyContainer: {
        rowGap: sizeToDp(APP_PADDING * 0.2),
    },
    balanceTitleAmount: {
        marginTop: sizeToDp(APP_PADDING * 0.3),
    },
    headerButtonsWrapper: {
        justifyContent: 'center',
    },
    cryptoSelectorChevron: {
        width: sizeToDp(APP_PADDING * 1.5),
        aspectRatio: 1 / 1,
    },
});

