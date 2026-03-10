import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customInstance } from './customInstance';

export const handleLogout = () => {
    return customInstance({
        url: `/terminal/logout`,
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
    });
};


export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: handleLogout,
        mutationKey: ['logout'],
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['logout'] });
        },
        onError: (error) => {
            console.log("Error al cerrar sesion", error);
        }
    });
}