import React, { memo, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import InsertAmount from './insertAmount/InsertAmount';

const { Navigator, Screen } = createNativeStackNavigator();

const AppNavigation = memo(() => {
    /*  */
    /* ------- Functions ------- */
    function InsertAmountRootWrapper(props: any) {
        useFocusEffect(useCallback(() => {
            const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
            return () => subscription.remove();
        }, []));
        return <InsertAmount {...props} />;
    }
    /* ------- END Functions ------- */

    return (
        <>
            <Navigator
                initialRouteName={'InsertAmount'}
                screenOptions={{ animation: 'none', headerShown: false, statusBarHidden: false }}
            >
                <Screen name={'InsertAmount'} component={InsertAmountRootWrapper} options={{ gestureEnabled: false }} />

                {/*Payment*/}
                {/* <Screen name={'PaymentAmount'} component={PaymentAmount} />
                <Screen name={'CardPaymentMethod'} component={CardPaymentMethod} /> */}
                {/*Transactions*/}
                {/* <Screen name={'Receipt'} component={Receipt} />
                <Screen name={'SignTransaction'} component={SignTransaction} />
                <Screen name={'TransactionsHistory'} component={TransactionsHistory} />
                <Screen name={'SendReceipt'} component={SendReceipt} />
                <Screen name={'SendReceiptByEmail'} component={SendReceiptByEmail} /> */}
                {/*Configuration*/}
                {/* <Screen name={'Configuration'} component={Configuration} />
                <Screen name={'Help'} component={Help} /> */}
            </Navigator>

            {/* <SendReceiptModal />
            <ErrorModal />
            <RequestRefundModal />
            <RequestRefundModalConfirmation />

            <TransactionsHistoryFilterSelectorBottomSheet /> */}
        </>
    );
});

export default AppNavigation;
