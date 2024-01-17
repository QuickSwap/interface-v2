import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { DoubleCurrencyLogo } from 'components';
import { formatNumber, getTokenFromAddress } from 'utils';
import { useTranslation } from 'next-i18next';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { MerklPairFarmCardDetails } from './MerklPairFarmCardDetails';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import styles from 'styles/pages/Farm.module.scss';

interface Props {
  farm: any;
}

export const MerklPairFarmCard: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const farmType = farm.label.split(' ')[0];

  const tokenMap = useSelectedTokenList();
  const token0 = getTokenFromAddress(farm.token0, chainId, tokenMap, []);
  const token1 = getTokenFromAddress(farm.token1, chainId, tokenMap, []);

  const [expanded, setExpanded] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  return (
    <Box
      width='100%'
      borderRadius='16px'
      className={`bg-secondary1 ${
        expanded ? 'border-primary' : 'border-secondary1'
      }`}
    >
      <Box
        padding={2}
        className='flex cursor-pointer'
        width='100%'
        onClick={() => setExpanded(!expanded)}
      >
        <Box
          className='flex items-center'
          width={isMobile ? '90%' : '50%'}
          gap='8px'
        >
          <DoubleCurrencyLogo size={24} currency0={token0} currency1={token1} />
          <Box>
            <Box className='flex items-center' gap='5px'>
              <small>
                {token0?.symbol}/{token1?.symbol}
              </small>
              {farm.title && (
                <Box
                  className={`${styles.farmAPRTitleWrapper} ${
                    farm.title.toLowerCase() === 'narrow'
                      ? 'bg-purple8'
                      : farm.title.toLowerCase() === 'wide'
                      ? 'bg-blue12'
                      : farm.title.toLowerCase() === 'stable'
                      ? 'bg-green4'
                      : 'bg-gray32'
                  }`}
                >
                  <span className='text-bgColor'>{farm.title}</span>
                </Box>
              )}
              <Box className={`${styles.farmAPRTitleWrapper} bg-textSecondary`}>
                <span className='text-gray32'>{farmType.toUpperCase()}</span>
              </Box>
            </Box>
          </Box>
        </Box>
        {!isMobile && (
          <>
            <Box width='20%'>
              <p className='small text-secondary'>{t('tvl')}</p>
              <p className='small'>${formatNumber(farm.almTVL)}</p>
            </Box>
            <Box width='20%'>
              <p className='small text-secondary'>{t('totalAPR')}</p>
              <Box className='flex items-center' gap='4px'>
                <p className='small text-success'>
                  {formatNumber(farm.poolAPR + farm.almAPR)}%
                </p>
                <TotalAPRTooltip farmAPR={farm.almAPR} poolAPR={farm.poolAPR}>
                  <picture>
                    <img
                      src='/assets/images/aprHover.png'
                      alt='farm APR'
                      height={16}
                    />
                  </picture>
                </TotalAPRTooltip>
              </Box>
            </Box>
          </>
        )}
        <Box width='10%' className='flex items-center justify-end'>
          {expanded ? (
            <KeyboardArrowUp className='text-primary' />
          ) : (
            <KeyboardArrowDown />
          )}
        </Box>
      </Box>
      {expanded && (
        <MerklPairFarmCardDetails
          farm={{
            ...farm,
            token0,
            token1,
          }}
        />
      )}
    </Box>
  );
};

export default MerklPairFarmCard;
