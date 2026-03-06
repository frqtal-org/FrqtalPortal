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
    return useMutation(
        {
            mutationFn: handleLogout,
            mutationKey: ['logout'],
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['logout'] });
                queryClient.setQueryData(['logout'], (oldData: any) => {
                    return [...(oldData || []), data.data];
                });
            },
        }
    );
}