import React, { memo, useContext, useState } from 'react';
import { TransactionsContext } from "../context.tsx";
import { useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GeneralModal } from '../../../../core/components/GeneralModal.tsx';

export const RequestRefundModal = memo(() => {
    /*  */
    const TRANSACTIONS_CONTEXT = useContext(TransactionsContext);
    /*  */
    const [requestRefundModalVisible, setRequestRefundModalVisible] = useState(TRANSACTIONS_CONTEXT.requestRefundModalVisibleSV.value);
    const [transactionNumber, setTransactionNumber] = useState(TRANSACTIONS_CONTEXT.numeroTransaccionToRefundSV.value);

    /* ------- FUNCTIONS ------- */
    function handleModalVisualization() {
        TRANSACTIONS_CONTEXT.requestRefundModalVisibleSV.value = !requestRefundModalVisible;
        TRANSACTIONS_CONTEXT.phoneNumberToSendSV.value = '';
    }
    /* ------- END FUNCTIONS ------- */

    /* ------- ANIMATIONS ------- */
    useAnimatedReaction(() => {
        return TRANSACTIONS_CONTEXT.requestRefundModalVisibleSV.value
    }, (currentValue, previousValue) => {
        if (currentValue !== previousValue) {
            scheduleOnRN(setRequestRefundModalVisible, currentValue)
        }
    })
    useAnimatedReaction(() => {
        return TRANSACTIONS_CONTEXT.numeroTransaccionToRefundSV.value
    }, (currentValue, previousValue) => {
        if (currentValue !== previousValue) {
            scheduleOnRN(setTransactionNumber, currentValue)
        }
    })
    /* ------- END ANIMATIONS ------- */


    return (
        <GeneralModal
            title='Reembolso realizado'
            description='El reembolso ha sido solicitado exitosamente.'
            listFields={[
                { key: 'Transacción:', value: transactionNumber },
            ]}
            isVisible={requestRefundModalVisible}
            onClose={handleModalVisualization}
            borderColor='green'
        />
    );
});
