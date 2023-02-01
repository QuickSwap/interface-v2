import React from 'react';
import { DoubleCurrencyLogo } from 'components';
import { useActiveWeb3React } from 'hooks';
import Loader from '../Loader';
import { Token } from '@uniswap/sdk';
import { ReactComponent as AddIcon } from 'assets/images/addIcon.svg';
import { Box, Button } from 'theme/components';
import { Link } from 'react-router-dom';
import { formatUnits } from 'ethers/lib/utils';
import { formatReward } from 'utils/formatReward';
import { formatCompact, formatNumber, getTokenFromAddress } from 'utils';
import { Aprs } from 'models/interfaces';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';
import { useTranslation } from 'react-i18next';
import { useIsXS } from 'hooks/useMediaQuery';

interface EternalFarmCardProps {
  active?: boolean;
  now?: number;
  farmHandler?: () => void;
  event?: {
    id?: any;
    pool?: any;
    createdAtTimestamp?: string;
    rewardRate?: string;
    rewardToken?: any;
    bonusRewardToken?: any;
    reward?: string;
    bonusReward?: string;
    bonusRewardRate?: string;
    locked?: boolean;
    isDetached?: boolean;
  };
  aprs: Aprs | undefined;
  aprsLoading: boolean;
  poolAprs: Aprs | undefined;
  poolAprsLoading: boolean;
  tvls: any;
  tvlsLoading: boolean;
  eternal?: boolean;
}

export function EternalFarmCard({
  active,
  farmHandler,
  now,
  event: {
    id,
    pool,
    rewardToken,
    bonusRewardToken,
    rewardRate,
    bonusRewardRate,
    isDetached,
  } = {},
  aprs,
  aprsLoading,
  poolAprs,
  poolAprsLoading,
  tvls,
  tvlsLoading,
  eternal,
}: EternalFarmCardProps) {
  const { t } = useTranslation();
  const apr = aprs ? aprs[id] : undefined;
  const aprValue =
    (apr !== undefined && apr >= 0 ? formatCompact(apr) : '~') + '%';
  const poolApr = poolAprs ? poolAprs[pool.id] : undefined;
  const poolAprValue =
    (poolApr !== undefined && poolApr >= 0 ? formatCompact(poolApr) : '~') +
    '%';
  const tvl = tvls ? tvls[id] : undefined;
  const { chainId } = useActiveWeb3React();

  const tokenMap = useSelectedTokenList();
  const token0 =
    chainId && pool.token0
      ? getTokenFromAddress(pool.token0.id, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(pool.token0.id),
            Number(pool.token0.decimals),
          ),
        ])
      : undefined;

  const token1 =
    chainId && pool.token1
      ? getTokenFromAddress(pool.token1.id, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(pool.token1.id),
            Number(pool.token1.decimals),
          ),
        ])
      : undefined;

  const isMobile = useIsXS();

  return (
    <Box
      padding='12px'
      width='100%'
      borderRadius='16px'
      className='flex flex-wrap items-center bg-secondary1'
    >
      <Box
        width={isMobile ? '100%' : '90%'}
        className='flex flex-wrap items-center'
      >
        <Box
          width={isMobile ? '100%' : '30%'}
          margin={isMobile ? '0 0 8px' : '0'}
          className='flex items-center'
        >
          {token0 && token1 && (
            <DoubleCurrencyLogo
              currency0={token0}
              currency1={token1}
              size={30}
            />
          )}

          <Box margin='0 0 0 6px'>
            <small className='weight-600'>{`${pool.token0.symbol}/${pool.token1.symbol}`}</small>
            <Box className='cursor-pointer'>
              <Link
                to={`/pools?currency0=${pool.token0.id}&currency1=${pool.token1.id}`}
                target='_blank'
                className='no-decoration'
              >
                <small className='text-primary'>{t('getLP')}↗</small>
              </Link>
            </Box>
          </Box>
        </Box>
        <Box
          width={isMobile ? '100%' : '15%'}
          margin={isMobile ? '0 0 8px' : '0'}
          className='flex justify-between'
        >
          {isMobile && <small className='text-secondary'>{t('tvl')}</small>}
          {!!tvl && <small className='weight-600'>${formatNumber(tvl)}</small>}
        </Box>
        <Box
          width={isMobile ? '100%' : '25%'}
          margin={isMobile ? '0 0 8px' : '0'}
          className='flex justify-between'
        >
          {isMobile && <small className='text-secondary'>{t('rewards')}</small>}
          <Box textAlign={isMobile ? 'right' : ''}>
            {rewardToken && rewardRate && (
              <small className='weight-600'>
                {formatReward(
                  Number(formatUnits(rewardRate, rewardToken.decimals)) *
                    3600 *
                    24,
                )}{' '}
                {rewardToken.symbol} / {t('day')}
              </small>
            )}
            <br />
            {bonusRewardToken && bonusRewardRate && (
              <small className='weight-600'>
                {formatReward(
                  Number(
                    formatUnits(bonusRewardRate, bonusRewardToken.decimals),
                  ) *
                    3600 *
                    24,
                )}{' '}
                {bonusRewardToken.symbol} / {t('day')}
              </small>
            )}
          </Box>
        </Box>

        <Box
          margin={isMobile ? '0 0 8px' : '0'}
          width={isMobile ? '100%' : '15%'}
          className='flex justify-between'
        >
          {isMobile && <small className='text-secondary'>{t('poolAPR')}</small>}
          <small className='text-success'>
            {poolAprsLoading && <Loader stroke='#0fc679' />}
            {!poolAprsLoading && <>{poolAprValue}</>}
          </small>
        </Box>

        <Box
          width={isMobile ? '100%' : '15%'}
          margin={isMobile ? '0 0 8px' : '0'}
          className='flex justify-between'
        >
          {isMobile && <small className='text-secondary'>{t('farmAPR')}</small>}
          <small className='text-success'>
            {aprsLoading && <Loader stroke='#0fc679' />}
            {!aprsLoading && <>{aprValue}</>}
          </small>
        </Box>
      </Box>

      <Box width={isMobile ? '100%' : '10%'}>
        <Button width='100%' onClick={farmHandler}>
          {t('farm')}
        </Button>
      </Box>
    </Box>
  );
}
