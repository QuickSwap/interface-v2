import React from 'react';
import { DoubleCurrencyLogo } from 'components';
import { Token, ChainId } from '@uniswap/sdk';
import Link from 'next/link';
import {
  Box,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import { formatReward } from 'utils/formatReward';
import { formatCompact, formatNumber, getTokenFromAddress } from 'utils';
import { Aprs } from 'models/interfaces';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';
import { useTranslation } from 'next-i18next';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import { useMaticPrice } from 'state/application/hooks';
import { useRouter } from 'next/router';

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
  chainId: ChainId;
}

export function EternalFarmCard({
  farmHandler,
  event: {
    id,
    pool,
    rewardToken,
    bonusRewardToken,
    rewardRate,
    bonusRewardRate,
  } = {},
  aprs,
  aprsLoading,
  poolAprs,
  poolAprsLoading,
  tvls,
  chainId,
}: EternalFarmCardProps) {
  const { t } = useTranslation();
  const apr = aprs ? aprs[id] : undefined;
  const router = useRouter();
  const farmStatus = router.query
    ? router.query.farmStatus ?? 'active'
    : 'active';
  const poolApr = poolAprs ? poolAprs[pool.id] : undefined;
  const totalAPR =
    (poolApr && poolApr > 0 ? poolApr : 0) + (apr && apr > 0 ? apr : 0);
  const tvl = tvls ? tvls[id] : undefined;
  const { maticPrice } = useMaticPrice();

  const tokenMap = useSelectedTokenList();
  const token0Address = pool.token0.id ?? pool.token0.address;
  const token1Address = pool.token1.id ?? pool.token1.address;
  const token0 =
    chainId && token0Address
      ? getTokenFromAddress(token0Address, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(token0Address),
            Number(pool.token0.decimals),
          ),
        ])
      : undefined;

  const token1 =
    chainId && token1Address
      ? getTokenFromAddress(token1Address, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(token1Address),
            Number(pool.token1.decimals),
          ),
        ])
      : undefined;

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  return (
    <Box
      padding={1.5}
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
          mb={isMobile ? 1 : 0}
          className='flex items-center'
        >
          {token0 && token1 && (
            <DoubleCurrencyLogo
              currency0={token0}
              currency1={token1}
              size={30}
            />
          )}

          <Box ml='6px'>
            <small className='weight-600'>{`${pool.token0.symbol}/${pool.token1.symbol}`}</small>
            <Box className='cursor-pointer'>
              <Link
                href={`/pools?currency0=${token0Address}&currency1=${token1Address}`}
                target='_blank'
                className='no-decoration'
              >
                <small className='text-primary'>{t('getLP')}↗</small>
              </Link>
            </Box>
          </Box>
        </Box>
        <Box
          width={isMobile ? '100%' : '20%'}
          mb={isMobile ? 1 : 0}
          className='flex justify-between'
        >
          {isMobile && <small className='text-secondary'>{t('tvl')}</small>}
          {!!tvl && (
            <small className='weight-600'>
              ${formatNumber(Number(tvl) * (maticPrice.price ?? 0))}
            </small>
          )}
        </Box>
        <Box
          width={isMobile ? '100%' : '30%'}
          mb={isMobile ? 1 : 0}
          className='flex justify-between'
        >
          {isMobile && <small className='text-secondary'>{t('rewards')}</small>}
          <Box textAlign={isMobile ? 'right' : undefined}>
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

        {isMobile ? (
          <>
            <Box
              mb={1}
              width='100%'
              className='flex items-center justify-between'
            >
              <small className='text-secondary'>{t('poolAPR')}</small>
              <small className='text-success'>
                {poolAprsLoading && <CircularProgress />}
                {!poolAprsLoading && <>{formatCompact(poolApr ?? 0)}%</>}
              </small>
            </Box>
            <Box
              mb={1}
              width='100%'
              className='flex items-center justify-between'
            >
              <small className='text-secondary'>{t('farmAPR')}</small>
              <small className='text-success'>
                {aprsLoading && <CircularProgress />}
                {!aprsLoading && <>{formatCompact(apr ?? 0)}%</>}
              </small>
            </Box>
          </>
        ) : (
          <Box width='20%' className='flex items-center'>
            <small className='text-success'>
              {(poolAprsLoading || aprsLoading) && <CircularProgress />}
              {!poolAprsLoading && !aprsLoading && (
                <>{formatCompact(totalAPR)}%</>
              )}
            </small>
            <Box ml={0.5} className='flex'>
              <TotalAPRTooltip farmAPR={apr ?? 0} poolAPR={poolApr ?? 0}>
                <picture>
                  <img src='/assets/images/circleinfo.svg' alt='info' />
                </picture>
              </TotalAPRTooltip>
            </Box>
          </Box>
        )}
      </Box>

      <Box width={isMobile ? '100%' : '10%'}>
        {farmStatus === 'active' && (
          <Button
            variant='contained'
            fullWidth
            style={{ height: 40, borderRadius: 10 }}
            onClick={farmHandler}
          >
            {t('farm')}
          </Button>
        )}
      </Box>
    </Box>
  );
}
