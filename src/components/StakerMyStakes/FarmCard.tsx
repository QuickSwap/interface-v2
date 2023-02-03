import React from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';
import { ChainId, Token } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { formatNumber, getTokenFromAddress } from 'utils';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';
import { useTranslation } from 'react-i18next';
import RangeBadge from 'components/v3/Badge/RangeBadge';
import FarmStakeButtons from './FarmStakeButtons';
import { formatReward } from 'utils/formatReward';
import { useMaticPrice } from 'state/application/hooks';

interface FarmCardProps {
  el: any;
  chainId: ChainId;
  poolApr?: number;
  farmApr?: number;
}

export default function FarmCard({ el, poolApr, farmApr }: FarmCardProps) {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const { maticPrice } = useMaticPrice();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const tokenMap = useSelectedTokenList();
  const poolToken0 = el.pool.token0 as any;
  const poolToken1 = el.pool.token1 as any;
  const token0Address = poolToken0.id ?? poolToken0.address;
  const token1Address = poolToken1.id ?? poolToken1.address;

  const token0 =
    chainId && token0Address
      ? getTokenFromAddress(token0Address, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(token0Address),
            Number(el.pool.token0.decimals),
          ),
        ])
      : undefined;

  const token1 =
    chainId && token1Address
      ? getTokenFromAddress(token1Address, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(token1Address),
            Number(el.pool.token1.decimals),
          ),
        ])
      : undefined;

  const outOfRange: boolean =
    el.pool && el.tickLower && el.tickUpper
      ? Number(el.pool.tick) < el.tickLower ||
        Number(el.pool.tick) >= el.tickUpper
      : false;

  const rewardToken = el.eternalRewardToken;
  const earned = el.eternalEarned;
  const bonusEarned = el.eternalBonusEarned;
  const bonusRewardToken = el.eternalBonusRewardToken;

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
          el.pool &&
            el.pool.id &&
            el.pool.id.toLowerCase() ===
              '0x0db644468cd5c664a354e31aa1f6dba1d1dead47'
            ? HOPTokenAddress
            : bonusRewardToken.id,
          chainId,
          tokenMap,
          [
            new Token(
              chainId,
              el.pool &&
              el.pool.id &&
              el.pool.id.toLowerCase() ===
                '0x0db644468cd5c664a354e31aa1f6dba1d1dead47'
                ? HOPTokenAddress
                : bonusRewardToken.id,
              Number(bonusRewardToken.decimals),
              bonusRewardToken.symbol,
            ),
          ],
        )
      : undefined;

  const currentMaticPrice = maticPrice.price ?? 0;
  const usdAmount =
    currentMaticPrice *
      Number(earned) *
      (rewardToken && rewardToken.derivedMatic
        ? Number(rewardToken.derivedMatic)
        : 0) +
    currentMaticPrice *
      Number(bonusEarned) *
      (bonusRewardToken && bonusRewardToken.derivedMatic
        ? Number(bonusRewardToken.derivedMatic)
        : 0);

  return (
    <Box>
      <Box
        className='flex justify-between items-center flex-wrap'
        borderRadius={10}
      >
        <Box
          className='flex items-center flex-wrap'
          width={isMobile ? '100%' : '85%'}
        >
          <Box
            className='flex items-center'
            width={isMobile ? '100%' : '50%'}
            mb={isMobile ? 2 : 0}
          >
            <Box className='v3-tokenId-wrapper' mr={1}>
              <span>{el.id}</span>
            </Box>
            {token0 && token1 && (
              <DoubleCurrencyLogo
                currency0={token0}
                currency1={token1}
                size={30}
              />
            )}
            {token0 && token1 && (
              <Box ml='8px'>
                <p className='small'>{`${token0.symbol} / ${token1.symbol}`}</p>
                <a
                  className='small'
                  href={`/#/pool/${+el.id}`}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {t('viewPosition')}
                </a>
              </Box>
            )}
            <Box ml={1}>
              <RangeBadge removed={false} inRange={!outOfRange} />
            </Box>
          </Box>

          <Box
            className='flex items-center justify-between'
            mb={isMobile ? 2 : 0}
            width={isMobile ? '100%' : '15%'}
          >
            {isMobile && <span className='text-secondary'>{t('poolAPR')}</span>}
            <small className='text-success'>
              {poolApr ? formatNumber(poolApr) : '~'}%
            </small>
          </Box>
          <Box
            className='flex items-center justify-between'
            mb={isMobile ? 2 : 0}
            width={isMobile ? '100%' : '15%'}
          >
            {isMobile && <span className='text-secondary'>{t('farmAPR')}</span>}
            <small className='text-success'>
              {farmApr ? formatNumber(farmApr) : '~'}%
            </small>
          </Box>
          <Box
            className='flex items-center justify-between'
            mb={isMobile ? 2 : 0}
            width={isMobile ? '100%' : '20%'}
          >
            {isMobile && (
              <small className='text-secondary'>{t('earnedRewards')}</small>
            )}
            <Box textAlign={isMobile ? 'right' : 'left'}>
              <small className='weight-600'>${formatNumber(usdAmount)}</small>
              <Box
                className={`flex items-center ${isMobile ? 'justify-end' : ''}`}
              >
                {farmRewardToken && (
                  <CurrencyLogo size='16px' currency={farmRewardToken} />
                )}

                {rewardToken && (
                  <Box ml='6px'>
                    <p className='caption'>{`${formatReward(Number(earned))} ${
                      rewardToken.symbol
                    }`}</p>
                  </Box>
                )}
              </Box>
              <Box
                className={`flex items-center ${isMobile ? 'justify-end' : ''}`}
              >
                {farmBonusRewardToken && (
                  <CurrencyLogo size='16px' currency={farmBonusRewardToken} />
                )}

                {bonusRewardToken && (
                  <Box ml='6px'>
                    <p className='caption'>{`${formatReward(
                      Number(bonusEarned),
                    )} ${bonusRewardToken.symbol}`}</p>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className='flex items-center' width={isMobile ? '100%' : '15%'}>
          <FarmStakeButtons el={el} />
        </Box>
      </Box>
    </Box>
  );
}
