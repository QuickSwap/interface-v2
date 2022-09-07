import React from 'react';
import { Box } from '@material-ui/core';
import { CurrencyLogo } from 'components';
import {
  StyledButton,
  StyledDarkBox,
  StyledFilledBox,
} from 'components/v3/Common/styledElements';
import { useFarmingHandlers } from 'hooks/useStakerHandlers';
import { FarmingType } from 'models/enums';
import Loader from 'components/Loader';
import { formatReward } from 'utils/formatReward';
import { Token } from '@uniswap/sdk';

interface FarmCardDetailProps {
  el: any;
  setGettingReward: any;
  claimRewardsHandler: any;
  setEternalCollectReward: any;
  eternalCollectReward: any;
  eternalCollectRewardHandler: any;
  gettingReward: any;
}

export default function FarmCardDetail({
  el,
  setGettingReward,
  setEternalCollectReward,
  eternalCollectReward,
  gettingReward,
  claimRewardsHandler,
  eternalCollectRewardHandler,
}: FarmCardDetailProps) {
  const rewardToken = el.eternalRewardToken;
  const earned = el.eternalEarned;
  const bonusEarned = el.eternalBonusEarned;
  const bonusRewardToken = el.eternalBonusRewardToken;

  return (
    <Box
      className='flex justify-evenly items-center flex-wrap'
      marginBottom={2}
    >
      <StyledDarkBox padding={1.5} width={1} height={220}>
        <Box>
          <p>Infinite Farming</p>
        </Box>
        {!el.eternalFarming && (
          <Box className='flex justify-center items-center' height='60%'>
            <small className='text-secondary'>No infinite farms for now</small>
          </Box>
        )}
        {el.eternalFarming && (
          <>
            <StyledFilledBox mt={2} p={2}>
              <Box width={1} className='flex justify-between'>
                <small className='text-secondary'>Earned rewards</small>
                {bonusRewardToken && (
                  <small className='text-secondary'>Earned bonus</small>
                )}
              </Box>
              <Box mt={1} width={1} className='flex justify-between'>
                <Box className='flex items-center'>
                  <CurrencyLogo
                    size={'24px'}
                    currency={
                      new Token(137, rewardToken.id, 18, rewardToken.symbol)
                    }
                  />
                  <Box ml='6px'>
                    <p>{`${formatReward(earned)} ${rewardToken.symbol}`}</p>
                  </Box>
                </Box>
                {bonusRewardToken && (
                  <Box className='flex items-center'>
                    <CurrencyLogo
                      size={'24px'}
                      currency={
                        new Token(
                          137,
                          bonusRewardToken.id,
                          18,
                          bonusRewardToken.symbol,
                        )
                      }
                    />
                    <Box ml='6px'>
                      <p>{`${formatReward(bonusEarned)} ${
                        bonusRewardToken.symbol
                      }`}</p>
                    </Box>
                  </Box>
                )}
              </Box>
            </StyledFilledBox>

            <Box marginTop={2} className='flex justify-between items-center'>
              <StyledButton
                height='40px'
                width='49%'
                disabled={
                  (eternalCollectReward.id === el.id &&
                    eternalCollectReward.state !== 'done') ||
                  (el.eternalEarned == 0 && el.eternalBonusEarned == 0)
                }
                onClick={() => {
                  setEternalCollectReward({
                    id: el.id,
                    state: 'pending',
                  });
                  eternalCollectRewardHandler(el.id, { ...el });
                }}
              >
                {eternalCollectReward &&
                eternalCollectReward.id === el.id &&
                eternalCollectReward.state !== 'done' ? (
                  <>
                    <Loader size={'18px'} stroke={'var(--white)'} />
                    <Box ml='5px'>
                      <small>{'Claiming'}</small>
                    </Box>
                  </>
                ) : (
                  <small>Claim</small>
                )}
              </StyledButton>
              <StyledButton
                height='40px'
                width='49%'
                disabled={
                  gettingReward.id === el.id &&
                  gettingReward.farmingType === FarmingType.ETERNAL &&
                  gettingReward.state !== 'done'
                }
                onClick={() => {
                  setGettingReward({
                    id: el.id,
                    state: 'pending',
                    farmingType: FarmingType.ETERNAL,
                  });
                  claimRewardsHandler(el.id, { ...el }, FarmingType.ETERNAL);
                }}
              >
                {gettingReward &&
                gettingReward.id === el.id &&
                gettingReward.farmingType === FarmingType.ETERNAL &&
                gettingReward.state !== 'done' ? (
                  <>
                    <Loader size={'18px'} stroke={'var(--white)'} />
                    <Box ml='5px'>
                      <small>{' Undepositing'}</small>
                    </Box>
                  </>
                ) : (
                  <small>Undeposit</small>
                )}
              </StyledButton>
            </Box>
          </>
        )}
      </StyledDarkBox>
    </Box>
  );
}
