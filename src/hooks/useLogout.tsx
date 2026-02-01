import { useDescope } from '@descope/react-sdk';
import { useQueryClient } from '@tanstack/react-query';

export const useLogout = () => {
  const sdk = useDescope();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await sdk.logout();
    queryClient.clear();
    window.location.reload();
  };

  return handleLogout;
};
