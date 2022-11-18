import React, { useMemo } from 'react';
import { DoubleCurrencyLogo } from 'components';
import {
  StyledButton,
  StyledDarkBox,
  StyledFilledBox,
} from 'components/v3/Common/styledElements';
import Loader from '../Loader';
import CurrencyLogo from '../CurrencyLogo';
import { Token } from '@uniswap/sdk';
import { WrappedCurrency } from '../../models/types';
import './index.scss';
import { ChainId } from '@uniswap/sdk';
import { ReactComponent as AddIcon } from 'assets/images/addIcon.svg';
import { Box } from '@material-ui/core';
import { formatUnits } from 'ethers/lib/utils';
import { formatReward } from 'utils/formatReward';
import { formatCompact, getTokenFromAddress } from 'utils';
import { Aprs } from 'models/interfaces';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';

interface EternalFarmCardProps {
  active?: boolean;
  now?: number;
  refreshing?: boolean;
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
  active,
  refreshing,
  farmHandler,
  now,
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
  tvlsLoading,
  eternal,
  chainId,
}: EternalFarmCardProps) {
  const apr = aprs ? aprs[id] : undefined;
  const aprValue =
    (apr !== undefined && apr >= 0 ? Math.round(apr) : '~') + '% APR';
  const poolApr = poolAprs ? poolAprs[pool.id] : undefined;
  const poolAprValue =
    (poolApr !== undefined && poolApr >= 0 ? Math.round(poolApr) : '~') +
    '% APR';
  const tvl = tvls ? tvls[id] : undefined;

  const tokenMap = useSelectedTokenList();
  const token0Address = pool.token0.id ?? pool.token0.address;
  const token1Address = pool.token1.id ?? pool.token1.address;
  const token0 =
    chainId && token0Address
      ? getTokenFromAddress(token0Address, chainId, tokenMap, [
          new Token(chainId, getAddress(token0Address), pool.token0.decimals),
        ])
      : undefined;

  const token1 =
    chainId && token1Address
      ? getTokenFromAddress(token1Address, chainId, tokenMap, [
          new Token(chainId, getAddress(token1Address), pool.token1.decimals),
        ])
      : undefined;

  return (
    <Box className='flex justify-center'>
      {refreshing && (
        <Loader size={'18px'} stroke={'white'} style={{ margin: 'auto' }} />
      )}
      {!refreshing && (
        <StyledFilledBox
          padding={1.5}
          width='100%'
          maxWidth={336}
          className='flex flex-col'
        >
          <Box mb={1.5} className='flex justify-between items-center'>
            <Box className='flex items-center'>
              {token0 && token1 && (
                <DoubleCurrencyLogo
                  currency0={token0}
                  currency1={token1}
                  size={30}
                />
              )}

              <Box ml='5px'>
                <small className='weight-600'>{`${pool.token0.symbol}/${pool.token1.symbol}`}</small>
              </Box>
            </Box>
            <Box className='flex'>
              <Box
                className='flex items-center bg-successLight'
                height='19px'
                padding='0 4px'
                borderRadius='4px'
                mr='6px'
              >
                <span className='text-success'>
                  {poolAprsLoading && <Loader stroke='#0fc679' />}
                  {!poolAprsLoading && <>{poolAprValue}</>}
                </span>
              </Box>
              <Box
                className='flex items-center bg-successLight'
                height='19px'
                padding='0 4px'
                borderRadius='4px'
              >
                <span className='text-success'>
                  {aprsLoading && <Loader stroke='#0fc679' />}
                  {!aprsLoading && <>{aprValue}</>}
                </span>
              </Box>
            </Box>
          </Box>
          {rewardToken && (
            <StyledDarkBox
              padding={1.5}
              className='flex items-center justify-between'
              height={56}
            >
              <Box className='flex items-center'>
                {chainId && (
                  <CurrencyLogo
                    currency={
                      new Token(
                        chainId,
                        rewardToken.id,
                        Number(rewardToken.decimals),
                        rewardToken.symbol,
                      ) as WrappedCurrency
                    }
                    size={'30px'}
                  />
                )}

                <Box ml={1.5}>
                  <p className='span text-secondary'>Reward</p>
                  <small className='weight-600'>{rewardToken?.symbol}</small>
                </Box>
              </Box>
              {rewardRate && (
                <small className='weight-600'>
                  {formatReward(
                    Number(formatUnits(rewardRate, rewardToken.decimals)) *
                      3600 *
                      24,
                  )}{' '}
                  / day
                </small>
              )}
            </StyledDarkBox>
          )}
          {bonusRewardToken && (
            <>
              <Box
                className='flex justify-center'
                mt={-1.5}
                mb={-1.5}
                zIndex={1}
              >
                <AddIcon />
              </Box>
              <StyledDarkBox
                padding={1.5}
                className='flex items-center justify-between'
                height={56}
              >
                <Box className='flex items-center'>
                  {chainId && (
                    <CurrencyLogo
                      currency={
                        new Token(
                          chainId,
                          bonusRewardToken.id,
                          Number(bonusRewardToken.decimals),
                          bonusRewardToken.symbol,
                        ) as WrappedCurrency
                      }
                      size={'30px'}
                    />
                  )}

                  <Box ml={1.5}>
                    <p className='span text-secondary'>Bonus</p>
                    <small className='weight-600'>
                      {bonusRewardToken.symbol}
                    </small>
                  </Box>
                </Box>
                {bonusRewardRate && (
                  <small className='weight-600'>
                    {formatReward(
                      Number(
                        formatUnits(bonusRewardRate, rewardToken.decimals),
                      ) *
                        3600 *
                        24,
                    )}{' '}
                    / day
                  </small>
                )}
              </StyledDarkBox>
            </>
          )}

          {!!tvl && (
            <Box mt={2} className='flex justify-between'>
              <small className='weight-600'>TVL:</small>
              <small className='weight-600'>${formatCompact(tvl)}</small>
            </Box>
          )}

          <Box marginTop={2}>
            <StyledButton height='40px' onClick={farmHandler}>
              Farm
            </StyledButton>
          </Box>
        </StyledFilledBox>
      )}
    </Box>
  );
}
