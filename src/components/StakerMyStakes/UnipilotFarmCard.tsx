import React, { useMemo, useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DoubleCurrencyLogo } from 'components';
import { Link } from 'react-router-dom';
import { formatNumber } from 'utils';
import { ChevronDown, ChevronUp } from 'react-feather';
import UnipilotFarmCardDetails from './UnipilotFarmCardDetails';
import CircleInfoIcon from 'assets/images/circleinfo.svg';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import { formatUnits } from 'ethers/lib/utils';
import { useUniPilotVaultContract } from 'hooks/useContract';
import { useTokenBalance } from 'state/wallet/hooks';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import { JSBI } from '@uniswap/sdk';

const UnipilotFarmCard: React.FC<{
  data: any;
  farmData: any;
}> = ({ data, farmData }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const rewardA =
    data.rewardRate && data.rewardRate.rateA && data.rewardRate.tokenA
      ? Number(
          formatUnits(data.rewardRate.rateA, data.rewardRate.tokenA.decimals),
        ) *
        24 *
        3600
      : 0;
  const rewardB =
    data.rewardRate && data.rewardRate.rateB && data.rewardRate.tokenB
      ? Number(
          formatUnits(data.rewardRate.rateB, data.rewardRate.tokenB.decimals),
        ) *
        24 *
        3600
      : 0;

  const uniPilotVaultContract = useUniPilotVaultContract(data?.stakingAddress);
  const unipilotToken0VaultBalance = useTokenBalance(
    data?.stakingAddress,
    data.token0,
  );
  const unipilotToken1VaultBalance = useTokenBalance(
    data?.stakingAddress,
    data.token1,
  );
  const uniPilotVaultPositionResult = useSingleCallResult(
    uniPilotVaultContract,
    'getPositionDetails',
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
  const uniPilotVaultReserve = useMemo(() => {
    if (
      !uniPilotVaultPositionResult.loading &&
      uniPilotVaultPositionResult.result &&
      uniPilotVaultPositionResult.result.length > 1 &&
      vaultTotalSupply &&
      JSBI.greaterThan(JSBI.BigInt(vaultTotalSupply), JSBI.BigInt(0))
    ) {
      const token0Reserve = JSBI.add(
        JSBI.BigInt(uniPilotVaultPositionResult.result[0]),
        unipilotToken0VaultBalance?.numerator ?? JSBI.BigInt(0),
      );
      const token1Reserve = JSBI.add(
        JSBI.BigInt(uniPilotVaultPositionResult.result[1]),
        unipilotToken1VaultBalance?.numerator ?? JSBI.BigInt(0),
      );
      return {
        token0: JSBI.divide(
          JSBI.multiply(JSBI.BigInt(data.totalLpLocked), token0Reserve),
          JSBI.BigInt(vaultTotalSupply),
        ),
        token1: JSBI.divide(
          JSBI.multiply(JSBI.BigInt(data.totalLpLocked), token1Reserve),
          JSBI.BigInt(vaultTotalSupply),
        ),
      };
    }
    return;
  }, [
    uniPilotVaultPositionResult,
    unipilotToken0VaultBalance,
    unipilotToken1VaultBalance,
    data,
    vaultTotalSupply,
  ]);

  const poolAPR = farmData ? Number(farmData['stats'] ?? 0) : 0;
  const farmAPR = farmData ? Number(farmData['farming'] ?? 0) : 0;
  const totalAPR = farmData ? Number(farmData['total'] ?? 0) : 0;

  return (
    <Box
      width='100%'
      borderRadius={16}
      className={`bg-secondary1${showDetails ? ' border-primary' : ''}`}
    >
      <Box padding={1.5} className='flex items-center'>
        <Box width='90%' className='flex items-center'>
          <Box
            width={isMobile ? (showDetails ? '100%' : '70%') : '30%'}
            className='flex items-center'
          >
            {data.token0 && data.token1 && (
              <>
                <DoubleCurrencyLogo
                  currency0={data.token0}
                  currency1={data.token1}
                  size={30}
                />
                <Box ml='6px'>
                  <small className='weight-600'>{`${data.token0.symbol}/${data.token1.symbol}`}</small>
                  <Box className='cursor-pointer'>
                    <Link
                      to={`/pools?currency0=${data.token0.address}&currency1=${data.token1.address}`}
                      target='_blank'
                      className='no-decoration'
                    >
                      <small className='text-primary'>{t('getLP')}↗</small>
                    </Link>
                  </Box>
                </Box>
              </>
            )}
          </Box>
          {!isMobile && (
            <>
              <Box width='20%' className='flex justify-between'>
                <small className='weight-600'>${formatNumber(data.tvl)}</small>
              </Box>
              <Box width='30%'>
                {rewardA > 0 && (
                  <div>
                    <small className='small weight-600'>
                      {formatNumber(rewardA)} {data.rewardRate.tokenA.symbol} /{' '}
                      {t('day')}
                    </small>
                  </div>
                )}
                {rewardB > 0 && (
                  <div>
                    <small className='small weight-600'>
                      {formatNumber(rewardB)} {data.rewardRate.tokenB.symbol} /{' '}
                      {t('day')}
                    </small>
                  </div>
                )}
              </Box>
            </>
          )}

          {(!isMobile || !showDetails) && (
            <Box width={isMobile ? '30%' : '20%'} className='flex items-center'>
              <small className='text-success'>{formatNumber(totalAPR)}%</small>
              <Box ml={0.5} height={16}>
                <TotalAPRTooltip farmAPR={farmAPR} poolAPR={poolAPR}>
                  <img src={CircleInfoIcon} alt={'arrow up'} />
                </TotalAPRTooltip>
              </Box>
            </Box>
          )}
        </Box>

        <Box width='10%' className='flex justify-center'>
          <Box
            className='flex items-center justify-center cursor-pointer text-primary'
            width={20}
            height={20}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp /> : <ChevronDown />}
          </Box>
        </Box>
      </Box>
      {showDetails && (
        <UnipilotFarmCardDetails data={data} farmData={farmData} />
      )}
    </Box>
  );
};

export default UnipilotFarmCard;
