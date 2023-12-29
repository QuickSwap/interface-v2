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
import { useSteerVaults } from 'hooks/v3/useSteerData';
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
  };

  const feeTierQuery = parsedQuery?.feeTier;
  const feeTierIdQuery = feeTierQuery
    ? `uni-${Number(feeTierQuery) / 10000}`
    : undefined;
  const { onChangeFeeTier } = useV3MintActionHandlers(mintInfo.noLiquidity);
  const [feeSelectionShow, setFeeSelectionShow] = useState(false);

  const fees = feeTiers[chainId];
  const currencyAAddress =
    mintInfo.currencies[Field.CURRENCY_A]?.wrapped.address;
  const currencyBAddress =
    mintInfo.currencies[Field.CURRENCY_B]?.wrapped.address;
  const { data: steerVaults } = useSteerVaults(chainId);
  const feeForSteer = Number(
    steerVaults.find((vault) => {
      const lowerTick = Number(vault.lowerTick ?? 0);
      const upperTick = Number(vault.upperTick ?? 0);
      const currentTick = Number(vault.tick ?? 0);
      return (
        vault.state !== SteerVaultState.Paused &&
        vault.state !== SteerVaultState.Retired &&
        lowerTick < currentTick &&
        currentTick < upperTick &&
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
              <Box
                className='editFeeTier'
                onClick={() => setFeeSelectionShow(!feeSelectionShow)}
              >
                <small>{feeSelectionShow ? t('hide') : t('edit')}</small>
              </Box>
            </Box>
            {feeSelectionShow && (
              <Box className='feeSelectionWrapper'>
                {fees.map((tier) => (
                  <Box
                    key={tier.id}
                    className='feeSelectionItem'
                    onClick={() => onChangeFeeTier(tier)}
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
                    <Box ml={1.5}>
                      <Box mb={0.5} className='flex items-center'>
                        <p>{tier.text}</p>
                      </Box>
                      <p className='span text-secondary'>{tier.description}</p>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default SelectFeeTier;
