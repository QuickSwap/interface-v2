import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Token } from '@uniswap/sdk';
import { DoubleCurrencyLogo } from 'components';
import Link from 'next/link';
import { formatNumber } from 'utils';
import { ChevronDown, ChevronUp } from 'react-feather';
import GammaFarmCardDetails from '../GammaFarmCardDetails';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import Image from 'next/image';

const GammaFarmCard: React.FC<{
  data: any;
  rewardData: any;
  token0: Token | null;
  token1: Token | null;
  pairData: any;
}> = ({ data, rewardData, pairData, token0, token1 }) => {
  const { t } = useTranslation();
  const rewards: any[] =
    rewardData && rewardData['rewarders']
      ? Object.values(rewardData['rewarders'])
      : [];
  const [showDetails, setShowDetails] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const farmAPR =
    rewardData && rewardData['apr'] ? Number(rewardData['apr']) : 0;
  const poolAPR =
    data &&
    data['returns'] &&
    data['returns']['allTime'] &&
    data['returns']['allTime']['feeApr']
      ? Number(data['returns']['allTime']['feeApr'])
      : 0;

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
            {token0 && token1 && (
              <>
                <DoubleCurrencyLogo
                  currency0={token0}
                  currency1={token1}
                  size={30}
                />
                <Box ml='6px'>
                  <small className='weight-600'>{`${token0.symbol}/${token1.symbol} (${pairData.title})`}</small>
                  <Box className='cursor-pointer'>
                    <Link
                      href={`/pools?currency0=${token0.address}&currency1=${token1.address}`}
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
                {rewardData && (
                  <small className='weight-600'>
                    ${formatNumber(rewardData['stakedAmountUSD'])}
                  </small>
                )}
              </Box>
              <Box width='30%'>
                {rewards.map((reward, ind) => (
                  <div key={ind}>
                    {reward && Number(reward['rewardPerSecond']) > 0 && (
                      <small className='small weight-600'>
                        {formatNumber(reward.rewardPerSecond * 3600 * 24)}{' '}
                        {reward.rewardTokenSymbol} / {t('day')}
                      </small>
                    )}
                  </div>
                ))}
              </Box>
            </>
          )}

          {(!isMobile || !showDetails) && (
            <Box width={isMobile ? '30%' : '20%'} className='flex items-center'>
              <small className='text-success'>
                {formatNumber((poolAPR + farmAPR) * 100)}%
              </small>
              <Box ml={0.5} height={16}>
                <TotalAPRTooltip
                  farmAPR={farmAPR * 100}
                  poolAPR={poolAPR * 100}
                >
                  <Image
                    src='/assets/images/circleinfo.svg'
                    alt='info'
                    width={16}
                    height={16}
                  />
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
        <GammaFarmCardDetails
          data={data}
          pairData={pairData}
          rewardData={rewardData}
        />
      )}
    </Box>
  );
};

export default GammaFarmCard;
