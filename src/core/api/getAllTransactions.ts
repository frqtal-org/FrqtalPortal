import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customInstance } from './customInstance';

export const getAllTransactions = ({ data, serialNumber }: any) => {
    return customInstance({
        url: `/terminal/webhooks/${serialNumber}`,
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
        params: {
            ...data,
            quantity: 15,
        },
    });
};

export const useGetAllTransactions = () => {
    const queryClient = useQueryClient();
    return useMutation(
        {
            mutationFn: getAllTransactions,
            mutationKey: ['getAllTransactions'],
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['getAllTransactions'] });
                queryClient.setQueryData(['getAllTransactions'], (oldData: any) => {
                    return [...(oldData || []), data.data];
                });
            },
        }
    );
}