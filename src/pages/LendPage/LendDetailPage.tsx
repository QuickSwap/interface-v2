import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  withStyles,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Switch,
} from '@material-ui/core';

import styled from 'styled-components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  hideCell: {
    display: 'reverse',
    [breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

const LendDetailPage: React.FC = () => {
  const classes = useStyles();
  return (
    <Box width={'100%'}>
      <Box
        display={'flex'}
        justifyContent={'flex-start'}
        alignItems={'center'}
        gridGap={'20px'}
        flexWrap={'wrap'}
      >
        <svg
          data-name='Layer 2'
          xmlns='http://www.w3.org/2000/svg'
          width='28'
          height='28'
          viewBox='0 0 28 28'
        >
          <g data-name='invisible box'>
            <path data-name='Rectangle 20001' fill='none' d='M0 0h28v28H0z' />
          </g>
          <g data-name='Q3 icons'>
            <path
              data-name='Path 11780'
              d='m16.285 10.35-6.942 7a1.108 1.108 0 0 0 0 1.633l6.942 7a1.225 1.225 0 0 0 1.575.117 1.108 1.108 0 0 0 .117-1.75l-5.017-5.016h12.367a1.167 1.167 0 1 0 0-2.333H12.96l5.017-5.017a1.108 1.108 0 0 0-.117-1.75 1.225 1.225 0 0 0-1.575.117z'
              transform='translate(-3.744 -4.167)'
              fill='#448aff'
            />
          </g>
        </svg>
        <Box fontSize={'24px'} fontWeight={'bold'} color={'white'}>
          Quickswap Pool
        </Box>
        <Box display={'flex'} gridGap={'2px'}>
          <USDTIcon size={'24px'} />
          <USDTIcon size={'24px'} />
          <USDTIcon size={'24px'} />
          <USDTIcon size={'24px'} />
          <USDTIcon size={'24px'} />
          <Box
            bgcolor={'#32394c'}
            width={'24px'}
            height={'24px'}
            borderRadius={'100%'}
            display={'flex'}
            alignItems={'center'}
          >
            <Box ml={'1px'} mt={'-5px'} display={'flex'}>
              <USDTIcon size={'13px'} />
            </Box>
            <Box ml={'-4px'} mt={'5px'} display={'flex'}>
              <USDTIcon size={'13px'} />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        mt={'40px'}
        fontSize={'20px'}
        fontWeight={'700'}
        textAlign={'left'}
        color={'#ebecf2'}
      >
        Leverage assets you believe in
      </Box>
      <Box mt={'23px'} display={'flex'} gridGap={'24px'} flexWrap={'wrap'}>
        <Box
          flex={'1'}
          sx={{ minWidth: { xs: '55%', sm: '35%', md: '20%' } }}
          bgcolor={'#232734'}
          p={'24px'}
          borderRadius={'12px'}
        >
          <Box color={'#696c80'} fontSize={'14px'}>
            Total Supply
          </Box>
          <Box fontSize={'24px'} color={'white'}>
            $19.2M
          </Box>
        </Box>
        <Box
          flex={'1'}
          sx={{ minWidth: { xs: '55%', sm: '35%', md: '20%' } }}
          bgcolor={'#232734'}
          p={'24px'}
          borderRadius={'12px'}
        >
          <Box color={'#696c80'} fontSize={'14px'}>
            Total Borrowed
          </Box>
          <Box fontSize={'24px'} color={'white'}>
            $19.2M
          </Box>
        </Box>
        <Box
          flex={'1'}
          sx={{ minWidth: { xs: '55%', sm: '35%', md: '20%' } }}
          bgcolor={'#232734'}
          p={'24px'}
          borderRadius={'12px'}
        >
          <Box color={'#696c80'} fontSize={'14px'}>
            Liquidity
          </Box>
          <Box fontSize={'24px'} color={'white'}>
            $19.2M
          </Box>
        </Box>
        <Box
          flex={'1'}
          sx={{ minWidth: { xs: '55%', sm: '35%', md: '20%' } }}
          bgcolor={'#232734'}
          p={'24px'}
          borderRadius={'12px'}
        >
          <Box color={'#696c80'} fontSize={'14px'}>
            Pull Utilization
          </Box>
          <Box fontSize={'24px'} color={'white'}>
            $19.2M
          </Box>
        </Box>
      </Box>
      <Box
        mt={'24px'}
        flex={'1'}
        bgcolor={'#232734'}
        height={'40px'}
        borderRadius={'8px'}
        display={'flex'}
        alignItems={'center'}
      >
        <Box
          height={'100%'}
          paddingX={'25px'}
          display={'flex'}
          alignItems={'center'}
          borderRight={'1px solid #323548'}
        >
          <Box>Borrow limit</Box>
          <Box ml={'8px'}>
            <Box
              width={'16px'}
              height={'16px'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
              fontSize={'12px'}
              color={'#63687e'}
              border={'1px solid #63687e'}
              borderRadius={'100%'}
            >
              ?
            </Box>
          </Box>
        </Box>
        <Box
          flexGrow={'1'}
          paddingX={'30px'}
          display={'flex'}
          alignItems={'center'}
          gridGap={'24px'}
        >
          <Box>$0</Box>
          <Box
            flexGrow={'1'}
            position={'relative'}
            bgcolor={'#323548'}
            height={'5px'}
            borderRadius={'100px'}
            overflow={'hidden'}
          >
            <Box
              position={'absolute'}
              top={'0px'}
              left={'50%'}
              bgcolor={'#ebecf2'}
              width={'8px'}
              height={'100%'}
            />
            <Box
              position={'absolute'}
              top={'0px'}
              left={'60%'}
              bgcolor={'#fc615a'}
              width={'8px'}
              height={'100%'}
            />
          </Box>
          <Box>$0</Box>
        </Box>
      </Box>
      <Box
        mt={'24px'}
        display={'flex'}
        gridGap={'32px'}
        flexWrap={'wrap'}
        sx={{ flexDirection: { sm: 'column', md: 'row' } }}
      >
        <Box
          flex={'1'}
          borderRadius={'20px'}
          bgcolor={'#232734'}
          display={'flex'}
          flexDirection={'column'}
          sx={{ minWidth: { xs: '55%', sm: '35%' } }}
        >
          <Box
            height={'70px'}
            borderBottom={'solid 1px #32394d'}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Box
              px={'30px'}
              fontSize={'18px'}
              fontWeight={'500'}
              borderLeft={'4px solid #448aff'}
              lineHeight={'1'}
            >
              Supply
            </Box>
            <Box mr={'30px'} display={'flex'} fontSize={'14px'}>
              <Box color={'#c7cad9'}>Your Supply Balance:&nbsp;</Box>
              <Box color={'white'}>$0.00</Box>
            </Box>
          </Box>
          <Box display={'flex'}>
            <Table>
              <TableHead>
                <TableRow>
                  <MuiTableCell>
                    <Box p={'20px 24px'}>Asset / LTV</Box>
                  </MuiTableCell>
                  <MuiTableCell className={classes.hideCell}>
                    <Box
                      p={'20px 24px'}
                      display={'flex'}
                      justifyContent={'flex-end'}
                    >
                      Supply APY
                    </Box>
                  </MuiTableCell>
                  <MuiTableCell>
                    <Box
                      p={'20px 24px'}
                      display={'flex'}
                      justifyContent={'flex-end'}
                    >
                      Depositd
                    </Box>
                  </MuiTableCell>
                  <MuiTableCell>
                    <Box
                      p={'20px 24px'}
                      display={'flex'}
                      justifyContent={'flex-end'}
                    >
                      Collateral
                    </Box>
                  </MuiTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <MuiTableCell>
                    <Box
                      p={'20px 24px'}
                      display={'flex'}
                      alignItems={'center'}
                      gridGap={'16px'}
                    >
                      <Box display={'flex'} alignItems={'center'}>
                        <USDTIcon size={'36px'} />
                      </Box>
                      <Box
                        display={'flex'}
                        flexDirection={'column'}
                        gridGap={'4px'}
                      >
                        <Box fontSize={'14px'} color={'#ebecf2'}>
                          QUICK
                        </Box>
                        <Box fontSize={'13px'} color={'#696c80'}>
                          LTV: 65%
                        </Box>
                      </Box>
                    </Box>
                  </MuiTableCell>
                  <MuiTableCell>
                    <Box
                      p={'20px 24px'}
                      display={'flex'}
                      justifyContent={'flex-end'}
                    >
                      <Box
                        ml={'auto'}
                        display={'inline-flex'}
                        flexDirection={'column'}
                        gridGap={'4px'}
                        color={'#ebecf2'}
                      >
                        <Box fontSize={'14px'}>10.24%</Box>
                        <Box fontSize={'13px'}>
                          (12.3%
                          <USDTIcon size={'12px'} />)
                        </Box>
                      </Box>
                    </Box>
                  </MuiTableCell>
                  <MuiTableCell>
                    <Box
                      p={'20px 24px'}
                      display={'flex'}
                      justifyContent={'flex-end'}
                    >
                      <Box
                        display={'inline-flex'}
                        flexDirection={'column'}
                        gridGap={'4px'}
                      >
                        <Box fontSize={'14px'} color={'#ebecf2'}>
                          $0.00
                        </Box>
                        <Box fontSize={'13px'} color={'#696c80'}>
                          QUICK
                        </Box>
                      </Box>
                    </Box>
                  </MuiTableCell>
                  <MuiTableCell>
                    <Box
                      p={'20px 24px'}
                      display={'flex'}
                      justifyContent={'flex-end'}
                    >
                      <AntSwitch inputProps={{ 'aria-label': 'ant design' }} />
                    </Box>
                  </MuiTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    color: '#626683',
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#0fc676',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#1e463e',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: 'width 200px',
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: '#32394c',
    boxSizing: 'border-box',
  },
}));
const MuiTableCell = withStyles({
  root: {
    padding: '0px',
    borderBottom: 'none',
  },
})(TableCell);

