import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customInstance } from './customInstance';

export const handleLogin = (data: {
    pin: string,
    device_id: string
}) => {
    return customInstance({
        url: `/terminal/login`,
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data,
    });
};


export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: handleLogin,
        mutationKey: ['login'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['login'] });
        },
        onError: (error) => {
            console.log("Error al iniciar sesion", error);
        }
    });
}