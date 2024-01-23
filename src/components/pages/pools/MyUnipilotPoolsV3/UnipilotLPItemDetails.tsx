import React, { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/pools/AutomaticLPItemDetails.module.scss';
import { formatNumber } from 'utils';
import { CurrencyLogo } from 'components';
import IncreaseUnipilotLiquidityModal from './IncreaseUnipilotLiquidityModal';
import WithdrawUnipilotLiquidityModal from './WithdrawUnipilotLiquidityModal';
import { JSBI } from '@uniswap/sdk';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import { useUniPilotVaultContract } from 'hooks/useContract';
import { useTokenBalance } from 'state/wallet/v3/hooks';
import { formatUnits } from 'ethers/lib/utils';
import { UnipilotPosition } from 'hooks/v3/useV3Positions';

const UnipilotLPItemDetails: React.FC<{ position: UnipilotPosition }> = ({
  position,
}) => {
  const { t } = useTranslation();

  const uniPilotVaultContract = useUniPilotVaultContract(position.id);
  const unipilotToken0VaultBalance = useTokenBalance(
    position.id,
    position.token0,
  );
  const unipilotToken1VaultBalance = useTokenBalance(
    position.id,
    position.token1,
  );

  const vaultTotalSupplyResult = useSingleCallResult(
    uniPilotVaultContract,
    'totalSupply',
  );
  const vaultTotalSupply =
    !vaultTotalSupplyResult.loading &&
    vaultTotalSupplyResult.result &&
    vaultTotalSupplyResult.result.length > 0
      ? vaultTotalSupplyResult.result[0]
      : undefined;

  const vaultPositionResult = useSingleCallResult(
    uniPilotVaultContract,
    'getPositionDetails',
  );
  const vaultPositionDetails =
    !vaultPositionResult.loading && vaultPositionResult.result
      ? vaultPositionResult.result
      : undefined;

  const token0Balance = useMemo(() => {
    if (
      vaultPositionDetails &&
      vaultPositionDetails.length > 0 &&
      vaultTotalSupply &&
      JSBI.greaterThan(JSBI.BigInt(vaultTotalSupply), JSBI.BigInt(0))
    ) {
      return JSBI.divide(
        JSBI.multiply(
          JSBI.add(
            JSBI.BigInt(vaultPositionDetails[0]),
            unipilotToken0VaultBalance?.numerator ?? JSBI.BigInt(0),
          ),
          JSBI.BigInt(position.balance),
        ),
        JSBI.BigInt(vaultTotalSupply),
      );
    }
  }, [
    vaultPositionDetails,
    vaultTotalSupply,
    unipilotToken0VaultBalance?.numerator,
    position.balance,
  ]);

  const token1Balance = useMemo(() => {
    if (
      vaultPositionDetails &&
      vaultPositionDetails.length > 1 &&
      vaultTotalSupply &&
      JSBI.greaterThan(JSBI.BigInt(vaultTotalSupply), JSBI.BigInt(0))
    ) {
      return JSBI.divide(
        JSBI.multiply(
          JSBI.add(
            JSBI.BigInt(vaultPositionDetails[1]),
            unipilotToken1VaultBalance?.numerator ?? JSBI.BigInt(0),
          ),
          JSBI.BigInt(position.balance),
        ),
        JSBI.BigInt(vaultTotalSupply),
      );
    }
  }, [
    position,
    vaultPositionDetails,
    unipilotToken1VaultBalance,
    vaultTotalSupply,
  ]);

  const [showAddLPModal, setShowAddLPModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const positionWithTokenBalances = {
    ...position,
    token0Balance,
    token1Balance,
  };

  const lpBalance = position?.lpBalance ?? JSBI.BigInt(0);

  return (
    <Box>
      {showAddLPModal && (
        <IncreaseUnipilotLiquidityModal
          open={showAddLPModal}
          onClose={() => setShowAddLPModal(false)}
          position={positionWithTokenBalances}
        />
      )}
      {showWithdrawModal && (
        <WithdrawUnipilotLiquidityModal
          open={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          position={positionWithTokenBalances}
        />
      )}
      <Box className='flex justify-between'>
        <small>{t('myLiquidity')}</small>
        <small>
          {position.balance
            ? formatNumber(Number(position.balance) / 10 ** 18)
            : 0}{' '}
          LP
        </small>
      </Box>
      <Box className='flex justify-between' mt={1}>
        {position.token0 && (
          <Box className='flex items-center' gap='8px'>
            <CurrencyLogo currency={position.token0} />
            <small>
              {t('pooled')} {position.token0?.symbol}
            </small>
          </Box>
        )}
        <Box className='flex items-center'>
          <small>
            {token0Balance
              ? formatNumber(
                  formatUnits(
                    token0Balance.toString(),
                    position.token0?.decimals,
                  ),
                )
              : 0}
          </small>
        </Box>
      </Box>
      <Box className='flex justify-between' mt={1}>
        {position.token1 && (
          <Box className='flex items-center' gap='8px'>
            <CurrencyLogo currency={position.token1} />
            <small>
              {t('pooled')} {position.token1?.symbol}
            </small>
          </Box>
        )}
        <Box className='flex items-center'>
          <small>
            {token1Balance
              ? formatNumber(
                  formatUnits(
                    token1Balance.toString(),
                    position.token1?.decimals,
                  ),
                )
              : 0}
          </small>
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
          disabled={JSBI.equal(lpBalance, JSBI.BigInt(0))}
          onClick={() => setShowWithdrawModal(true)}
        >
          <small>{t('withdraw')}</small>
        </Button>
      </Box>
    </Box>
  );
};

export default UnipilotLPItemDetails;
