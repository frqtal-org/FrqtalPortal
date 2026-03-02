import { View, StyleSheet, TextInput } from 'react-native';
import { sizeToDp } from '../../../../core/utils/sizeToDP.tsx';
import { APP_PADDING } from '../../../../core/utils/insets.tsx';
import theme from '../../../../core/utils/theme/theme.ts';
import React, { memo, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import TextField from '../../../../core/components/Inputs/TextField.tsx';
import { TransactionsContext } from '../context.tsx';
import { useNavigation } from '@react-navigation/native';
import LargeHeaderDescription from '../../../../core/components/headers/LargeHeaderDescription.tsx';

const EmailHeader = memo(() => {
  const ref = useRef<TextInput>(null);
  const TRANSACTIONS_CONTEXT = useContext(TransactionsContext);
  const [email, setEmail] = useState(TRANSACTIONS_CONTEXT.emailToSendVoucherSV.value);
  const { goBack } = useNavigation<any>();

  useEffect(() => {
    /* const task = InteractionManager.runAfterInteractions(() => {
      ref.current?.focus();
    }); */
    return () => {
      setEmail('')
      /* task.cancel() */
    };
  }, [])

  useEffect(() => {
    TRANSACTIONS_CONTEXT.emailToSendVoucherSV.value = email.toLocaleLowerCase().replaceAll(' ', '')
  }, [email])

  return (
    <View style={[STYLES.priceContainer]}>
      <LargeHeaderDescription
        title={'Enviar comprobante'}
        description={'Ingresa email para enviar comprobante'}
      />
      <TextField
        ref={ref}
        value={email}
        editable
        icon={require('../../../../core/assets/images/mail-primary.webp')}
        placeholder='Email'
        /* focusable={true} */
        onChangeText={(email) => setEmail(email.toLocaleLowerCase().replaceAll(' ', ''))}
        fullWidth
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        returnKeyType="send"
        onSubmitEditing={() => {
          TRANSACTIONS_CONTEXT.handleSendVoucher();
        }}
      />
    </View>

  );
});

export default EmailHeader

const STYLES = StyleSheet.create({
  subDataWrapper: {
    marginHorizontal: sizeToDp(APP_PADDING * 1.2),
    rowGap: sizeToDp(APP_PADDING * 0.7),
    marginBottom: sizeToDp(APP_PADDING * 0.5),
  },
  subDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
    paddingHorizontal: sizeToDp(APP_PADDING * 0.8),
    rowGap: sizeToDp(APP_PADDING * 1.2),
    marginTop: sizeToDp(APP_PADDING)
  },
  extrasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: sizeToDp(APP_PADDING * 1.2),
    marginTop: -sizeToDp(APP_PADDING * 2),
  },
  extrasList: {
    columnGap: sizeToDp(APP_PADDING * 0.7),
    paddingHorizontal: sizeToDp(APP_PADDING),
    paddingTop: sizeToDp(APP_PADDING * 2.7),
    paddingBottom: sizeToDp(APP_PADDING * 0.5),
  },
  extraSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: sizeToDp(APP_PADDING * 0.5),
    paddingHorizontal: sizeToDp(APP_PADDING * 0.7),
    paddingVertical: sizeToDp(APP_PADDING * 0.3),
    borderWidth: sizeToDp(1),
    borderRadius: 999,
  },
  inactiveExtraSelectorContainer: {
    backgroundColor: theme.colors.brand400 + '22',
    borderColor: theme.colors.brand400 + '88',
  },
  activeExtraSelectorContainer: {
    backgroundColor: theme.colors.brand300 + '22',
    borderColor: theme.colors.brand300 + '88',
  },
  extraDotSelectorContainer: {
    borderColor: theme.colors.brand200,
    borderWidth: sizeToDp(1),
    width: sizeToDp(APP_PADDING * 0.7),
    aspectRatio: 1,
    borderRadius: 999,
  },
  inactiveExtraDotSelectorContainer: {
    backgroundColor: theme.colors.brand200 + '44',
  },
  activeExtraDotSelectorContainer: {
    backgroundColor: theme.colors.brand200,
  },
  deleteExtraButtonContainer: {
    marginTop: sizeToDp(APP_PADDING * 2),
  },
  deleteExtraButtonIcon: {
    width: sizeToDp(APP_PADDING * 1.7),
    aspectRatio: 1,
  },
});
