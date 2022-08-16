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

export default function FarmCard() {
  const [showMore, setShowMore] = useState(false);

  return (
    <StyledFilledBox width='95%' borderRadius='16px' mt={1.5} mb={1.5}>
      <Box
        className='flex justify-between items-center flex-wrap'
        height={80}
        borderRadius={10}
      >
        <Box className='flex justify-around' width='70%'>
          <Box className='flex items-center'>
            <Box mr={2}>
              <StyledCircle>1845</StyledCircle>
            </Box>

            <Box className='flex-col' ml={0.5} mr={5}>
              <Box>
                <StyledLabel color='#696c80' fontSize='14px'>
                  Out of range
                </StyledLabel>
              </Box>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                View Positions
              </StyledLabel>
            </Box>
          </Box>

          <Box className='flex items-center'>
            <DoubleCurrencyLogo
              currency0={undefined}
              currency1={undefined}
              size={30}
            />
            <Box className='flex-col' ml={3}>
              <StyledLabel color='#696c80' fontSize='12px'>
                Pool
              </StyledLabel>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                QUICK/USDC
              </StyledLabel>
            </Box>
          </Box>

          {true && (
            <Box className='flex items-center' ml={3}>
              <img width='26px' height='32px' src={ProfessorIcon} />

              <Box className='flex-col' ml={1.5}>
                <StyledLabel color='#696c80' fontSize='12px'>
                  Tier
                </StyledLabel>

                <StyledLabel color='#ebecf2' fontSize='14px'>
                  Professor
                </StyledLabel>
              </Box>
            </Box>
          )}

          {true && (
            <Box className='flex items-center' ml={3}>
              <Logo srcs={[QuickToken]} size={'32px'} alt={`quick`} />
              <Box className='flex-col' ml={1.5}>
                <StyledLabel color='#696c80' fontSize='12px'>
                  Locked
                </StyledLabel>

                <StyledLabel color='#ebecf2' fontSize='14px'>
                  5 Quick
                </StyledLabel>
              </Box>
            </Box>
          )}
        </Box>

        <Box className='flex items-center'>
          <StyledButton height='40px' width='110px'>
            <StyledLabel color='#ebecf2' fontSize='14px'>
              Withdraw
            </StyledLabel>
          </StyledButton>

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
      <Box>{showMore && <FarmCardDetail />}</Box>
    </StyledFilledBox>
  );
}
