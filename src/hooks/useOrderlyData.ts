import { useAccount } from '@orderly.network/hooks';
import { useQuery } from '@tanstack/react-query';

export const useOrderlyAPIKey = () => {
  const { account } = useAccount();
  return useQuery({
    queryKey: ['orderlyAPIKey', account.address],
    queryFn: async () => {
      const orderlyKeyPair = account.keyStore.getOrderlyKey(account.address);
      const key = await orderlyKeyPair?.getPublicKey();
      const secret = orderlyKeyPair?.secretKey;
      return { key, secret };
    },
  });
};
