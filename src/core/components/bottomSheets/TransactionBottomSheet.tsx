import { Pressable, StyleSheet, View, NativeModules } from 'react-native'
import React, { useContext } from 'react'
import GeneralBottomSheet from './GeneralBottomSheet'
import { BottomSheetsContext } from './context'
import { Typography } from '../Typography'
import FastImage from 'react-native-fast-image'
import { APP_PADDING } from '../../utils/constants'
import { sizeToDp } from '../../utils/sizeToDP'
import theme from '../../utils/styles/styles'
import { toTitleCase } from '../../utils/titleCase'
import { formatPriceFromDigits } from '../../utils/priceFormater'
import { sumarMontosExactos } from '../../utils/sumarMontosExactos'
import { getExtraPercentage } from '../../utils/getExtraPercentage'

const { SmartWrapperModule } = NativeModules;

const ListItem = ({ listKey, listValue, greenText }: { listKey: string, listValue: string, greenText: string }) => {
    return <View style={[{ flexDirection: 'row', alignItems: 'center' }]} >
        <Typography variant='subtitle02Regular' color='textEleventh' >{listKey}: </Typography>
        <View style={[{ flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.2) }]} >
            <Typography variant='subtitle02Medium' >{listValue}</Typography>
            {greenText && <Typography variant='text02Medium' color='notificationGreen' >{greenText}</Typography>}
        </View>
    </View>
}

const statusToImageMap: Record<string, any> = {
    Declinada: require('../../assets/images/error.webp'),
    Reembolso: require('../../assets/images/error.webp'),
    Pendiente: require('../../assets/images/pending.webp'),
    Aprobada: require('../../assets/images/accepted.webp'),
};

const statusToColor: Record<string, any> = {
    Declinada: 'notificationRed',
    Reembolso: 'notificationRed',
    Pendiente: 'notificationYellow',
    Aprobada: 'notificationGreen',
};

const Divider = ({ text }: { text: string }) => {
    return <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING * 0.8), flexDirection: 'row', alignItems: 'center', width: '100%', columnGap: sizeToDp(APP_PADDING * 0.5), marginBottom: sizeToDp(APP_PADDING * 0.7) }]} >
        <View style={[{ height: 2, backgroundColor: theme.colors.glassPrimary, flex: 1 }]} />
        <Typography color='textEleventh'>{text}</Typography>
        <View style={[{ height: 2, backgroundColor: theme.colors.glassPrimary, flex: 1 }]} />
    </View>
}

const TransactionBottomSheet = () => {
    const { transactionBottomSheetRef, transactionSelected } = useContext(BottomSheetsContext)

    async function printTicket() {
        await SmartWrapperModule.reprintTicket(transactionSelected.SG_REFERENCE);
    }

    return (
        <GeneralBottomSheet borderColor={statusToColor[transactionSelected.RESPONSE_MESSAGE]} ref={transactionBottomSheetRef} >
            <View style={[{ alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.7), paddingHorizontal: sizeToDp(APP_PADDING * 0.8), paddingTop: sizeToDp(APP_PADDING * 0.8), rowGap: sizeToDp(APP_PADDING * 0.5) }]} >
                <FastImage
                    source={statusToImageMap[transactionSelected.RESPONSE_MESSAGE]}
                    style={[{ width: sizeToDp(APP_PADDING * 4.5), aspectRatio: 1 }]}
                    resizeMode='contain'
                />
                <View style={[{ rowGap: sizeToDp(APP_PADDING * 0.3), alignItems: 'center' }]} >
                    <Typography variant='title01Bold' >{transactionSelected.RESPONSE_MESSAGE}</Typography>
                    <Typography variant='subtitle02Regular' color='textEleventh' >02/03/2026 13:43</Typography>
                    <Pressable onPress={printTicket} hitSlop={{ right: sizeToDp(APP_PADDING * 2), left: sizeToDp(APP_PADDING * 2) }} style={[{ flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.3), paddingTop: sizeToDp(APP_PADDING * 0.2), paddingBottom: sizeToDp(APP_PADDING * 0.8) }]} >
                        <Typography variant='subtitle02Medium' color='brand200' >Imprimir</Typography>
                        <FastImage
                            source={require('../../assets/images/print200.png')}
                            style={[{ width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]}
                            resizeMode='contain'
                        />
                    </Pressable>
                </View>
            </View>




            <Divider text='Transaccion' />
            <View style={[{ rowGap: sizeToDp(APP_PADDING * 0.5), paddingHorizontal: sizeToDp(APP_PADDING * 1), marginBottom: sizeToDp(APP_PADDING * 0.8) }]} >
                <ListItem listKey='Tarjeta' listValue={`**** ${transactionSelected.ACCOUNT_NUMBER?.slice(-4)}`} />
                <ListItem listKey='Marca' listValue={toTitleCase(transactionSelected.BRAND_NAME)} />
                {transactionSelected.TIP && <ListItem listKey='Consumo' listValue={`${parseFloat(formatPriceFromDigits(transactionSelected.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} MXN`} />}
                {transactionSelected.TIP && <ListItem listKey='Extra' listValue={`${parseFloat(formatPriceFromDigits(transactionSelected.TIP)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} MXN`} greenText={`${getExtraPercentage({ montoBase: transactionSelected.AMOUNT, montoExtra: transactionSelected.TIP })}`} />}
                {
                    transactionSelected.TIP
                        ? <ListItem listKey='Total' listValue={`${sumarMontosExactos(parseFloat(formatPriceFromDigits(transactionSelected.AMOUNT)), parseFloat(formatPriceFromDigits(transactionSelected.TIP))).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} MXN`} />
                        : <ListItem listKey='Total' listValue={`${parseFloat(formatPriceFromDigits(transactionSelected.AMOUNT)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} MXN`} />
                }
            </View>

            <Divider text='Informacion bancaria' />
            <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING * 1), rowGap: sizeToDp(APP_PADDING * 0.5) }]} >
                <ListItem listKey='Referencia' listValue={transactionSelected.SG_REFERENCE} />
                <ListItem listKey='Codigo de aprovacion' listValue={transactionSelected.TXN_APPROVAL_CODE} />
            </View>


            {(transactionSelected.RESPONSE_MESSAGE !== 'Declinada' && transactionSelected.RESPONSE_MESSAGE !== 'Reembolso') && <View style={[{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingHorizontal: sizeToDp(APP_PADDING) }]} >
                <Pressable style={[{ paddingBottom: sizeToDp(APP_PADDING), paddingTop: sizeToDp(APP_PADDING * 1.2), flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.3) }]} >
                    <Typography variant='subtitle02Medium' color='notificationRed' >Reembolso</Typography>
                    <FastImage
                        source={require('../../assets/images/refundRed.png')}
                        style={[{ width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]}
                        resizeMode='contain'
                    />
                </Pressable>
            </View>}

            {!(transactionSelected.RESPONSE_MESSAGE !== 'Declinada' && transactionSelected.RESPONSE_MESSAGE !== 'Reembolso') && <View style={[{ height: sizeToDp(APP_PADDING * 0.8) }]} />}
        </GeneralBottomSheet>
    )
}

export default TransactionBottomSheet

const styles = StyleSheet.create({})