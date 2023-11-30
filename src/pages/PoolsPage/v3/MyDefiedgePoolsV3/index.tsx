import React, { useEffect, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import DefiedgeLPList from './DefiedgeLPList';
import { useQuery } from '@tanstack/react-query';
import { getAllGammaPairs, getGammaData, getGammaPositions } from 'utils';
import {
  useDefiedgeStrategyContract,
  useMasterChefContracts,
} from 'hooks/useContract';
import {
  useMultipleContractMultipleData,
  useMultipleContractSingleData,
} from 'state/multicall/v3/hooks';
import GammaPairABI from 'constants/abis/gamma-hypervisor.json';
import { formatUnits, Interface } from 'ethers/lib/utils';
import { Token } from '@uniswap/sdk';
import { useTokenBalances } from 'state/wallet/hooks';
import { useLastTransactionHash } from 'state/transactions/hooks';
import { useDefiedgePositions } from 'hooks/v3/useV3Positions';
import { useDefiedgeStrategyData } from 'hooks/v3/useDefiedgeStrategyData';
import { DefiedgeStrategy } from 'constants/index';

export default function MyDefiedgePoolsV3() {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  const { positions, loading } = useDefiedgePositions(account, chainId);

  return (
    <Box>
      {loading ? (
        <Box mt={2} className='flex justify-center'>
          <Loader stroke='white' size={'2rem'} />
        </Box>
      ) : positions.length > 0 ? (
        <DefiedgeLPList defiedgePositions={positions} />
      ) : (
        <Box mt={2} textAlign='center'>
          <p>{t('noLiquidityPositions')}.</p>
          {showConnectAWallet && (
            <Box maxWidth={250} margin='20px auto 0'>
              <Button fullWidth onClick={toggleWalletModal}>
                {t('connectWallet')}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
