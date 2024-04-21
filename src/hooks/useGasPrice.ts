import JSBI from 'jsbi';

import Web3 from 'web3';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config/index';
import { useQuery } from '@tanstack/react-query';

export default function useGasPrice(): JSBI | undefined {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const rpc = config['rpc'];
  const { data } = useQuery({
    queryKey: ['gasPrice', rpc],
    queryFn: async () => {
      const web3 = new Web3(rpc);
      const gasPrice = await web3.eth.getGasPrice();
      return JSBI.BigInt(gasPrice);
    },
  });
  return data;
}
