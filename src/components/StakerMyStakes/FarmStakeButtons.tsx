import React from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { useFarmingHandlers } from 'hooks/useStakerHandlers';
import { FarmingType } from 'models/enums';
import { useTranslation } from 'next-i18next';
import { useV3StakeData } from 'state/farms/hooks';

interface FarmCardDetailProps {
  el: any;
}

export default function FarmStakeButtons({ el }: FarmCardDetailProps) {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const isSmallDesktop = useMediaQuery(breakpoints.down('md'));

  const { v3Stake } = useV3StakeData();
  const { txType, selectedTokenId, txConfirmed, txError, selectedFarmingType } =
    v3Stake ?? {};

  const { eternalCollectRewardHandler, withdrawHandler, claimRewardsHandler } =
    useFarmingHandlers() || {};

  return (
    <>
      {!el.eternalFarming && (
        <Button
          fullWidth
          disabled={
            selectedTokenId === el.id &&
            txType === 'withdraw' &&
            !txConfirmed &&
            !txError
          }
          onClick={() => {
            withdrawHandler(el.id);
          }}
        >
          <small>
            {selectedTokenId === el.id &&
            txType === 'withdraw' &&
            !txConfirmed &&
            !txError
              ? t('withdrawing')
              : t('withdraw')}
          </small>
        </Button>
      )}
      {el.eternalFarming && (
        <Box width='100%' className='flex flex-wrap justify-between'>
          <Box my={0.5} width={!isMobile && isSmallDesktop ? '100%' : '49%'}>
            <Button
              fullWidth
              disabled={
                (selectedTokenId === el.id &&
                  txType === 'eternalCollectReward' &&
                  !txConfirmed &&
                  !txError) ||
                (el.eternalEarned == 0 && el.eternalBonusEarned == 0)
              }
              onClick={() => {
                eternalCollectRewardHandler(el.id, { ...el });
              }}
            >
              <small>
                {selectedTokenId === el.id &&
                txType === 'eternalCollectReward' &&
                !txConfirmed &&
                !txError
                  ? t('claiming')
                  : t('claim')}
              </small>
            </Button>
          </Box>
          <Box my={0.5} width={!isMobile && isSmallDesktop ? '100%' : '49%'}>
            <Button
              fullWidth
              disabled={
                selectedTokenId === el.id &&
                selectedFarmingType === FarmingType.ETERNAL &&
                txType === 'claimRewards' &&
                !txConfirmed &&
                !txError
              }
              onClick={() => {
                claimRewardsHandler(el.id, { ...el }, FarmingType.ETERNAL);
              }}
            >
              <small>
                {selectedTokenId === el.id &&
                selectedFarmingType === FarmingType.ETERNAL &&
                txType === 'claimRewards' &&
                !txConfirmed &&
                !txError
                  ? t('undepositing')
                  : t('undeposit')}
              </small>
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}
