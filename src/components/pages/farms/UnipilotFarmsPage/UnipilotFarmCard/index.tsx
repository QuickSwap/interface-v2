import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DoubleCurrencyLogo } from 'components';
import Link from 'next/link';
import { formatNumber } from 'utils';
import { ChevronDown, ChevronUp } from 'react-feather';
import UnipilotFarmCardDetails from '../UnipilotFarmCardDetails';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import { formatUnits } from 'ethers/lib/utils';
import { useUnipilotFarmAPR } from 'hooks/v3/useUnipilotFarms';

const UnipilotFarmCard: React.FC<{
  data: any;
  farmData: any;
}> = ({ data, farmData }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const rewardA =
    data.rewardRate && data.rewardRate.rateA && data.rewardRate.tokenA
      ? Number(
          formatUnits(data.rewardRate.rateA, data.rewardRate.tokenA.decimals),
        ) *
        24 *
        3600
      : 0;
  const rewardB =
    data.rewardRate && data.rewardRate.rateB && data.rewardRate.tokenB
      ? Number(
          formatUnits(data.rewardRate.rateB, data.rewardRate.tokenB.decimals),
        ) *
        24 *
        3600
      : 0;

  const vaultAPR = farmData ? Number(farmData['stats'] ?? 0) : 0;

  const farmAPR = useUnipilotFarmAPR(data);

  const totalAPR = vaultAPR + farmAPR;

  return (
    <Box
      width='100%'
      borderRadius='16px'
      className={`bg-secondary1${showDetails ? ' border-primary' : ''}`}
    >
      <Box padding={1.5} className='flex items-center'>
        <Box width='90%' className='flex items-center'>
          <Box
            width={isMobile ? (showDetails ? '100%' : '70%') : '30%'}
            className='flex items-center'
          >
            {data.token0 && data.token1 && (
              <>
                <DoubleCurrencyLogo
                  currency0={data.token0}
                  currency1={data.token1}
                  size={30}
                />
                <Box ml='6px'>
                  <small className='weight-600'>{`${data.token0.symbol}/${data.token1.symbol}`}</small>
                  <Box className='cursor-pointer'>
                    <Link
                      href={`/pools?currency0=${data.token0.address}&currency1=${data.token1.address}`}
                      target='_blank'
                      className='no-decoration'
                    >
                      <small className='text-primary'>{t('getLP')}↗</small>
                    </Link>
                  </Box>
                </Box>
              </>
            )}
          </Box>
          {!isMobile && (
            <>
              <Box width='20%' className='flex justify-between'>
                <small className='weight-600'>${formatNumber(data.tvl)}</small>
              </Box>
              <Box width='30%'>
                {rewardA > 0 && (
                  <div>
                    <small className='small weight-600'>
                      {formatNumber(rewardA)} {data.rewardRate.tokenA.symbol} /{' '}
                      {t('day')}
                    </small>
                  </div>
                )}
                {rewardB > 0 && (
                  <div>
                    <small className='small weight-600'>
                      {formatNumber(rewardB)} {data.rewardRate.tokenB.symbol} /{' '}
                      {t('day')}
                    </small>
                  </div>
                )}
              </Box>
            </>
          )}

          {(!isMobile || !showDetails) && (
            <Box width={isMobile ? '30%' : '20%'} className='flex items-center'>
              <small className='text-success'>{formatNumber(totalAPR)}%</small>
              <Box ml={0.5} height={16}>
                <TotalAPRTooltip
                  farmAPR={farmAPR}
                  poolAPR={vaultAPR}
                  poolAPRText={t('vaultAPR') ?? ''}
                >
                  <picture>
                    <img src='/assets/images/circleinfo.svg' alt={'arrow up'} />
                  </picture>
                </TotalAPRTooltip>
              </Box>
            </Box>
          )}
        </Box>

        <Box width='10%' className='flex justify-center'>
          <Box
            className='flex items-center justify-center cursor-pointer text-primary'
            width={20}
            height={20}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp /> : <ChevronDown />}
          </Box>
        </Box>
      </Box>
      {showDetails && (
        <UnipilotFarmCardDetails data={data} farmData={farmData} />
      )}
    </Box>
  );
};

export default UnipilotFarmCard;
