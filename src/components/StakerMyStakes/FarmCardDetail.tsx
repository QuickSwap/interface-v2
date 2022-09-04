import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { CurrencyLogo, DoubleCurrencyLogo, Logo } from 'components';
import {
  StyledButton,
  StyledCircle,
  StyledDarkBox,
  StyledFilledBox,
  StyledLabel,
} from 'components/v3/Common/styledElements';
import { useFarmingHandlers } from 'hooks/useStakerHandlers';
import { FarmingType } from 'models/enums';
import Loader from 'components/Loader';
import { formatReward } from 'utils/formatReward';
import { Token } from '@uniswap/sdk';

interface FarmCardDetailProps {
  el: any;
  setGettingReward: any;
  setEternalCollectReward: any;
  eternalCollectReward: any;
  gettingReward: any;
}

export default function FarmCardDetail({
  el,
  setGettingReward,
  setEternalCollectReward,
  eternalCollectReward,
  gettingReward,
}: FarmCardDetailProps) {
  const rewardToken = el.eternalRewardToken;
  const earned = el.eternalEarned;
  const bonusEarned = el.eternalBonusEarned;
  const bonusRewardToken = el.eternalBonusRewardToken;

  const { eternalCollectRewardHandler, claimRewardsHandler } =
    useFarmingHandlers() || {};

  return (
    <Box
      className='flex justify-evenly items-center flex-wrap'
      marginBottom={2}
    >
      <StyledDarkBox className='flex-col' width='48%' height={220}>
        <Box padding={1.5}>
          <StyledLabel fontSize='16px' color='#c7cad9'>
            Infinite Farming
          </StyledLabel>
        </Box>
        {!el.eternalFarming && (
          <Box className='flex justify-center items-center' height='60%'>
            <StyledLabel color='#696c80' fontSize='14px'>
              No infinite farms for now
            </StyledLabel>
          </Box>
        )}
        {true && (
          <StyledFilledBox
            className='flex flex-col  justify-around  items-center'
            height={91}
          >
            <Box width='90%' className='flex justify-between'>
              <StyledLabel>Ended rewards</StyledLabel>
              {bonusRewardToken && <StyledLabel>Ended bonus</StyledLabel>}
            </Box>
            <Box width='90%' className='flex justify-between'>
              <Box className='flex items-center'>
                <CurrencyLogo
                  size={'30px'}
                  currency={
                    new Token(137, rewardToken.id, 18, rewardToken.symbol)
                  }
                />{' '}
                {`${formatReward(earned)} ${rewardToken.symbol}`}
              </Box>
              {bonusRewardToken && (
                <Box className='flex items-center'>
                  {' '}
                  <CurrencyLogo
                    size={'30px'}
                    currency={
                      new Token(
                        137,
                        bonusRewardToken.id,
                        18,
                        bonusRewardToken.symbol,
                      )
                    }
                  />
                  {` ${formatReward(bonusEarned)} ${bonusRewardToken.symbol}`}
                </Box>
              )}
            </Box>
          </StyledFilledBox>
        )}
        <Box marginTop={2} className='flex justify-center items-center'>
          <StyledButton
            height='40px'
            width='48%'
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
                <StyledLabel color='#ebecf2' fontSize='14px'>
                  {' Claiming'}
                </StyledLabel>
              </>
            ) : (
              <StyledLabel color='#ebecf2' fontSize='14px'>
                Claim
              </StyledLabel>
            )}
          </StyledButton>
          <StyledButton
            height='40px'
            width='48%'
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
                <StyledLabel color='#ebecf2' fontSize='14px'>
                  {' Undepositing'}
                </StyledLabel>
              </>
            ) : (
              <StyledLabel color='#ebecf2' fontSize='14px'>
                Undeposit
              </StyledLabel>
            )}
          </StyledButton>
        </Box>
      </StyledDarkBox>
      <StyledDarkBox className='flex-col' width='48%' height={220}>
        <Box padding={1.5}>
          <StyledLabel fontSize='16px' color='#c7cad9'>
            Limit Farming
          </StyledLabel>
        </Box>
        <Box className='flex justify-center items-center' height='60%'>
          <StyledLabel color='#696c80' fontSize='14px'>
            No Limit farms for now
          </StyledLabel>
        </Box>
      </StyledDarkBox>
    </Box>
  );
}
