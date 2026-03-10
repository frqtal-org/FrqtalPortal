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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refreshSessionToken'] });
    },
    onError: (error) => {
      console.log("Error al refrescar token", error);
    }
  });
};
