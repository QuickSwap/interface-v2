import React from 'react';
import { DoubleCurrencyLogo } from 'components';
import { useActiveWeb3React } from 'hooks';
import Loader from '../Loader';
import CurrencyLogo from '../CurrencyLogo';
import { Token } from '@uniswap/sdk';
import { ReactComponent as AddIcon } from 'assets/images/addIcon.svg';
import { Box, Button } from 'theme/components';
import { formatUnits } from 'ethers/lib/utils';
import { formatReward } from 'utils/formatReward';
import { formatCompact, getTokenFromAddress } from 'utils';
import { Aprs } from 'models/interfaces';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
    <Box
      className='flex justify-center bg-secondary1'
      borderRadius='6px'
      height='100%'
    >
      {refreshing && (
        <Loader size={'18px'} stroke={'white'} style={{ margin: 'auto' }} />
      )}
      {!refreshing && (
        <Box
          padding='12px'
          width='100%'
          height='100%'
          maxWidth='380px'
          className='flex flex-col'
        >
          <Box
            margin='0 0 12px'
            flex={1}
            className='flex justify-between items-center'
          >
            <Box className='flex items-center'>
              {token0 && token1 && (
                <DoubleCurrencyLogo
                  currency0={token0}
                  currency1={token1}
                  size={30}
                />
              )}

              <Box margin='0 0 0 5px'>
                <small className='weight-600'>{`${pool.token0.symbol}/${pool.token1.symbol}`}</small>
              </Box>
            </Box>
            <Box className='flex'>
              <Box margin='0 6px'>
                <Box margin='0 0 0 3px'>
                  <small className='weight-600'>{t('pool')}</small>
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
                <Box margin='0 0 0 3px'>
                  <small className='weight-600'>{t('farm')}</small>
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
            <Box
              padding='12px'
              className='flex bg-default items-center justify-between'
              height='56px'
              borderRadius='10px'
            >
              {farmRewardToken && (
                <Box className='flex items-center'>
                  <CurrencyLogo currency={farmRewardToken} size={'30px'} />

                  <Box margin='0 0 0 12px'>
                    <p className='span text-secondary'>{t('reward')}</p>
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
                  / {t('day')}
                </small>
              )}
            </Box>
          )}
          {bonusRewardToken && (
            <>
              <Box className='flex justify-center' margin='-12px 0' zIndex={1}>
                <AddIcon />
              </Box>
              <Box
                padding='12px'
                className='flex bg-default items-center justify-between'
                borderRadius='10px'
                height='56px'
              >
                {farmBonusRewardToken && (
                  <Box className='flex items-center'>
                    <CurrencyLogo
                      currency={farmBonusRewardToken}
                      size={'30px'}
                    />
                    <Box margin='0 0 0 12px'>
                      <p className='span text-secondary'>{t('bonus')}</p>
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
                    / {t('day')}
                  </small>
                )}
              </Box>
            </>
          )}

          {!!tvl && (
            <Box margin='16px 0 0' className='flex justify-between'>
              <small className='weight-600'>{t('tvl')}:</small>
              <small className='weight-600'>${formatCompact(tvl)}</small>
            </Box>
          )}

          <Box margin='16px 0 0'>
            <Button
              style={{ height: 40, borderRadius: 16 }}
              width='100%'
              disabled={isDetached}
              onClick={farmHandler}
            >
              {t('farm')}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
