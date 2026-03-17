import { StyleSheet, View } from 'react-native'
import React, { useContext } from 'react'
import SettingsItems from './SettingsItems'
import { sizeToDp } from '../../../core/utils/sizeToDP'
import { APP_PADDING } from '../../../core/utils/constants'
import { InsetsContext } from '../../../core/utils/styles/insets'
import { useNavigation } from '@react-navigation/native'
import { LoginContext } from '../../accessManagement/Login/context'

const Settings = () => {
    const INSETS = useContext(InsetsContext)
    const { handleLogout } = useContext(LoginContext)

    const { navigate } = useNavigation<any>()

    return (
        <View style={[{ flex: 1, marginTop: INSETS.top, marginBottom: sizeToDp(APP_PADDING * 0.2) }]} >
            <View style={[{ marginBottom: 'auto', paddingTop: sizeToDp(APP_PADDING * 0.2) }]} >
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

            <SettingsItems
                icon={require('../../../core/assets/images/logout.webp')}
                label={'Cerrar sesión'}
                description={'Ir al inicio'}
                onPress={async () => {
                    navigate('Login');
                    await handleLogout()
                }}
            />
        </View>
    )
}

export default Settings

const styles = StyleSheet.create({})