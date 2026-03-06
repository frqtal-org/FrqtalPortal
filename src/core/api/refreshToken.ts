import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customInstance } from './customInstance';

interface refreshTokenData {
  auth_token_login: string | null;
}

export const refreshToken = (data: refreshTokenData) => {
  return customInstance({
    url: `/terminal/refresh-token`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data: data,
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refreshToken,
    mutationKey: ['refreshSessionToken'],
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['refreshSessionToken'] });
      queryClient.setQueryData(['refreshSessionToken'], (oldData: any) => {
        return [...(oldData || []), data];
      });
    },
  });
};
