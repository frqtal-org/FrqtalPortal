import React, { memo, useContext, useState } from 'react';
import { TransactionsContext } from "../context.tsx";
import { useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GeneralModal } from '../../../../core/components/GeneralModal.tsx';

export const ErrorModal = memo(() => {
    /*  */
    const TRANSACTIONS_CONTEXT = useContext(TransactionsContext);
    /*  */
    const [errorModalVisible, setErrorModalVisible] = useState(TRANSACTIONS_CONTEXT.errorModalVisibleSV.value);
    const [errorCode, setErrorCode] = useState(TRANSACTIONS_CONTEXT.errorCodeSV.value);
    const [errorMessage, setErrorMessage] = useState(TRANSACTIONS_CONTEXT.errorMessageSV.value);

    /* ------- FUNCTIONS ------- */
    function handleModalVisualization() {
        TRANSACTIONS_CONTEXT.errorModalVisibleSV.value = !errorModalVisible;
        TRANSACTIONS_CONTEXT.errorCodeSV.value = ''
        TRANSACTIONS_CONTEXT.errorMessageSV.value = ''
    }
    /* ------- END FUNCTIONS ------- */

    /* ------- ANIMATIONS ------- */
    useAnimatedReaction(() => {
        return TRANSACTIONS_CONTEXT.errorModalVisibleSV.value
    }, (currentValue, previousValue) => {
        if (currentValue !== previousValue) {
            scheduleOnRN(setErrorModalVisible, currentValue)
        }
    }
    )
    useAnimatedReaction(() => {
        return TRANSACTIONS_CONTEXT.errorCodeSV.value
    }, (currentValue, previousValue) => {
        if (currentValue !== previousValue) {
            scheduleOnRN(setErrorCode, currentValue)
        }
    }
    )
    useAnimatedReaction(() => {
        return TRANSACTIONS_CONTEXT.errorMessageSV.value
    }, (currentValue, previousValue) => {
        if (currentValue !== previousValue) {
            scheduleOnRN(setErrorMessage, currentValue)
        }
    }
    )
    /* ------- END ANIMATIONS ------- */


    return (
        <GeneralModal
            title='Error'
            description='Ha ocurrido un error al procesar la solicitud.'
            listFields={[
                { key: 'Código:', value: errorCode },
                { key: 'Mensaje:', value: errorMessage },
            ]}
            isVisible={errorModalVisible}
            onClose={handleModalVisualization}
            borderColor='red'
        />
    );
});
