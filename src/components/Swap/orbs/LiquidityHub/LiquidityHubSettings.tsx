import React from 'react';
import { useLiquidityHubManager } from 'state/user/hooks';
import { styled } from '@material-ui/styles';
import { Box, Divider } from '@material-ui/core';
import OrbsLogo from 'assets/images/orbs-logo.svg';
import { useTranslation } from 'react-i18next';
import ToggleSwitch from 'components/ToggleSwitch';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { useIsLiquidityHubSupported } from './hooks';
import { LIQUIDITY_HUB_WEBSITE, ORBS_WEBSITE } from '../consts';

export const LiquidityHubSettings = () => {
  const [
    liquidityHubDisabled,
    toggleLiquidityHubDisabled,
  ] = useLiquidityHubManager();
  const { t } = useTranslation();

  const isSupported = useIsLiquidityHubSupported();
  if (!isSupported) return null;

  return (
    <>
      <Box my={2.5} className='flex items-center justify-between'>
        <Container>
          <p>{t('disableLiquidityHub')}</p>
          <p className='bottom-text'>
            <a target='_blank' rel='noreferrer' href={LIQUIDITY_HUB_WEBSITE}>
              <img src={OrbsLogo} />
              {t('liquidityHub')}
            </a>
            , {t('poweredBy').toLowerCase()}{' '}
            <a href={ORBS_WEBSITE} target='_blank' rel='noreferrer'>
              Orbs
            </a>
            , {t('aboutLiquidityHub')}{' '}
            <a
              className='more-info'
              href={LIQUIDITY_HUB_WEBSITE}
              target='_blank'
              rel='noreferrer'
            >
              {t('forMoreInfo')}
            </a>
          </p>
        </Container>
        <ToggleSwitch
          toggled={liquidityHubDisabled}
          onToggle={toggleLiquidityHubDisabled}
        />
      </Box>
      <Divider />
    </>
  );
};

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  '& .bottom-text': {
    maxWidth: 500,
    fontSize: 14,
    lineHeight: '23px',
    '& img': {
      width: 22,
      height: 22,
      marginRight: 8,
      display: 'inline',
    },
    '& a': {
      textDecoration: 'none',
      fontWeight: 600,
      color: '#6381e9',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& .more-info': {
      color: 'inherit',
      fontWeight: 400,
      textDecoration: 'underline',
    },
  },
});
