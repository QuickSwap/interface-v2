import { Token } from '@uniswap/sdk';
import { IchiVaults } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useMultipleContractSingleData } from 'state/multicall/v3/hooks';
import { getTokenFromAddress } from 'utils';
import ICHIVaultABI from 'constants/abis/ichi-vault.json';
import { Interface } from 'ethers/lib/utils';
import { useMemo } from 'react';

export interface ICHIVault {
  token0?: Token;
  token1?: Token;
  address: string;
  fee?: number;
}

export const useICHIVaults = () => {
  const { chainId } = useActiveWeb3React();
  const vaults = IchiVaults[chainId];
  const tokenMap = useSelectedTokenList();
  const vaultAddresses = vaults?.map((item) => item.address) ?? [];

  const feeCalls = useMultipleContractSingleData(
    vaultAddresses,
    new Interface(ICHIVaultABI),
    'fee',
    [],
  );

  return useMemo(() => {
    if (!vaults) return [];
    return vaults.map((vault, index) => {
      const token0 = getTokenFromAddress(vault.token0, chainId, tokenMap, []);
      const token1 = getTokenFromAddress(vault.token1, chainId, tokenMap, []);
      const feeCallData = feeCalls[index];
      const fee =
        !feeCallData.loading && feeCallData.result
          ? Number(feeCallData.result) / 10000
          : undefined;
      return { token0, token1, address: vault.address, fee };
    });
  }, [chainId, feeCalls, tokenMap, vaults]);
};
