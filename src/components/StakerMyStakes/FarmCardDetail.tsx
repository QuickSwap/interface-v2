import React from 'react';
import { Box } from '@material-ui/core';
import { DoubleCurrencyLogo, Logo } from 'components';
import {
  StyledButton,
  StyledCircle,
  StyledDarkBox,
  StyledFilledBox,
  StyledLabel,
} from 'components/v3/Common/styledElements';

export default function FarmCardDetail() {
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
        <Box className='flex justify-center items-center' height='60%'>
          <StyledLabel color='#696c80' fontSize='14px'>
            No infinite farms for now
          </StyledLabel>
        </Box>
      </StyledDarkBox>
      <StyledDarkBox
        width='48%'
        height={218}
        padding={1.5}
        className='flex-col justify-center items-center'
      >
        <Box mb={2} className='flex justify-between items-center'>
          <StyledLabel fontSize='16px' color='#c7cad9'>
            Limit Farming
          </StyledLabel>
          <Box className='flex items-center'>
            <Box>
              <StyledLabel fontSize='14px' color='#696c80'>
                Tier Bonus:
              </StyledLabel>
            </Box>
            <StyledLabel fontSize='14px' color='#0fc679'>
              +50%
            </StyledLabel>
          </Box>
        </Box>

        {/* when no data  */}
        {false && (
          <StyledFilledBox
            className='flex justify-center items-center'
            height={91}
          >
            <StyledLabel color='#696c80' fontSize='14px'>
              No infinite farms for now
            </StyledLabel>
          </StyledFilledBox>
        )}
        {/* when data presnt */}
        {true && (
          <StyledFilledBox
            className='flex flex-col  justify-around  items-center'
            height={91}
          >
            <Box width='90%' className='flex justify-between'>
              <StyledLabel>Ended rewards</StyledLabel>
              <StyledLabel>Ended bonus</StyledLabel>
            </Box>
            <Box width='90%' className='flex justify-between'>
              <Box className='flex items-center'>
                <Logo srcs={['']} /> {' < 0.01 WMATIC'}
              </Box>
              <Box className='flex items-center'>
                {' '}
                <Logo srcs={['']} /> {'< 0.01 QUICK'}
              </Box>
            </Box>
          </StyledFilledBox>
        )}

        <Box marginTop={2}>
          <StyledButton height='40px'>
            <StyledLabel color='#ebecf2' fontSize='14px'>
              Claim & Withdraw
            </StyledLabel>
          </StyledButton>
        </Box>
      </StyledDarkBox>
    </Box>
  );
}
