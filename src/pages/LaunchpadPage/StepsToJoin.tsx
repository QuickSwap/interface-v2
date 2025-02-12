'use client';
import React from 'react';
import { Button, Box, Typography } from '@material-ui/core';
import TrustswapLogo from 'assets/images/launchpad/trustswap_logo_white.png';

const StepsToJoin: React.FC<{
  caseLaunch: number;
  openModal?: boolean;
  setOpenModal?: any;
}> = ({ caseLaunch, openModal, setOpenModal }) => {
  const steps = [
    {
      title: 'Connect Wallet',
      description:
        'Connect your Web3 wallet and, if you are not already on it, switch to the Polygon PoS network.',
      icon: (
        <svg
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M14.5 12H14.51M1 3V17C1 18.1046 1.89543 19 3 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5L3 5C1.89543 5 1 4.10457 1 3ZM1 3C1 1.89543 1.89543 1 3 1H15M15 12C15 12.2761 14.7761 12.5 14.5 12.5C14.2239 12.5 14 12.2761 14 12C14 11.7239 14.2239 11.5 14.5 11.5C14.7761 11.5 15 11.7239 15 12Z'
            stroke='#448AFF'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      ),
    },
    {
      title: 'Complete KYC',
      description:
        'To confirm your eligibility for participation in launchpad projects, please complete the KYC (Know Your Customer) process.',
      icon: (
        <svg
          width='22'
          height='22'
          viewBox='0 0 22 22'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M15 4L17 6L21 2M21 11V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H5.8C4.11984 21 3.27976 21 2.63803 20.673C2.07354 20.3854 1.6146 19.9265 1.32698 19.362C1 18.7202 1 17.8802 1 16.2V5.8C1 4.11984 1 3.27976 1.32698 2.63803C1.6146 2.07354 2.07354 1.6146 2.63803 1.32698C3.27976 1 4.11984 1 5.8 1H11M1.14551 18.9263C1.61465 17.2386 3.16256 16 4.99977 16H11.9998C12.9291 16 13.3937 16 13.7801 16.0769C15.3669 16.3925 16.6073 17.6329 16.9229 19.2196C16.9998 19.606 16.9998 20.0707 16.9998 21M13 8.5C13 10.7091 11.2091 12.5 9 12.5C6.79086 12.5 5 10.7091 5 8.5C5 6.29086 6.79086 4.5 9 4.5C11.2091 4.5 13 6.29086 13 8.5Z'
            stroke='#448AFF'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      ),
    },
    {
      title: 'Lottery Participation',
      description:
        'After KYC is approved, you can whitelist for your desired QuickLaunches and automatically enter the launch lottery.',
      icon: (
        <svg
          width='22'
          height='18'
          viewBox='0 0 22 18'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M9 5V4M9 9.5V8.5M9 14V13M4.2 1H17.8C18.9201 1 19.4802 1 19.908 1.21799C20.2843 1.40973 20.5903 1.71569 20.782 2.09202C21 2.51984 21 3.0799 21 4.2V5.5C19.067 5.5 17.5 7.067 17.5 9C17.5 10.933 19.067 12.5 21 12.5V13.8C21 14.9201 21 15.4802 20.782 15.908C20.5903 16.2843 20.2843 16.5903 19.908 16.782C19.4802 17 18.9201 17 17.8 17H4.2C3.0799 17 2.51984 17 2.09202 16.782C1.71569 16.5903 1.40973 16.2843 1.21799 15.908C1 15.4802 1 14.9201 1 13.8V12.5C2.933 12.5 4.5 10.933 4.5 9C4.5 7.067 2.933 5.5 1 5.5V4.2C1 3.0799 1 2.51984 1.21799 2.09202C1.40973 1.71569 1.71569 1.40973 2.09202 1.21799C2.51984 1 3.0799 1 4.2 1Z'
            stroke='#448AFF'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      ),
    },
    {
      title: 'Contribute funds',
      description:
        'When you win the lottery you can contribute the allocated funds via the dashboard and wait for the IDO date to start claiming your tokens.',
      icon: (
        <svg
          width='22'
          height='22'
          viewBox='0 0 22 22'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M5 5L7 3M7 3L5 1M7 3H5C2.79086 3 1 4.79086 1 7M17 17L15 19M15 19L17 21M15 19H17C19.2091 19 21 17.2091 21 15M9.18903 5.5C9.85509 2.91216 12.2042 1 15 1C18.3137 1 21 3.68629 21 7C21 9.79574 19.0879 12.1449 16.5001 12.811M13 15C13 18.3137 10.3137 21 7 21C3.68629 21 1 18.3137 1 15C1 11.6863 3.68629 9 7 9C10.3137 9 13 11.6863 13 15Z'
            stroke='#448AFF'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      ),
    },
  ];

  const handleClick = () => {
    setOpenModal(!openModal);
  };
  return (
    <Box className='section stepsToJoin'>
      <Box className='cover_title'>
        <Typography className='title2' style={{ color: '#f6f6f9' }}>
          Getting Started
        </Typography>
      </Box>
      <Box className='cover_sub_title'>
        <Typography
          className='subTitle'
          style={{
            color: '#ccd8e7',
          }}
        >
          Participate in your first launchpad in 4 simple steps.
        </Typography>
      </Box>
      <Box className='step_list'>
        {steps.map((step, index) => {
          return (
            <Box key={index}>
              <Box className='step_item'>
                <Box className='step_item_icon'>{step.icon}</Box>
                <Box>
                  <Typography className='subTitle'>{step.title}</Typography>
                  <Typography className='desc'>{step.description}</Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box className='mx-auto'>
        <Button
          className='bg-blue1 p get_started_btn'
          onClick={() => {
            handleClick;
          }}
        >
          {caseLaunch !== 0
            ? 'Get started now'
            : 'I’m Interested - Keep Me Updated'}
        </Button>
      </Box>
    </Box>
  );
};

export default StepsToJoin;
