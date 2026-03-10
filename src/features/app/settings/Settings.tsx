import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import SettingsItems from './SettingsItems'
import { sizeToDp } from '../../../core/utils/sizeToDP'
import { APP_PADDING } from '../../../core/utils/constants'
import { InsetsContext } from '../../../core/utils/styles/insets'
import { useNavigation } from '@react-navigation/native'
import { deleteToken } from '../../../core/store/tokenKeyChainStore'
import { useLogout } from '../../../core/api/logout'

const Settings = () => {
    const INSETS = useContext(InsetsContext)

    const { navigate } = useNavigation<any>()
    const logoutMutator = useLogout()

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
                    await logoutMutator.mutateAsync()
                    deleteToken()
                }}
            />
        </View>
    )
}

export default Settings

const styles = StyleSheet.create({})