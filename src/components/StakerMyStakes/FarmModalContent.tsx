import { Box } from '@material-ui/core';
import React from 'react';
import {
  StyledButton,
  StyledCircle,
  StyledDarkBox,
  StyledEmptyDotCircle,
  StyledFilledBox,
  StyledLabel,
} from 'components/v3/Common/styledElements';
import { useTranslation } from 'react-i18next';

export default function FarmModalContent() {
  const { t } = useTranslation();

  return (
    <StyledDarkBox width={'100%'}>
      <Box>
        <Box className='flex flex-wrap'>
          <StyledFilledBox
            className='flex  justify-around items-center'
            height={84}
            width={243}
            ml={1}
            mr={1}
          >
            <StyledCircle>1249</StyledCircle>
            <Box className='flex-col'>
              <Box>
                <StyledLabel color='#696c80' fontSize='14px'>
                  Out of range
                </StyledLabel>
              </Box>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                View Positions
              </StyledLabel>
            </Box>
            <Box className='flex flex-col justify-start' mt={2} height='100%'>
              <StyledEmptyDotCircle></StyledEmptyDotCircle>
            </Box>
          </StyledFilledBox>

          <StyledFilledBox
            className='flex  justify-around items-center'
            height={84}
            width={243}
            active={true}
            ml={1}
            mr={1}
          >
            <StyledCircle>1249</StyledCircle>
            <Box className='flex-col'>
              <Box>
                <StyledLabel color='#696c80' fontSize='14px'>
                  Out of range
                </StyledLabel>
              </Box>

              <StyledLabel color='#ebecf2' fontSize='14px'>
                View Positions
              </StyledLabel>
            </Box>
            <Box className='flex flex-col justify-start' mt={2} height='100%'>
              <StyledEmptyDotCircle></StyledEmptyDotCircle>
            </Box>
          </StyledFilledBox>
        </Box>
        <Box mt={25} className='flex flex-wrap justify-between'>
          <StyledButton
            disabled={true}
            width='49%'
            onClick={() => {
              console.log('clicked');
            }}
          >
            {t('Approved')}
          </StyledButton>

          <StyledButton
            width='49%'
            onClick={() => {
              console.log('clicked');
            }}
          >
            {t('Deposit')}
          </StyledButton>
        </Box>
      </Box>
    </StyledDarkBox>
  );
}