interface IconProps {
  size?: any;
  color?: any;
}
const USDTIcon: React.FC<IconProps> = ({
  size = '1em',
  color = 'currentColor',
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 32 32'
    >
      <path
        data-name='Path 5433'
        d='M16 32A16 16 0 1 0 0 16a16 16 0 0 0 16 16z'
        fill='#2775c9'
      />
      <path
        data-name='Path 5434'
        d='M15.75 27.5a11.75 11.75 0 1 1 8.309-3.442A11.749 11.749 0 0 1 15.75 27.5zm-.7-16.11a2.58 2.58 0 0 0-2.45 2.47c0 1.21.74 2 2.31 2.33l1.1.26c1.07.25 1.51.61 1.51 1.22s-.77 1.21-1.77 1.21a1.9 1.9 0 0 1-1.8-.91.68.68 0 0 0-.61-.39h-.59a.35.35 0 0 0-.28.41 2.73 2.73 0 0 0 2.61 2.08v.84a.705.705 0 0 0 1.41 0v-.85a2.62 2.62 0 0 0 2.59-2.58c0-1.27-.73-2-2.46-2.37l-1-.22c-1-.25-1.47-.58-1.47-1.14s.6-1.18 1.6-1.18a1.64 1.64 0 0 1 1.59.81.8.8 0 0 0 .72.46h.47a.42.42 0 0 0 .31-.5 2.65 2.65 0 0 0-2.38-2v-.69a.7.7 0 0 0-1.41 0zm-8.11 4.36a8.79 8.79 0 0 0 6 8.33h.14a.45.45 0 0 0 .45-.45v-.21a.94.94 0 0 0-.58-.87 7.36 7.36 0 0 1 0-13.65.93.93 0 0 0 .58-.86v-.23a.42.42 0 0 0-.56-.4 8.79 8.79 0 0 0-6.03 8.34zm17.62 0a8.79 8.79 0 0 0-6-8.32h-.15a.47.47 0 0 0-.47.47v.15a1 1 0 0 0 .61.9 7.36 7.36 0 0 1 0 13.64 1 1 0 0 0-.6.89v.17a.47.47 0 0 0 .62.44 8.79 8.79 0 0 0 5.99-8.34z'
        fill='#fff'
      />
    </svg>
  );
};

export default LendDetailPage;
