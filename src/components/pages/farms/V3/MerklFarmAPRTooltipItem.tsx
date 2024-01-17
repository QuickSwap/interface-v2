import { Box, Button } from '@mui/material';
import { useActiveWeb3React } from 'hooks';
import { useDefiEdgeRangeTitles } from 'hooks/v3/useDefiedgeStrategyData';
import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { formatNumber, getAllGammaPairs } from 'utils';
import styles from 'styles/pages/Farm.module.scss';

export const MerklFarmAPRTooltipItem: React.FC<{
  farm: any;
  token0?: string;
  token1?: string;
}> = ({ farm, token0, token1 }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const farmType = farm.label ? farm.label.split(' ')[0] : '';
  const defiEdgeFarmTitleData = useDefiEdgeRangeTitles(
    farmType === 'DefiEdge' ? [farm.almAddress] : [],
  );
  const defiEdgeFarmTitle = defiEdgeFarmTitleData[0]
    ? defiEdgeFarmTitleData[0].title
    : undefined;

  const farmTitle = useMemo(() => {
    if (farm.label) {
      if (farm.label.includes('Gamma')) {
        return (
          getAllGammaPairs(chainId).find(
            (item) =>
              item.address.toLowerCase() === farm.almAddress.toLowerCase(),
          )?.title ?? ''
        );
      } else if (farm.label.includes('DefiEdge')) {
        return defiEdgeFarmTitle ?? '';
      } else if (farm.label.includes('Steer')) {
        return farm.title;
      }
      return '';
    }
    return '';
  }, [chainId, defiEdgeFarmTitle, farm]);

  return (
    <Box>
      <Box className='flex items-center' gap='6px'>
        {farmTitle && (
          <Box
            className={`${styles.farmAPRTitleWrapper} ${
              farmTitle.toLowerCase() === 'narrow'
                ? 'bg-purple8'
                : farmTitle.toLowerCase() === 'wide'
                ? 'bg-blue12'
                : farmTitle.toLowerCase() === 'stable'
                ? 'bg-green4'
                : 'bg-gray32'
            }`}
          >
            <span className='text-bgColor'>{farmTitle}</span>
          </Box>
        )}
        <Box className={`${styles.farmAPRTitleWrapper} bg-textSecondary`}>
          <span className='text-gray32'>{farmType.toUpperCase()}</span>
        </Box>
      </Box>
      <Box mt='8px'>
        <small>{t('totalAPR')}</small>
        <h5 className='text-success'>
          {formatNumber(farm.poolAPR + farm.almAPR)}
          <small> %</small>
        </h5>
      </Box>
      <Box mt='4px'>
        <small>
          {t('poolAPR')}: {formatNumber(farm.poolAPR)}% + {t('rewardsAPR')}:{' '}
          {formatNumber(farm.almAPR)}%
        </small>
      </Box>
      <Box mt={2}>
        <Button
          className={styles.farmAPRGetLPButton}
          onClick={() => {
            let currencyStr = '';
            if (farmType && farmType.toUpperCase() === 'ICHI') {
              if (token0) {
                currencyStr += `currency=${token0}`;
              }
            } else {
              if (token0) {
                currencyStr += `currency0=${token0}`;
              }
              if (token1) {
                if (token0) {
                  currencyStr += '&';
                }
                currencyStr += `currency1=${token1}`;
              }
            }
            window.open(
              `#/pools${
                farmType && farmType.toUpperCase() === 'ICHI'
                  ? '/singleToken'
                  : ''
              }?${currencyStr}`,
              '_blank',
            );
          }}
        >
          {t('getLP')}
        </Button>
      </Box>
    </Box>
  );
};
