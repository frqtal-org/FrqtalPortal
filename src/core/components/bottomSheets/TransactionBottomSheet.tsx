import { Pressable, StyleSheet, View, NativeModules } from 'react-native'
import React, { useContext } from 'react'
import GeneralBottomSheet from './GeneralBottomSheet'
import { BottomSheetsContext } from './context'
import { Typography } from '../Typography'
import FastImage from 'react-native-fast-image'
import { APP_PADDING } from '../../utils/constants'
import { sizeToDp } from '../../utils/sizeToDP'
import theme from '../../utils/styles/styles'

const { SmartWrapperModule } = NativeModules;

const ListItem = ({ listKey, listValue }: { listKey: string, listValue: string }) => {
    return <View style={[{ flexDirection: 'row', alignItems: 'center' }]} >
        <Typography variant='subtitle02Regular' color='textEleventh' >{listKey}: </Typography>
        <Typography variant='subtitle02Medium' >{listValue}</Typography>
    </View>
}

const Divider = ({ text }: { text: string }) => {
    return <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING * 0.8), flexDirection: 'row', alignItems: 'center', width: '100%', columnGap: sizeToDp(APP_PADDING * 0.5), marginBottom: sizeToDp(APP_PADDING * 0.7) }]} >
        <View style={[{ height: 2, backgroundColor: theme.colors.glassPrimary, flex: 1 }]} />
        <Typography color='textEleventh'>{text}</Typography>
        <View style={[{ height: 2, backgroundColor: theme.colors.glassPrimary, flex: 1 }]} />
    </View>
}

const TransactionBottomSheet = () => {
    const { transactionBottomSheetRef } = useContext(BottomSheetsContext)

    async function printTicket() {
        await SmartWrapperModule.reprintTicket('000038460689');
    }

    return (
        <GeneralBottomSheet ref={transactionBottomSheetRef} >
            <View style={[{ alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.7), paddingHorizontal: sizeToDp(APP_PADDING * 0.8), paddingTop: sizeToDp(APP_PADDING * 0.8), rowGap: sizeToDp(APP_PADDING * 0.5) }]} >
                <FastImage
                    source={require('../../assets/images/accepted.webp')}
                    style={[{ width: sizeToDp(APP_PADDING * 4.5), aspectRatio: 1 }]}
                    resizeMode='contain'
                />
                <View style={[{ rowGap: sizeToDp(APP_PADDING * 0.3), alignItems: 'center' }]} >
                    <Typography variant='title01Bold' >Aprobada</Typography>
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
                <ListItem listKey='Tarjeta' listValue='**** 1529' />
                <ListItem listKey='Marca' listValue='Master Card' />
                <ListItem listKey='Tipo' listValue='Credito' />
                <ListItem listKey='Consumo' listValue='$342.54 MXN' />
                <ListItem listKey='Propina' listValue='$37.23 MXN' />
                <ListItem listKey='Total' listValue='$379.77 MXN' />
            </View>

            <Divider text='Informacion bancaria' />
            <View style={[{ paddingHorizontal: sizeToDp(APP_PADDING * 1), rowGap: sizeToDp(APP_PADDING * 0.5) }]} >
                <ListItem listKey='Referencia' listValue='000038460468' />
                <ListItem listKey='Codigo de aprovacion' listValue='0384927' />
            </View>


            <View style={[{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingHorizontal: sizeToDp(APP_PADDING) }]} >
                <Pressable style={[{ paddingBottom: sizeToDp(APP_PADDING), paddingTop: sizeToDp(APP_PADDING * 1.2), flexDirection: 'row', alignItems: 'center', columnGap: sizeToDp(APP_PADDING * 0.3) }]} >
                    <Typography variant='subtitle02Medium' color='notificationRed' >Reembolso</Typography>
                    <FastImage
                        source={require('../../assets/images/refundRed.png')}
                        style={[{ width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]}
                        resizeMode='contain'
                    />
                </Pressable>
            </View>
        </GeneralBottomSheet>
    )
}

export default TransactionBottomSheet

const styles = StyleSheet.create({})