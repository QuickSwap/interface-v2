import React from 'react';
import { DoubleCurrencyLogo } from 'components';
import {
  StyledButton,
  StyledDarkBox,
  StyledFilledBox,
} from 'components/v3/Common/styledElements';
import { useActiveWeb3React } from 'hooks';
import Loader from '../Loader';
import CurrencyLogo from '../CurrencyLogo';
import { ChainId, Token } from '@uniswap/sdk';
import './index.scss';
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
  const apr = aprs ? aprs[id] : undefined;
  const aprValue =
    (apr !== undefined && apr >= 0 ? formatCompact(apr) : '~') + '% APR';
  const poolApr = poolAprs ? poolAprs[pool.id] : undefined;
  const poolAprValue =
    (poolApr !== undefined && poolApr >= 0 ? formatCompact(poolApr) : '~') +
    '% APR';
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

  const farmRewardToken =
    chainId && rewardToken
      ? getTokenFromAddress(rewardToken.id, chainId, tokenMap, [
          new Token(
            chainId,
            rewardToken.id,
            Number(rewardToken.decimals),
            rewardToken.symbol,
          ),
        ])
      : undefined;

  const HOPTokenAddress = '0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc';

  const farmBonusRewardToken =
    chainId && bonusRewardToken
      ? getTokenFromAddress(
          pool &&
            pool.id &&
            pool.id.toLowerCase() ===
              '0x0db644468cd5c664a354e31aa1f6dba1d1dead47'
            ? HOPTokenAddress
            : bonusRewardToken.id,
          chainId,
          tokenMap,
          [
            new Token(
              chainId,
              pool &&
              pool.id &&
              pool.id.toLowerCase() ===
                '0x0db644468cd5c664a354e31aa1f6dba1d1dead47'
                ? HOPTokenAddress
                : bonusRewardToken.id,
              Number(bonusRewardToken.decimals),
              bonusRewardToken.symbol,
            ),
          ],
        )
      : undefined;

  return (
    <Box className='flex justify-center' height='100%'>
      {refreshing && (
        <Loader size={'18px'} stroke={'white'} style={{ margin: 'auto' }} />
      )}
      {!refreshing && (
        <StyledFilledBox
          padding={1.5}
          width='100%'
          height='100%'
          maxWidth={380}
          className='flex flex-col'
        >
          <Box mb={1.5} flex={1} className='flex justify-between items-center'>
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
              <Box mx='6px'>
                <Box ml='3px'>
                  <small className='weight-600'>Pool</small>
                </Box>
                <Box
                  className='flex items-center bg-successLight'
                  padding='0 4px'
                  borderRadius='4px'
                >
                  <span className='text-success'>
                    {poolAprsLoading && <Loader stroke='#0fc679' />}
                    {!poolAprsLoading && <>{poolAprValue}</>}
                  </span>
                </Box>
              </Box>
              <Box>
                <Box ml='3px'>
                  <small className='weight-600'>Farm</small>
                </Box>
                <Box
                  className='flex items-center bg-successLight'
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
          </Box>
          {rewardToken && (
            <StyledDarkBox
              padding={1.5}
              className='flex items-center justify-between'
              height={56}
            >
              {farmRewardToken && (
                <Box className='flex items-center'>
                  <CurrencyLogo currency={farmRewardToken} size={'30px'} />

                  <Box ml={1.5}>
                    <p className='span text-secondary'>Reward</p>
                    <small className='weight-600'>
                      {farmRewardToken.symbol}
                    </small>
                  </Box>
                </Box>
              )}
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
                {farmBonusRewardToken && (
                  <Box className='flex items-center'>
                    <CurrencyLogo
                      currency={farmBonusRewardToken}
                      size={'30px'}
                    />
                    <Box ml={1.5}>
                      <p className='span text-secondary'>Bonus</p>
                      <small className='weight-600'>
                        {farmBonusRewardToken.symbol}
                      </small>
                    </Box>
                  </Box>
                )}
                {bonusRewardRate && (
                  <small className='weight-600'>
                    {formatReward(
                      Number(
                        formatUnits(bonusRewardRate, bonusRewardToken.decimals),
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
            <StyledButton
              height='40px'
              disabled={isDetached}
              onClick={farmHandler}
            >
              Farm
            </StyledButton>
          </Box>
        </StyledFilledBox>
      )}
    </Box>
  );
}
