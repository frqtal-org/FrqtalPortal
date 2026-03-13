import { NativeModules, StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useMMKVString } from 'react-native-mmkv';
import StorageKey from '../../../core/utils/store/keysStore';
import { mmkvStorage } from '../../../core/store/principalStore';
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
import { LoginContext } from './context';
import { NumbersKeyPad } from '../../../core/components/NumbersKeyPad';
import { useNetInfo } from '@react-native-community/netinfo';

const Code = ({ value }: { value: string }) => {
  return <View style={[STYLES.containerWrapper, value && { backgroundColor: theme.colors.brand200 }, { borderRadius: 999, borderWidth: sizeToDp(1), borderColor: theme.colors.brand200, width: sizeToDp(APP_PADDING * 1.2), aspectRatio: 1 }]} />
}

let badCodeTO: number
let diveceIdTO: number

const Login = () => {
  /*  */
  const { handleLogin, isAuthenticationLoadingSV } = useContext(LoginContext)
  /*  */
  const [deviceId, setDeviceId] = useMMKVString(StorageKey.DEVICE_SERIAL_NUMBER, mmkvStorage)
  const [appBuildNumber, setAppBuildNumber] = useMMKVString(StorageKey.APP_VERSION_NAME, mmkvStorage)
  /*  */
  const [loadingTextStatus, setLoadingTextStatus] = useState('')
  /*  */
  const isBadCodeSV = useSharedValue(false)
  const showDeviceIdSV = useSharedValue(false)
  /*  */
  const { navigate } = useNavigation<any>()
  const { isConnected } = useNetInfo();

  /* ------- Functions ------- */
  function handleKeyPress(key: any) {
    if (key === 'delete') {
      if (values.code.length === 0) return;
      setFieldValue('code', values.code.substring(0, values.code.length - 1));
      return;
    }
    if (values.code.length === 6) return;
    setFieldValue('code', values.code + key);
  }

  function onLogin() {
    setLoadingTextStatus('Activando terminal')
  }

  function sendLoginCode({ code }: any) {
    handleLogin({ code, deviceId, onLogin })
      .then(() => {
        isBadCodeSV.set(false)
        navigate('AppNavigation')
      })
      .catch((err: any) => {
        setFieldValue('code', '')
        isBadCodeSV.set(true)
        badCodeTO && clearTimeout(badCodeTO)
        badCodeTO = setTimeout(() => {
          isBadCodeSV.set(false)
        }, 5000)
      })
  }

  function handleShowDeviceID() {
    showDeviceIdSV.set(true)
    diveceIdTO && clearTimeout(diveceIdTO)
    diveceIdTO = setTimeout(() => {
      showDeviceIdSV.set(false)
    }, 15000)
  }
  /* ------- END Functions ------- */

  /* ------- Forms ------- */
  const { setFieldValue, handleSubmit, values, resetForm } = useFormik({
    initialValues: { code: '' },
    onSubmit: sendLoginCode,
  });
  /* ------- END Forms ------- */

  /* ------- Animations ------- */
  const isLoadingStyle = useAnimatedStyle(() => ({
    opacity: isAuthenticationLoadingSV.get() ? 1 : 0,
    pointerEvents: isAuthenticationLoadingSV.get() ? 'auto' : 'none',
  }))

  const isBadCodeStyle = useAnimatedStyle(() => ({
    opacity: isBadCodeSV.get() ? 1 : 0,
    pointerEvents: isBadCodeSV.get() ? 'auto' : 'none',
    height: isBadCodeSV.get() ? 'auto' : 0,
  }))

  const showDeviceIdStyle = useAnimatedStyle(() => ({
    opacity: showDeviceIdSV.get() ? 1 : 0,
    pointerEvents: showDeviceIdSV.get() ? 'auto' : 'none',
    height: showDeviceIdSV.get() ? 'auto' : 0,
  }))
  /* ------- END Animations ------- */

  /* ------- Effects ------- */
  useEffect(() => {
    if (values.code.length === 6) {
      if (isConnected) {
        setLoadingTextStatus('Iniciando sesión')
        !isAuthenticationLoadingSV.get() && handleSubmit()
      } else {
        setLoadingTextStatus('Sin conexión')
        isAuthenticationLoadingSV.set(true)
        setTimeout(() => {
          isAuthenticationLoadingSV.set(false)
          setLoadingTextStatus('')
          setFieldValue('code', '')
        }, 3000)
      }
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

        <View style={[{ rowGap: sizeToDp(APP_PADDING * 0.3), bottom: 0, position: 'absolute', marginBottom: sizeToDp(APP_PADDING * 0.5), alignItems: 'center', justifyContent: 'center' }]} >
          <Animated.View style={[showDeviceIdStyle]} >
            <Typography color='notificationYellow' variant='text02Medium' >{deviceId}</Typography>
          </Animated.View>
          <Animated.View style={[isBadCodeStyle]} >
            <Typography color='notificationRed' variant='text02Medium' >PIN inválido, intenta de nuevo</Typography>
          </Animated.View>
        </View>
      </View>


      <NumbersKeyPad
        onPressNumber={handleKeyPress}
        onResetDigits={() => setFieldValue('code', '')}
        /* onSecret={handleShowDeviceID} */
        onSecret={handleShowDeviceID}
      />

      <View style={[{ alignItems: 'center', paddingTop: sizeToDp(APP_PADDING * 0.8) }]} >
        <Typography variant='text02Light' color={'textSecondary'} >Frqtal Network S.A.P.I de C.V.</Typography>
      </View>


      <Animated.View style={[STYLES.loadingScreenWrapper, isLoadingStyle]}>
        <LoadingScreen text={loadingTextStatus} />
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
    paddingHorizontal: sizeToDp(APP_PADDING * 0.8),
  },
  keysWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  codeInputWrapper: {
    flexDirection: 'row',
    columnGap: sizeToDp((APP_PADDING * 1.2) - 1),
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
