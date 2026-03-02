import { StyleSheet } from 'react-native';
import React, { memo, useContext, useState } from 'react';
import { TransactionsContext } from "../context.tsx";
import { useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GeneralModal } from '../../../../core/components/GeneralModal.tsx';

export const SendReceiptModal = memo(() => {
  /*  */
  const TRANSACTIONS_CONTEXT = useContext(TransactionsContext);
  /*  */
  const [sendReceiptModalVisible, setSendReceiptModalVisible] = useState(TRANSACTIONS_CONTEXT.sendReceiptModalVisibleSV.value);
  const [transactionNumber, setTransactionNumber] = useState(TRANSACTIONS_CONTEXT.numeroTransaccionToRefundSV.value);
  const [emailToSendVoucher, setEmailToSendVoucher] = useState(TRANSACTIONS_CONTEXT.emailToSendVoucherSV.value);

  /* ------- FUNCTIONS ------- */
  function handleModalVisualization() {
    TRANSACTIONS_CONTEXT.sendReceiptModalVisibleSV.value = !sendReceiptModalVisible;
    TRANSACTIONS_CONTEXT.phoneNumberToSendSV.value = '';
  }
  /* ------- END FUNCTIONS ------- */

  /* ------- ANIMATIONS ------- */
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.sendReceiptModalVisibleSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setSendReceiptModalVisible, currentValue)
    }
  }
  )
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.numeroTransaccionToRefundSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setTransactionNumber, currentValue)
    }
  }
  )
  useAnimatedReaction(() => {
    return TRANSACTIONS_CONTEXT.emailToSendVoucherSV.value
  }, (currentValue, previousValue) => {
    if (currentValue !== previousValue) {
      scheduleOnRN(setEmailToSendVoucher, currentValue)
    }
  }
  )
  /* ------- END ANIMATIONS ------- */

  return (
    <GeneralModal
      title='Recibo enviado'
      description='El recibo ha sido enviado exitosamente.'
      listFields={[
        { key: 'Transacción:', value: transactionNumber },
        { key: 'Enviado a:', value: emailToSendVoucher },
      ]}
      isVisible={sendReceiptModalVisible}
      onClose={handleModalVisualization}
      borderColor='green'
    />
  );
});
