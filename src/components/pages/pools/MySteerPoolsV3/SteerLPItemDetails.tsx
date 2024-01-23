import React, { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/pools/AutomaticLPItemDetails.module.scss';
import { formatNumber } from 'utils';
import { CurrencyLogo } from 'components';
import IncreaseSteerLiquidityModal from './IncreaseSteerLiquidityModal';
import WithdrawSteerLiquidityModal from './WithdrawSteerLiquidityModal';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { formatUnits } from 'ethers/lib/utils';
import { SteerVault, useSteerStakedPools } from 'hooks/v3/useSteerData';
import { useTotalSupply } from 'hooks/v3/useTotalSupply';
import { Token } from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import { JSBI } from '@uniswap/sdk';

const SteerLPItemDetails: React.FC<{ position: SteerVault }> = ({
  position,
}) => {
  const { t } = useTranslation();

  const { chainId, account } = useActiveWeb3React();
  const steerToken0VaultBalance = position.token0Balance
    ? Number(formatUnits(position.token0Balance, position.token0?.decimals))
    : 0;
  const steerToken1VaultBalance = position.token1Balance
    ? Number(formatUnits(position.token1Balance, position.token1?.decimals))
    : 0;

  const lpToken = new Token(
    chainId,
    position.address,
    position.vaultDecimals,
    position.vaultSymbol,
    position.vaultName,
  );
  const vaultTotalSupply = useTotalSupply(lpToken);
  const vaultBalance = useTokenBalance(account, lpToken);
  const { data: steerFarms } = useSteerStakedPools(chainId, account);
  const steerFarm = steerFarms.find(
    (farm: any) =>
      farm.stakingToken.toLowerCase() === position.address.toLowerCase(),
  );
  const stakedAmount = steerFarm?.stakedAmount ?? 0;

  const vaultTotalSupplyNum = Number(vaultTotalSupply?.toExact() ?? '0');
  const vaultBalanceNum = Number(vaultBalance?.toExact() ?? '0') + stakedAmount;
  const token0Balance = useMemo(() => {
    if (vaultTotalSupplyNum > 0) {
      return (vaultBalanceNum * steerToken0VaultBalance) / vaultTotalSupplyNum;
    }
    return 0;
  }, [vaultTotalSupplyNum, vaultBalanceNum, steerToken0VaultBalance]);

  const token1Balance = useMemo(() => {
    if (vaultTotalSupplyNum > 0) {
      return (vaultBalanceNum * steerToken1VaultBalance) / vaultTotalSupplyNum;
    }
    return 0;
  }, [vaultTotalSupplyNum, vaultBalanceNum, steerToken1VaultBalance]);

  const [showAddLPModal, setShowAddLPModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const positionWithTokenBalances = {
    ...position,
    totalBalance: vaultBalanceNum,
    token0BalanceWallet: token0Balance,
    token1BalanceWallet: token1Balance,
  };

  return (
    <Box>
      {showAddLPModal && (
        <IncreaseSteerLiquidityModal
          open={showAddLPModal}
          onClose={() => setShowAddLPModal(false)}
          position={positionWithTokenBalances}
        />
      )}
      {showWithdrawModal && (
        <WithdrawSteerLiquidityModal
          open={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          position={positionWithTokenBalances}
        />
      )}
      <Box className='flex justify-between'>
        <small>{t('myLiquidity')}</small>
        <small>{formatNumber(vaultBalanceNum)} LP</small>
      </Box>
      <Box className='flex justify-between' mt={1}>
        <Box className='flex items-center' gap='8px'>
          <CurrencyLogo currency={position.token0} />
          <small>
            {t('pooled')} {position.token0?.symbol}
          </small>
        </Box>
        <Box className='flex items-center'>
          <small>{formatNumber(token0Balance)}</small>
        </Box>
      </Box>
      <Box className='flex justify-between' mt={1}>
        <Box className='flex items-center' gap='8px'>
          <CurrencyLogo currency={position.token1} />
          <small>
            {t('pooled')} {position.token1?.symbol}
          </small>
        </Box>
        <Box className='flex items-center'>
          <small>{formatNumber(token1Balance)}</small>
        </Box>
      </Box>
      <Box mt={2} className={styles.liquidityItemButtons}>
        <Button
          className={styles.liquidityItemButton}
          onClick={() => setShowAddLPModal(true)}
        >
          <small>{t('addLiquidity')}</small>
        </Button>
        <Button
          className={styles.liquidityItemButton}
          disabled={!vaultBalance || vaultBalance.equalTo(JSBI.BigInt('0'))}
          onClick={() => setShowWithdrawModal(true)}
        >
          <small>{t('withdraw')}</small>
        </Button>
      </Box>
    </Box>
  );
};

export default SteerLPItemDetails;
