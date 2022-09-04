import React from 'react';
import { DoubleCurrencyLogo, Logo } from 'components';
import {
  StyledButton,
  StyledDarkBox,
  StyledFilledBox,
  StyledLabel,
} from 'components/v3/Common/styledElements';
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
import { ReactComponent as AddIcon } from 'assets/images/addIcon.svg';
import { Box } from '@material-ui/core';

interface EternalFarmCardProps {
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

export function EternalFarmCard({
  active,
  refreshing,
  farmHandler,
  now,
  event: {
    pool,
    rewardToken,
    bonusRewardToken,
    reward,
    bonusReward,
    apr,
    enterStartTime,
  } = {},
  eternal,
}: EternalFarmCardProps) {
  return (
    <Box>
      {refreshing && (
        <LoadingShim>
          <Loader size={'18px'} stroke={'white'} style={{ margin: 'auto' }} />
        </LoadingShim>
      )}
      {!refreshing && (
        <Box ml={1.5} mr={1.5} mt={3} mb={3}>
          <StyledFilledBox padding={1.5} width={336} className='flex flex-col'>
            <Box mb={1.5} className='flex justify-starts items-center'>
              <Box className='flex items-center'>
                <DoubleCurrencyLogo
                  currency0={
                    new Token(
                      ChainId.MATIC,
                      pool.token0.id,
                      Number(pool.token0.decimals),
                      pool.token0.symbol,
                    ) as WrappedCurrency
                  }
                  currency1={
                    new Token(
                      ChainId.MATIC,
                      pool.token1.id,
                      Number(pool.token1.decimals),
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
            {rewardToken && (
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
                        rewardToken.id,
                        Number(rewardToken.decimals),
                        rewardToken.symbol,
                      ) as WrappedCurrency
                    }
                    size={'30px'}
                  />

                  <Box className='flex-col' ml={1.5}>
                    <StyledLabel color='#696c80' fontSize='12px'>
                      Reward
                    </StyledLabel>
                    <StyledLabel color='#ebecf2' fontSize='14px'>
                      {rewardToken?.symbol}
                    </StyledLabel>
                  </Box>
                </Box>
              </StyledDarkBox>
            )}
            {bonusRewardToken && (
              <>
                <Box
                  className='flex justify-center'
                  mt={-1.5}
                  mb={-1.5}
                  zIndex={1}
                >
                  <AddIcon />
                </Box>
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
                          bonusRewardToken.id,
                          18,
                          bonusRewardToken.symbol,
                        ) as WrappedCurrency
                      }
                      size={'30px'}
                    />

                    <Box className='flex-col' ml={1.5}>
                      <StyledLabel color='#696c80' fontSize='12px'>
                        Bonus
                      </StyledLabel>
                      <StyledLabel color='#ebecf2' fontSize='14px'>
                        {bonusRewardToken.symbol}
                      </StyledLabel>
                    </Box>
                  </Box>
                </StyledDarkBox>
              </>
            )}

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
    </Box>
  );
}
