import React, { useEffect, useState } from 'react';
import { IDerivedMintInfo, useV3MintActionHandlers } from 'state/mint/v3/hooks';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import './index.scss';

export interface IFeeTier {
  id: string;
  text: string;
  selectPercent: number;
  description: string;
}

interface SelectFeeTierProps {
  mintInfo: IDerivedMintInfo;
}

const SelectFeeTier: React.FC<SelectFeeTierProps> = ({ mintInfo }) => {
  const { t } = useTranslation();
  const feeTiers: IFeeTier[] = [
    {
      id: 'uni-0.01',
      text: '0.01%',
      selectPercent: 87,
      description: t('bestForVeryStablePair'),
    },
    {
      id: 'uni-0.05',
      text: '0.05%',
      selectPercent: 2,
      description: t('bestForStablePair'),
    },
    {
      id: 'uni-0.3',
      text: '0.3%',
      selectPercent: 2,
      description: t('bestForMostPair'),
    },
    {
      id: 'uni-1',
      text: '1%',
      selectPercent: 2,
      description: t('bestForExoticPair'),
    },
    {
      id: 'algebra-dynamic',
      text: 'Dynamic',
      selectPercent: 2,
      description: 'Lorem ipsum dolor.',
    },
  ];
  const { onChangeFeeTier } = useV3MintActionHandlers(mintInfo.noLiquidity);
  const [feeSelectionShow, setFeeSelectionShow] = useState(false);

  useEffect(() => {
    if (!mintInfo.feeTier) {
      onChangeFeeTier(feeTiers[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintInfo.feeTier]);

  return (
    <Box>
      <small className='weight-600'>{t('selectFeeTier')}</small>
      <Box mt={2} className='feeTierWrapper'>
        <Box padding={1.5} className='flex justify-between items-center'>
          <Box className='flex flex-col items-start'>
            <p className='text-bold'>
              {mintInfo.feeTier?.text} {t('feeTier')}
            </p>
            <Box mt={0.5} className='feeSelectPercent'>
              <span>
                {mintInfo.feeTier?.selectPercent}% {t('select')}
              </span>
            </Box>
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
            {feeTiers.map((tier) => (
              <Box key={tier.id} className='feeSelectionItem'>
                <Box
                  className={`feeTierCheck ${
                    tier.id === mintInfo.feeTier?.id
                      ? 'feeTierCheckSelected'
                      : ''
                  }`}
                  onClick={() => onChangeFeeTier(tier)}
                >
                  {tier.id === mintInfo.feeTier?.id && <Check />}
                </Box>
                <Box ml={1.5}>
                  <Box mb={0.5} className='flex items-center'>
                    <p>{tier.text}</p>
                    <Box className='feeSelectPercent' ml={1}>
                      <span>
                        {tier.selectPercent}% {t('select')}
                      </span>
                    </Box>
                  </Box>
                  <p className='span text-secondary'>{tier.description}</p>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SelectFeeTier;
