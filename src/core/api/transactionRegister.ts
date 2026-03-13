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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactionRegister'] });
    },
    onError: (error) => {
      console.log("Error al registrar la transacción en el servidor", error);
      return error
    }
  });
};
