import React, { useState } from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { CustomModal, DoubleCurrencyLogo } from 'components';
import { formatNumber } from 'utils';
import { useTranslation } from 'next-i18next';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { V3Farm } from './Farms';
import V3GammaFarmCardDetails from './V3GammaFarmCardDetails';
import V3SteerFarmCardDetails from './V3SteerFarmCardDetails';
import { FarmModal } from 'components/StakeModal';
import { FarmingType } from 'models/enums';
import styles from 'styles/pages/Farm.module.scss';

interface Props {
  farm: V3Farm;
}

export const V3PairFarmCard: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const [modalForPool, setModalForPool] = useState(null);
  const farmAsAny = farm as any;

  return (
    <Box
      width='100%'
      borderRadius='16px'
      className={`bg-secondary1 ${
        expanded ? 'border-primary' : 'border-secondary1'
      }`}
    >
      {farm.type === 'QuickSwap' && (
        <CustomModal
          modalWrapper={styles.farmModalWrapper}
          open={!!modalForPool}
          onClose={() => setModalForPool(null)}
        >
          {modalForPool && (
            <FarmModal
              event={modalForPool}
              closeHandler={() => setModalForPool(null)}
              farmingType={FarmingType.ETERNAL}
            />
          )}
        </CustomModal>
      )}

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
          <DoubleCurrencyLogo
            size={24}
            currency0={farm.token0}
            currency1={farm.token1}
          />
          <Box>
            <Box className='flex items-center' gap='5px'>
              <small>
                {farm.token0?.symbol}/{farm.token1?.symbol}
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
                <span className='text-gray32'>{farm.type.toUpperCase()}</span>
              </Box>
            </Box>
          </Box>
        </Box>
        {!isMobile && (
          <>
            <Box width='20%'>
              <p className='small text-secondary'>{t('tvl')}</p>
              <p className='small'>${formatNumber(farm.tvl)}</p>
            </Box>
            <Box width='20%'>
              <p className='small text-secondary'>{t('totalAPR')}</p>
              <Box className='flex items-center' gap='4px'>
                <p className='small text-success'>
                  {formatNumber(farm.poolAPR + farm.farmAPR)}%
                </p>
                <TotalAPRTooltip farmAPR={farm.farmAPR} poolAPR={farm.poolAPR}>
                  <img
                    src='/assets/images/aprHover.png'
                    alt='farm APR'
                    height={16}
                  />
                </TotalAPRTooltip>
              </Box>
            </Box>
          </>
        )}
        <Box width='10%' className='flex items-center justify-end'>
          {farm.type === 'QuickSwap' ? (
            <Button
              className={styles.farmCardButton}
              disabled={
                Number(farmAsAny.reward) === 0 &&
                Number(farmAsAny.bonusReward) === 0
              }
              onClick={() => setModalForPool(farmAsAny)}
            >
              {t('farm')}
            </Button>
          ) : expanded ? (
            <KeyboardArrowUp className='text-primary' />
          ) : (
            <KeyboardArrowDown />
          )}
        </Box>
      </Box>
      {expanded && farm.type === 'Gamma' && (
        <V3GammaFarmCardDetails data={farm} />
      )}
      {expanded && farm.type === 'Steer' && (
        <V3SteerFarmCardDetails data={farm} />
      )}
    </Box>
  );
};

export default V3PairFarmCard;
