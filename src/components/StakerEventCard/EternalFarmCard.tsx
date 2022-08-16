import { Box } from '@material-ui/core';
import { DoubleCurrencyLogo, Logo } from 'components';
import {
  StyledButton,
  StyledDarkBox,
  StyledFilledBox,
  StyledLabel,
} from 'components/v3/Common/styledElements';
import React from 'react';
import { ReactComponent as AddIcon } from 'assets/images/addIcon.svg';

export default function EternalFarm() {
  return (
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
              currency0={undefined}
              currency1={undefined}
              size={30}
            />

            <StyledLabel className='ml-1' fontSize='14px' color='##ebecf2'>
              QUICK-WETH
            </StyledLabel>
          </Box>
        </Box>

        <StyledDarkBox
          padding={1.5}
          className='flex items-center mt-1'
          height={56}
        >
          <Box className='flex'>
            <img width='26px' height='32px' src={''} />

            <Box className='flex-col' ml={1.5}>
              <StyledLabel color='#696c80' fontSize='12px'>
                Reward
              </StyledLabel>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                QUICK
              </StyledLabel>
            </Box>
          </Box>
        </StyledDarkBox>

        <Box className='flex justify-center' mt={-1.5} mb={-1.5} zIndex={1}>
          <AddIcon />
        </Box>

        <StyledDarkBox padding={1.5} className='flex items-center ' height={56}>
          <Box className='flex'>
            <img width='26px' height='32px' src={''} />

            <Box className='flex-col' ml={1.5}>
              <StyledLabel color='#696c80' fontSize='12px'>
                Bonus
              </StyledLabel>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                Matic
              </StyledLabel>
            </Box>
          </Box>
        </StyledDarkBox>

        <StyledDarkBox
          className='flex justify-between items-center mt-1'
          height={56}
          padding={1.5}
        >
          <StyledLabel color='#696c80' fontSize='12px'>
            Overall APR:
          </StyledLabel>

          <StyledLabel color='#0fc679' fontSize='14px'>
            124%
          </StyledLabel>
        </StyledDarkBox>

        <Box marginTop={2}>
          <StyledButton height='40px'>
            <StyledLabel color='#ebecf2' fontSize='14px'>
              Farm
            </StyledLabel>
          </StyledButton>
        </Box>
      </StyledFilledBox>
    </Box>
  );
}
