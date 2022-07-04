import React from 'react';
import { Box } from '@material-ui/core';
import 'components/styles/AddressInput.scss';
import { useTranslation } from 'react-i18next';
import {
  StyledBlueTag,
  StyledFilledBox,
  StyledGreenTag,
  StyledLabel,
} from './CommonStyledElements';
import { ReactComponent as RedDot } from 'assets/images/red_dot.svg';
import { ReactComponent as GreeenDot } from 'assets/images/green_dot.svg';
import { ReactComponent as Dot } from 'assets/images/dot.svg';

const RiskStatCard: React.FC = ({}) => {
  const { t } = useTranslation();

  return (
    <Box className='flex justify-between items-center' mt={2.5} mb={2.5}>
      <StyledFilledBox
        width={'50%'}
        height={64}
        className='flex flex-col justify-evenly items-center'
        mr={1}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <StyledLabel fontSize='13px'>Risk:</StyledLabel>
          <Box>
            <RedDot style={{ margin: 2 }} />
            <RedDot style={{ margin: 2 }} />
            <Dot style={{ margin: 2 }} />
            <Dot style={{ margin: 2 }} />
            <Dot style={{ margin: 2 }} />
          </Box>
        </Box>

        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <StyledLabel fontSize='13px'>Profit:</StyledLabel>
          <Box>
            <GreeenDot style={{ margin: 2 }} />
            <GreeenDot style={{ margin: 2 }} />
            <Dot style={{ margin: 2 }} />
            <Dot style={{ margin: 2 }} />
            <Dot style={{ margin: 2 }} />
          </Box>
        </Box>
      </StyledFilledBox>
      <StyledFilledBox
        width={'50%'}
        height={64}
        className='flex flex-col justify-evenly items-start'
        ml={1}
      >
        <StyledLabel style={{ marginLeft: 10 }} fontSize='13px'>
          Selected range status:
        </StyledLabel>

        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
            marginLeft: 10,
          }}
        >
          <StyledBlueTag style={{ marginRight: 10 }}>
            <StyledLabel fontSize='12px' color='#c7cad9'>
              0.05% Fee
            </StyledLabel>
          </StyledBlueTag>
          <StyledGreenTag>
            <StyledLabel fontSize='12px' color='#0fc679'>
              12.9% APR
            </StyledLabel>
          </StyledGreenTag>
        </Box>
      </StyledFilledBox>
    </Box>
  );
};

export default RiskStatCard;
