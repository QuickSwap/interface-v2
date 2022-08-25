import React from 'react';
import { Lock } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import { useWalletModalToggle } from '../../state/application/hooks';
import { convertDateTime } from '../../utils/time';
import { getProgress } from '../../utils/getProgress';
import Loader from '../Loader';
import CurrencyLogo from '../CurrencyLogo';
import { LoadingShim } from './styled';
import { useMemo } from 'react';
import { Token } from '@uniswap/sdk-core';
import { WrappedCurrency } from '../../models/types';
import { formatAmountTokens } from 'utils/numbers';
import './index.scss';
import { Link } from 'react-router-dom';
import { ChainId } from '@uniswap/sdk';
import EternalFarm from './EternalFarmCard';
import { DoubleCurrencyLogo, Logo } from 'components';
import {
  StyledButton,
  StyledDarkBox,
  StyledFilledBox,
  StyledLabel,
} from 'components/v3/Common/styledElements';
import { ReactComponent as AddIcon } from 'assets/images/addIcon.svg';
import { Box } from '@material-ui/core';

interface FarmingEventCardProps {
  active?: boolean;
  now?: number;
  refreshing?: boolean;
  farmHandler?: () => void;
  event?: {
    id?: any;
    pool?: any;
    createdAtTimestamp?: string;
    rewardToken?: any;
    bonusRewardToken?: any;
    reward?: number;
    bonusReward?: number;
    startTime?: number;
    endTime?: number;
    enterStartTime?: number;
    apr?: number;
    locked?: boolean;
  };
  eternal?: boolean;
}

export function FarmingEventCard({
  active,
  refreshing,
  farmHandler,
  now,
  event: {
    pool,
    createdAtTimestamp,
    rewardToken,
    bonusRewardToken,
    reward,
    bonusReward,
    startTime,
    endTime,
    apr,
    locked,
    enterStartTime,
  } = {},
  eternal,
}: FarmingEventCardProps) {
  const { account } = useActiveWeb3React();
  const toggleWalletModal = useWalletModalToggle();

  const _startTime = useMemo(() => {
    if (!startTime) return [];

    const date = new Date(+startTime * 1000);

    return [convertDateTime(date), convertDateTime(date)];
  }, [startTime]);

  const _endTime = useMemo(() => {
    if (!endTime) return [];

    const date = new Date(+endTime * 1000);

    return [convertDateTime(date), convertDateTime(date)];
  }, [endTime]);

  const _enterTime = useMemo(() => {
    if (!enterStartTime) return [];

    const date = new Date(+enterStartTime * 1000);

    return [convertDateTime(date), convertDateTime(date)];
  }, [startTime]);

  const rewardList = useMemo(() => {
    if (!reward || !bonusReward) return;

    if (rewardToken.id === bonusRewardToken.id) {
      return [{ token: rewardToken, amount: +reward + +bonusReward }];
    }

    return [
      { token: rewardToken, amount: reward },
      { token: bonusRewardToken, amount: bonusReward },
    ];
  }, [reward, bonusReward, rewardToken, bonusRewardToken]);

  return (
    <>
      {refreshing && (
        <LoadingShim>
          <Loader size={'18px'} stroke={'white'} style={{ margin: 'auto' }} />
        </LoadingShim>
      )}
      {!refreshing && (
        <Box ml={1.5} mr={1.5}>
          <StyledFilledBox
            padding={1.5}
            width={336}
            // height={218}
            className='flex flex-col'
          >
            <Box mb={1.5} className='flex justify-starts items-center'>
              <Box className='flex items-center'>
                <DoubleCurrencyLogo
                  currency0={
                    new Token(
                      ChainId.MATIC,
                      pool.token0.id,
                      18,
                      pool.token0.symbol,
                    ) as WrappedCurrency
                  }
                  currency1={
                    new Token(
                      ChainId.MATIC,
                      pool.token1.id,
                      18,
                      pool.token1.symbol,
                    ) as WrappedCurrency
                  }
                  size={30}
                />

                <StyledLabel className='ml-1' fontSize='14px' color='##ebecf2'>
                  {`${pool.token0.symbol}/${pool.token1.symbol}`}
                </StyledLabel>
              </Box>
            </Box>

            {rewardList?.map((reward: any, i) => (
              <>
                <StyledDarkBox
                  padding={1.5}
                  className='flex items-center '
                  height={56}
                >
                  <Box className='flex'>
                    <CurrencyLogo
                      currency={
                        new Token(
                          ChainId.MATIC,
                          reward.token.id,
                          18,
                          reward.token.symbol,
                        ) as WrappedCurrency
                      }
                      size={'30px'}
                    />

                    <Box className='flex-col' ml={1.5}>
                      <StyledLabel color='#696c80' fontSize='12px'>
                        {reward.token.symbol}
                      </StyledLabel>
                      <StyledLabel color='#ebecf2' fontSize='14px'>
                        {formatAmountTokens(reward.amount, false)}
                      </StyledLabel>
                    </Box>
                  </Box>
                </StyledDarkBox>
                {i + 1 == rewardList.length && (
                  <Box
                    className='flex justify-center'
                    mt={-1.5}
                    mb={-1.5}
                    zIndex={1}
                  >
                    <AddIcon />
                  </Box>
                )}
              </>
            ))}

            <StyledDarkBox
              className='flex justify-between items-center mt-1'
              height={56}
              padding={1.5}
            >
              <StyledLabel color='#696c80' fontSize='12px'>
                Overall APR:
              </StyledLabel>
              <StyledLabel color='#0fc679' fontSize='14px'>
                {apr && apr > 0 && apr !== NaN ? Math.round(apr) : 'Unknown'}%
              </StyledLabel>
            </StyledDarkBox>

            <Box marginTop={2}>
              <StyledButton height='40px' onClick={farmHandler}>
                <StyledLabel color='#ebecf2' fontSize='14px'>
                  Farm
                </StyledLabel>
              </StyledButton>
            </Box>
          </StyledFilledBox>
        </Box>
      )}
    </>
  );
}
