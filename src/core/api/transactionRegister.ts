import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customInstance } from './customInstance';


export const transactionRegister = (data: any) => {
  return customInstance({
    url: `/terminal/webhook`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
};

export const useTransactionRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionRegister,
    mutationKey: ['transactionRegister'],
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['transactionRegister'] });
      queryClient.setQueryData(['transactionRegister'], (oldData: any) => {
        return [...(oldData || []), data];
      });
    },
  });
};
