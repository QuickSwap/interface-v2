import React, { useEffect, useState } from 'react';
import { IDerivedMintInfo, useV3MintActionHandlers } from 'state/mint/v3/hooks';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import './index.scss';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { Field } from 'state/mint/actions';
import { useSteerStakingPools, useSteerVaults } from 'hooks/v3/useSteerData';
import { SteerVaultState } from 'constants/index';

export interface IFeeTier {
  id: string;
  text: string;
  description: string;
}

interface SelectFeeTierProps {
  mintInfo: IDerivedMintInfo;
}

const SelectFeeTier: React.FC<SelectFeeTierProps> = ({ mintInfo }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const parsedQuery = useParsedQueryString();
  const feeTiers: { [chainId in ChainId]?: IFeeTier[] } = {
    [ChainId.ZKEVM]: [
      {
        id: 'algebra-dynamic',
        text: 'Dynamic',
        description: t('bestForAllPair'),
      },
      {
        id: 'uni-0.01',
        text: '0.01%',
        description: t('availableForStablePair'),
      },
      {
        id: 'uni-0.05',
        text: '0.05%',
        description: t('highlyLiquidPair'),
      },
      {
        id: 'uni-0.3',
        text: '0.3%',
        description: t('bestForMostPair'),
      },
      {
        id: 'uni-1',
        text: '1%',
        description: t('bestForExoticPair'),
      },
    ],
    [ChainId.MANTA]: [
      {
        id: 'uni-0.01',
        text: '0.01%',
        description: t('availableForStablePair'),
      },
      {
        id: 'uni-0.05',
        text: '0.05%',
        description: t('highlyLiquidPair'),
      },
      {
        id: 'uni-0.3',
        text: '0.3%',
        description: t('bestForMostPair'),
      },
      {
        id: 'uni-1',
        text: '1%',
        description: t('bestForExoticPair'),
      },
    ],
    [ChainId.ZKATANA]: [
      {
        id: 'uni-0.01',
        text: '0.01%',
        description: t('availableForStablePair'),
      },
      {
        id: 'uni-0.05',
        text: '0.05%',
        description: t('highlyLiquidPair'),
      },
      {
        id: 'uni-0.3',
        text: '0.3%',
        description: t('bestForMostPair'),
      },
      {
        id: 'uni-1',
        text: '1%',
        description: t('bestForExoticPair'),
      },
    ],
    [ChainId.X1]: [
      {
        id: 'uni-0.01',
        text: '0.01%',
        description: t('availableForStablePair'),
      },
      {
        id: 'uni-0.05',
        text: '0.05%',
        description: t('highlyLiquidPair'),
      },
      {
        id: 'uni-0.3',
        text: '0.3%',
        description: t('bestForMostPair'),
      },
      {
        id: 'uni-1',
        text: '1%',
        description: t('bestForExoticPair'),
      },
    ],
    [ChainId.TIMX]: [
      {
        id: 'uni-0.01',
        text: '0.01%',
        description: t('availableForStablePair'),
      },
      {
        id: 'uni-0.05',
        text: '0.05%',
        description: t('highlyLiquidPair'),
      },
      {
        id: 'uni-0.3',
        text: '0.3%',
        description: t('bestForMostPair'),
      },
      {
        id: 'uni-1',
        text: '1%',
        description: t('bestForExoticPair'),
      },
    ],
    [ChainId.IMX]: [
      {
        id: 'uni-0.01',
        text: '0.01%',
        description: t('availableForStablePair'),
      },
      {
        id: 'uni-0.05',
        text: '0.05%',
        description: t('highlyLiquidPair'),
      },
      {
        id: 'uni-0.3',
        text: '0.3%',
        description: t('bestForMostPair'),
      },
      {
        id: 'uni-1',
        text: '1%',
        description: t('bestForExoticPair'),
      },
    ],
  };

  const feeTierQuery = parsedQuery?.feeTier;
  const feeTierIdQuery = feeTierQuery
    ? `uni-${Number(feeTierQuery) / 10000}`
    : undefined;
  const { onChangeFeeTier } = useV3MintActionHandlers(mintInfo.noLiquidity);

  const fees = feeTiers[chainId];
  const currencyAAddress =
    mintInfo.currencies[Field.CURRENCY_A]?.wrapped.address;
  const currencyBAddress =
    mintInfo.currencies[Field.CURRENCY_B]?.wrapped.address;
  const { data: steerVaults } = useSteerVaults(chainId);
  const feeForSteer = Number(
    steerVaults.find((vault) => {
      return (
        vault.state !== SteerVaultState.Paused &&
        vault.state !== SteerVaultState.Retired &&
        vault.token0 &&
        vault.token1 &&
        currencyAAddress &&
        currencyBAddress &&
        ((vault.token0.address.toLowerCase() ===
          currencyAAddress.toLowerCase() &&
          vault.token1.address.toLowerCase() ===
            currencyBAddress.toLowerCase()) ||
          (vault.token0.address.toLowerCase() ===
            currencyBAddress.toLowerCase() &&
            vault.token1.address.toLowerCase() ===
              currencyAAddress.toLowerCase()))
      );
    })?.feeTier ?? '0',
  );

  const { data: steerFarms } = useSteerStakingPools(chainId);

  useEffect(() => {
    const feeTierFromQuery = fees?.find((item) => item.id === feeTierIdQuery);
    if (feeTierFromQuery) {
      onChangeFeeTier(feeTierFromQuery);
    } else if (feeForSteer) {
      const feeTier = fees?.find(
        (item) => Number(item.id.split('-')[1]) * 10000 === feeForSteer,
      );
      if (feeTier) {
        onChangeFeeTier(feeTier);
      }
    } else {
      if (!mintInfo.feeTier) {
        if (fees && fees.length > 0) {
          onChangeFeeTier(fees[0]);
        } else {
          onChangeFeeTier({
            id: 'algebra-dynamic',
            text: 'Dynamic',
            description: t('bestForAllPair'),
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!mintInfo.feeTier, feeTierIdQuery, feeForSteer, chainId]);

  return (
    <Box>
      {fees && fees.length > 0 && (
        <>
          <small className='weight-600'>{t('selectFeeTier')}</small>
          <Box mt={2} className='feeTierWrapper'>
            <Box padding={1.5} className='flex justify-between items-center'>
              <Box className='flex flex-col items-start'>
                <p className='text-bold'>
                  {mintInfo.feeTier?.text} {t('feeTier')}
                </p>
              </Box>
            </Box>
            <Box className='feeSelectionWrapper'>
              {fees.map((tier) => {
                const isFeeonFarm = steerVaults.find((vault) => {
                  const isVaultOnFarm = !!steerFarms?.find(
                    (farm: any) =>
                      farm.stakingToken.toLowerCase() ===
                      vault.address.toLowerCase(),
                  );
                  return (
                    isVaultOnFarm &&
                    vault.state !== SteerVaultState.Paused &&
                    vault.state !== SteerVaultState.Retired &&
                    vault.token0 &&
                    vault.token1 &&
                    currencyAAddress &&
                    currencyBAddress &&
                    ((vault.token0.address.toLowerCase() ===
                      currencyAAddress.toLowerCase() &&
                      vault.token1.address.toLowerCase() ===
                        currencyBAddress.toLowerCase()) ||
                      (vault.token0.address.toLowerCase() ===
                        currencyBAddress.toLowerCase() &&
                        vault.token1.address.toLowerCase() ===
                          currencyAAddress.toLowerCase())) &&
                    Number(vault.feeTier ?? '0') ===
                      Number(tier.id.split('-')[1]) * 10000
                  );
                });
                return (
                  <Box
                    key={tier.id}
                    className='feeSelectionItem'
                    onClick={() => onChangeFeeTier(tier)}
                    gridGap={12}
                  >
                    <Box
                      className={`feeTierCheck ${
                        tier.id === mintInfo.feeTier?.id
                          ? 'feeTierCheckSelected'
                          : ''
                      }`}
                    >
                      {tier.id === mintInfo.feeTier?.id && <Check />}
                    </Box>
                    <Box>
                      <Box mb={0.5} className='flex items-center' gridGap={8}>
                        <p>{tier.text}</p>
                        {isFeeonFarm && (
                          <Box className='feeTierFarm'>{t('farm')}</Box>
                        )}
                      </Box>
                      <p className='span text-secondary'>{tier.description}</p>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SelectFeeTier;
