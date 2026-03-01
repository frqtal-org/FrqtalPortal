import { NativeModules, Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import { useMMKVString } from 'react-native-mmkv';
import StorageKey from '../../../core/utils/store/keysStore';
import { getItemWithExpiry, mmkvStorage, setItemWithExpiry } from '../../../core/store/principalStore';
import { sizeToDp } from '../../../core/utils/sizeToDP';
import { APP_PADDING } from '../../../core/utils/constants';
import theme from '../../../core/utils/styles/styles';
import { Typography } from '../../../core/components/Typography';
import { useFormik } from 'formik';
import FastImage from 'react-native-fast-image';
import LoadingScreen from '../../../core/components/Loading/LoadingScreen';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import BasicScreenWrapper from '../../../core/components/screenWrappers/BasicScreenWrapper';

const { SmartWrapperModule } = NativeModules;

const KeyCode = ({ onPress, text, pressColor, onLongPress, underLine }: { onPress: () => void, text: string, pressColor?: string, onLongPress?: () => void, underLine?: boolean }) => {
  return <Pressable onPress={onPress} onLongPress={onLongPress} style={({ pressed }) => [STYLES.keyButton, pressed && { backgroundColor: pressColor === 'red' ? theme.colors.notificationRed : theme.colors.glassBorder }]}>
    <Typography style={[{ includeFontPadding: false }]} variant="title02SemiBold">{text}</Typography>
  </Pressable>
}

const Code = ({ value }: { value: string }) => {
  return <View style={[STYLES.containerWrapper, value && { backgroundColor: theme.colors.brand200 }, { borderRadius: 999, borderWidth: sizeToDp(1), borderColor: theme.colors.brand200, width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]} />
}

const Login = () => {
  /*  */
  const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)
  const [SPApiKey, setSPApiKey] = useMMKVString(StorageKey.SP_API_KEY, mmkvStorage)
  const [SPIdCemmerce, setSPIdCemmerce] = useMMKVString(StorageKey.SP_ID_COMMECRE, mmkvStorage)
  const [SPIdIntegrator, setSPIdIntegrator] = useMMKVString(StorageKey.SP_ID_INTEGRATOR, mmkvStorage)
  const [SPIdInvoice, setSPIdInvoice] = useMMKVString(StorageKey.SP_ID_INVOICE, mmkvStorage)
  const [appBuildNumber, setAppBuildNumber] = useMMKVString(StorageKey.APP_VERSION_NAME, mmkvStorage)
  /*  */
  const isAuthenticationLoadingSV = useSharedValue(false)
  /*  */
  const { navigate } = useNavigation<any>()

  /* ------- Functions ------- */
  async function autenticarTerminal() {
    try {
      isAuthenticationLoadingSV.set(true)
      const token = getItemWithExpiry(StorageKey.SESSION_AUTH_TOKEN);

      if (token === null) {
        const response = await SmartWrapperModule.authenticate(SPApiKey, SPIdCemmerce, SPIdIntegrator, SPIdInvoice);
        const RESPONSE_PARSED = JSON.parse(response)
        if (RESPONSE_PARSED.response_code == 200) {
          setItemWithExpiry(StorageKey.SESSION_AUTH_TOKEN, true);
          navigate('AppNavigation')
        }
      } else {
        console.log("El token sigue vivo, podemos proceder con el cobro.");
        navigate('AppNavigation')
      }
    } catch (err) {
      console.error('err')
      console.error(err)
    } finally {
      isAuthenticationLoadingSV.set(false)
    }
  };

  function handleKeyPress(key: any) {
    if (key === 'delete') {
      if (values.code.length === 0) return;
      setFieldValue('code', values.code.substring(0, values.code.length - 1));
      return;
    }
    if (values.code.length === 6) return;
    setFieldValue('code', values.code + key);
  }
  /* ------- END Functions ------- */

  /* ------- Forms ------- */
  const { setFieldValue, handleSubmit, values, resetForm } = useFormik({
    initialValues: { code: '' },
    onSubmit: autenticarTerminal,
  });
  /* ------- END Forms ------- */

  /* ------- Animations ------- */
  const isLoadingStyle = useAnimatedStyle(() => ({
    opacity: isAuthenticationLoadingSV.get() ? 1 : 0,
    pointerEvents: isAuthenticationLoadingSV.get() ? 'auto' : 'none',
  }))
  /* ------- END Animations ------- */

  /* ------- Effects ------- */
  useEffect(() => {
    if (values.code.length === 6) {
      !isAuthenticationLoadingSV.get() && handleSubmit()
    }
  }, [values.code])
  /* ------- END Effects ------- */

  return (
    <BasicScreenWrapper
      noBackButton
      headerCenterText={'Iniciar sesión'}
      headerRightImage={require('../../../core/assets/images/login.png')}
      headerRightImageSize={sizeToDp(APP_PADDING * 1.68)}
      headerSubText={'PIN de acceso'}
    >

      <View style={[{ rowGap: sizeToDp(APP_PADDING * 0.8), alignItems: 'center', justifyContent: 'center', /* aspectRatio: 1.658,  width: '100%', */ flex: 0.8 }]} >
        <FastImage source={require('../../../core/assets/images/frqtalBrand.png')} resizeMode="contain" style={[STYLES.headerIcon]} />

        <View style={[{ width: '100%', alignItems: 'center', rowGap: sizeToDp(APP_PADDING * 0.7) }]} >
          <Typography variant={'text02Medium'} >Ingresa tu PIN para usar la terminal</Typography>

          <View style={[STYLES.codeInputWrapper]}>
            <Code value={values.code[0]} />
            <Code value={values.code[1]} />
            <Code value={values.code[2]} />
            <Code value={values.code[3]} />
            <Code value={values.code[4]} />
            <Code value={values.code[5]} />
          </View>
        </View>

        <Typography variant={'text02Regular'} color={'textEleventh'} >Versión: {appBuildNumber}</Typography>
      </View>

      <View style={[STYLES.keysWrapper]}>
        <View style={[STYLES.keyRowWrapper]}>
          <KeyCode onPress={() => handleKeyPress('1')} text='1' />
          <KeyCode onPress={() => handleKeyPress('2')} text='2' />
          <KeyCode onPress={() => handleKeyPress('3')} text='3' />
        </View>

        <View style={[STYLES.keyRowWrapper]}>
          <KeyCode onPress={() => handleKeyPress('4')} text='4' />
          <KeyCode onPress={() => handleKeyPress('5')} text='5' />
          <KeyCode onPress={() => handleKeyPress('6')} text='6' />
        </View>

        <View style={[STYLES.keyRowWrapper]}>
          <KeyCode onPress={() => handleKeyPress('7')} text='7' />
          <KeyCode onPress={() => handleKeyPress('8')} text='8' />
          <KeyCode onPress={() => handleKeyPress('9')} text='9' />
        </View>

        <View style={[STYLES.keyRowWrapper]}>
          <View style={[STYLES.keyButton]} />
          <KeyCode onPress={() => handleKeyPress('0')} text='0' />
          <KeyCode onPress={() => handleKeyPress('delete')} text='⌫' pressColor='red' onLongPress={() => setFieldValue('code', '')} />
        </View>
      </View>

      <View style={[{ alignItems: 'center', paddingTop: sizeToDp(APP_PADDING * 0.8) }]} >
        <Typography variant='text02Light' color={'textSecondary'} >Frqtal Network S.A.P.I de C.V.</Typography>
      </View>


      <Animated.View style={[STYLES.loadingScreenWrapper, isLoadingStyle]}>
        <LoadingScreen />
      </Animated.View>
    </BasicScreenWrapper>
  )
}

export default Login


const STYLES = StyleSheet.create({
  containerWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.brand200 + '44',
  },
  keyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sizeToDp(APP_PADDING * 0.8),
  },
  keyRowWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: sizeToDp(APP_PADDING * 0.8)
  },
  keysWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  codeInputWrapper: {
    flexDirection: 'row',
    columnGap: sizeToDp(APP_PADDING * 1.2),
    width: '100%',
    justifyContent: 'center'
  },
  headerIcon: {
    height: sizeToDp(APP_PADDING * 3),
    aspectRatio: 6.9210344828,
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
