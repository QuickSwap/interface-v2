import { Box } from '@material-ui/core';
import { DoubleCurrencyLogo, Logo } from 'components';
import {
  StyledButton,
  StyledCircle,
  StyledFilledBox,
  StyledLabel,
} from 'components/v3/Common/styledElements';
import React, { useState } from 'react';
import { ReactComponent as ExpandIcon } from 'assets/images/expand_circle.svg';
import { ReactComponent as ExpandIconUp } from 'assets/images/expand_circle_up.svg';
import ProfessorIcon from 'assets/images/professor.webp';
import QuickToken from 'assets/images/QsToken.webp';
import FarmCardDetail from './FarmCardDetail';
import { Deposit, UnfarmingInterface } from '../../models/interfaces';
import { IsActive } from './IsActive';
import Loader from 'components/Loader';
import { Token } from '@uniswap/sdk';

interface FarmCardProps {
  el: Deposit;
  unstaking: UnfarmingInterface;
  setUnstaking: any;
  withdrawHandler: any;
  setGettingReward: any;
  setEternalCollectReward: any;
  eternalCollectRewardHandler: any;
  claimRewardsHandler: any;
  eternalCollectReward: any;
  gettingReward: any;
}

export default function FarmCard({
  el,
  unstaking,
  setUnstaking,
  withdrawHandler,
  setGettingReward,
  setEternalCollectReward,
  eternalCollectRewardHandler,
  claimRewardsHandler,
  eternalCollectReward,
  gettingReward,
}: FarmCardProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <StyledFilledBox borderRadius='16px' mt={1.5} mb={1.5}>
      <Box
        className='flex justify-between items-center flex-wrap'
        height={80}
        borderRadius={10}
      >
        <Box className='flex justify-around' width='70%'>
          <Box className='flex items-center'>
            <Box mr={2}>
              <StyledCircle>{el.id}</StyledCircle>
            </Box>
            <Box className='flex-col' ml={0.5} mr={5}>
              <Box>
                <IsActive el={el} />
              </Box>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                <a
                  style={{ textDecoration: 'underline' }}
                  className={'c-w fs-075'}
                  href={`/#/pool/${+el.id}`}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  View position
                </a>
              </StyledLabel>
            </Box>
          </Box>

          <Box className='flex items-center'>
            <DoubleCurrencyLogo
              currency0={new Token(137, el.token0, 18, el.pool.token0.symbol)}
              currency1={new Token(137, el.token1, 18, el.pool.token1.symbol)}
              size={30}
            />
            <Box className='flex-col' ml={3}>
              <StyledLabel color='#696c80' fontSize='12px'>
                Pool
              </StyledLabel>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                {`${el.pool.token0.symbol} / ${el.pool.token1.symbol}`}
              </StyledLabel>
            </Box>
          </Box>

          <Box className='flex items-center' ml={3}>
            {false && (
              <>
                <img width='26px' height='32px' src={ProfessorIcon} />

                <Box className='flex-col' ml={1.5}>
                  <StyledLabel color='#696c80' fontSize='12px'>
                    Tier
                  </StyledLabel>

                  <StyledLabel color='#ebecf2' fontSize='14px'>
                    Professor
                  </StyledLabel>
                </Box>
              </>
            )}
          </Box>

          <Box className='flex items-center' ml={3}>
            {false && (
              <>
                <Logo srcs={[QuickToken]} size={'32px'} alt={`quick`} />
                <Box className='flex-col' ml={1.5}>
                  <StyledLabel color='#696c80' fontSize='12px'>
                    Locked
                  </StyledLabel>

                  <StyledLabel color='#ebecf2' fontSize='14px'>
                    5 Quick
                  </StyledLabel>
                </Box>
              </>
            )}
          </Box>
        </Box>

        <Box className='flex items-center'>
          {!el.eternalFarming && (
            <StyledButton
              height='40px'
              width='110px'
              onClick={() => {
                setUnstaking({ id: el.id, state: 'pending' });
                withdrawHandler(el.id);
              }}
            >
              {unstaking &&
              unstaking.id === el.id &&
              unstaking.state !== 'done' ? (
                <>
                  <Loader
                    size={'1rem'}
                    stroke={'var(--white)'}
                    style={{ margin: 'auto' }}
                  />
                  <StyledLabel color='#ebecf2' fontSize='14px'>
                    Withdrawing
                  </StyledLabel>
                </>
              ) : (
                <>
                  <StyledLabel color='#ebecf2' fontSize='14px'>
                    Withdraw
                  </StyledLabel>
                </>
              )}
            </StyledButton>
          )}

          <Box
            mr={2.5}
            ml={1.5}
            onClick={() => setShowMore(!showMore)}
            className='cursor-pointer'
          >
            {showMore ? <ExpandIconUp /> : <ExpandIcon />}
          </Box>
        </Box>
      </Box>
      <Box>
        {showMore && (
          <FarmCardDetail
            el={el}
            setGettingReward={setGettingReward}
            setEternalCollectReward={setEternalCollectReward}
            eternalCollectReward={eternalCollectReward}
            eternalCollectRewardHandler={eternalCollectRewardHandler}
            claimRewardsHandler={claimRewardsHandler}
            gettingReward={gettingReward}
          />
        )}
      </Box>
    </StyledFilledBox>
  );
}
