import React, { useEffect, useState } from 'react';
import { IDerivedMintInfo, useV3MintActionHandlers } from 'state/mint/v3/hooks';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import './index.scss';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';

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
  const feeTiers: { [chainId in ChainId]: IFeeTier[] } = {
    [ChainId.MATIC]: [],
    [ChainId.MUMBAI]: [],
    [ChainId.DOGECHAIN]: [],
    [ChainId.DOEGCHAIN_TESTNET]: [],
    [ChainId.ZKTESTNET]: [],
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
  };
  const { onChangeFeeTier } = useV3MintActionHandlers(mintInfo.noLiquidity);
  const [feeSelectionShow, setFeeSelectionShow] = useState(false);

  useEffect(() => {
    if (!mintInfo.feeTier) {
      if (feeTiers[chainId].length > 0) {
        onChangeFeeTier(feeTiers[chainId][0]);
      } else {
        onChangeFeeTier({
          id: 'algebra-dynamic',
          text: 'Dynamic',
          description: t('bestForAllPair'),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintInfo.feeTier, chainId]);

  return (
    <Box>
      {feeTiers[chainId].length > 0 && (
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
                {feeTiers[chainId].map((tier) => (
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
