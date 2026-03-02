import { Keyboard, View } from 'react-native';
import { sizeToDp } from '../../../../core/utils/sizeToDP.tsx';
import { APP_PADDING } from '../../../../core/utils/insets.tsx';
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TransactionsContext } from '../context.tsx';
import GradientButton from '../../../../core/components/buttons/GradientButton.tsx';
import { useAnimatedReaction } from 'react-native-reanimated';
import { isDifferentDay } from '../../../../core/utils/isDifferentDay.ts';
import TextField from '../../../../core/components/Inputs/TextField.tsx';
import { useFormik } from 'formik';
import { LoginContext } from '../../../accessManagment/Login/context.tsx';
import { scheduleOnRN } from 'react-native-worklets';
import { GeneralModal } from '../../../../core/components/GeneralModal.tsx';
import { TerminalDeviceContext } from '../../../context.tsx';
import { mmkvStorage } from '../../../../core/utils/store/mmkvConfig.ts';
import StorageKey from '../../../../core/utils/store/keysStorage.ts';

const Input = memo(({
  passwordRef,
  value,
  onChangePassword,
  error,
  validateField,
  handleSubmit,
  onCancel
}: any) => {
  return (
    <View style={{
      paddingTop: sizeToDp(APP_PADDING * 0.7),
      marginHorizontal: -sizeToDp(APP_PADDING * 0.2)
    }}>
      <TextField
        ref={passwordRef}
        variant="password"
        returnKeyType="send"
        size='medium'
        placeholder="Contraseña"
        value={value}
        onChangeText={onChangePassword}
        error={error}
        autoComplete="password"
        onBlur={() => validateField('password')}
        onSubmitEditing={handleSubmit}
      />
      <View
        style={{
          marginTop: sizeToDp(APP_PADDING * 0.7),
          flexDirection: 'row',
          columnGap: sizeToDp(APP_PADDING * 0.5),
        }}>
        <GradientButton
          onPress={onCancel}
          icon={require('../../../../core/assets/images/goBack.webp')}
          size="small"
          variant="secondary"
          style={{ flex: 1 }}
          title="Cancelar"
        />
        <GradientButton
          isDisabled={value === ''}
          onPress={handleSubmit}
          size="small"
          style={{ flex: 1 }}
          title="Confirmar"
        />
      </View>
    </View>
  );
});

export const RequestRefundModalConfirmation = memo(() => {
  /*  */
  const LOGIN_CONTEXT = useContext(LoginContext)
  const TRANSACTIONS_CONTEXT = useContext(TransactionsContext);
  const TERMINAL_DEVICE_CONTEXT = useContext(TerminalDeviceContext)
  /*  */
  const [requestRefundModalConfirmationVisible, setRequestRefundModalConfirmationVisible] = useState(TRANSACTIONS_CONTEXT.requestRefundModalConfirmationVisibleSV.value);
  const [transactionDateToRefund, setTransactionDateToRefund] = useState(TRANSACTIONS_CONTEXT.transactionDateToRefundSV.value);
  const [deviceSerialNumber, setDeviceSerialNumber] = useState(TERMINAL_DEVICE_CONTEXT.deviceSerialNumberSV.value)
  const [userData, setUserData] = useState(LOGIN_CONTEXT.userDataSV.value);
  /*  */
  const USER_DATA = useMemo<any>(() => JSON.parse(userData), [userData])

  const onSubmit = (data: any) => {
    mmkvStorage.delete(StorageKey.AUTH_TOKEN);
    data.email = USER_DATA?.user_email
    LOGIN_CONTEXT.handleLogin({
      data, onSuccess: () => {
        TRANSACTIONS_CONTEXT.requestRefundModalConfirmationVisibleSV.value = false;
        isDifferentDay(new Date(transactionDateToRefund))
          ? TRANSACTIONS_CONTEXT.handleRefundTransaction({ userId: USER_DATA?.user_id, serialNumber: deviceSerialNumber })
          : TRANSACTIONS_CONTEXT.handleCancelTransaction({ userId: USER_DATA?.user_id, serialNumber: deviceSerialNumber })
      },
      byPassQpayInitialization: true
    });
  };


  const { handleChange, handleSubmit, values, errors, validateField, resetForm } = useFormik(
    {
      initialValues: {
        email: USER_DATA?.user_email,
        serial_number: '',
        password: '',
      },
      onSubmit,
      validateOnChange: false,
    },
  );

  const onChangePassword = useCallback(
    (text: string) => handleChange('password')(text.replaceAll(' ', '')),
    [handleChange]
  );

  /* ------- FUNCTIONS ------- */
  const handleModalVisualization = useCallback(() => {
    TRANSACTIONS_CONTEXT.requestRefundModalConfirmationVisibleSV.value = !requestRefundModalConfirmationVisible;
    TRANSACTIONS_CONTEXT.phoneNumberToSendSV.value = '';
  }, [])
  /* ------- END FUNCTIONS ------- */

  /* ------- ANIMATIONS ------- */
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.requestRefundModalConfirmationVisibleSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setRequestRefundModalConfirmationVisible, currentValue)
    }
  });
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.transactionDateToRefundSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setTransactionDateToRefund, currentValue)
    }
  });
  useAnimatedReaction(() => {
    return LOGIN_CONTEXT.userDataSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setUserData, currentValue)
    }
  })
  useAnimatedReaction(() => {
    return TERMINAL_DEVICE_CONTEXT.deviceSerialNumberSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setDeviceSerialNumber, currentValue)
    }
  })
  /* ------- END ANIMATIONS ------- */

  useEffect(() => {
    if (!requestRefundModalConfirmationVisible) resetForm()
    if (requestRefundModalConfirmationVisible) {
      setTimeout(() => {
        LOGIN_CONTEXT.passwordInputRef?.current?.focus?.();
      }, 300)
    }
  }, [requestRefundModalConfirmationVisible])

  return (
    <>
      <GeneralModal
        title='Confirmación'
        description='Antes de continuar, por favor confirme la solicitud del reembolso ingresando la contraseña del usuario.'
        isVisible={requestRefundModalConfirmationVisible}
        onClose={handleModalVisualization}
        borderColor='yellow'
      >
        <Input
          passwordRef={LOGIN_CONTEXT.passwordInputRef}
          value={values.password}
          onChangePassword={onChangePassword}
          error={errors.password}
          validateField={validateField}
          handleSubmit={handleSubmit}
          onCancel={() => TRANSACTIONS_CONTEXT.requestRefundModalConfirmationVisibleSV.value = false}
        />
      </GeneralModal>
    </>
  );
});


