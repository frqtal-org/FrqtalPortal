import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper'
import SettingsItems from './SettingsItems'
import { sizeToDp } from '../../../core/utils/sizeToDP'
import { APP_PADDING } from '../../../core/utils/constants'

const Settings = () => {
    return (
        <BasicScreenWrapper
            noHeader
            noPaddingBottom
        >
            <View style={[{ marginBottom: 'auto', paddingTop: sizeToDp(APP_PADDING * 0.4) }]} >
                <SettingsItems
                    icon={require('../../../core/assets/images/forwardArrow.webp')}
                    label={'General'}
                    description={'Configurar terminal'}
                    onPress={() => { }}
                />
                <SettingsItems
                    icon={require('../../../core/assets/images/forwardArrow.webp')}
                    label={'Ayuda'}
                    description={'Contactar soporte & ayuda'}
                    onPress={() => { }}
                />
            </View>
            <View style={[{ paddingBottom: sizeToDp(APP_PADDING * 0.4) }]} >
                <SettingsItems
                    icon={require('../../../core/assets/images/logout.webp')}
                    label={'Cerrar Sesión'}
                    description={'Ir al inicio'}
                    onPress={() => { }}
                />
            </View>
        </BasicScreenWrapper>
    )
}

export default Settings

const styles = StyleSheet.create({})