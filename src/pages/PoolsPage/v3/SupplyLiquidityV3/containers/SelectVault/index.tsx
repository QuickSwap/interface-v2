import { Box, Grid, Typography } from '@material-ui/core';
import { color } from 'd3';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import token from '../../../../../../assets/tokenLogo/0xfa9343c3897324496a05fc75abed6bac29f8a40f.png';

interface SelectVaultProps {
  onChoose?: () => void;
}

const SelectVault: React.FC<SelectVaultProps> = ({ onChoose }) => {
  const [selectedVault, setSelectedVault] = useState('wbtc_usdt');
  const { t } = useTranslation();

  const vaultList = [
    {
      name: 'WBTC/USDT',
      feePercent: 0.18,
      apr: 89.34,
      icon: token,
      icon2: '/MATIC.png',
      value: 'wbtc_usdt',
    },
    {
      name: 'WBTC/MATIC',
      feePercent: 0.25,
      apr: 56.43,
      icon: token,
      icon2: '/MATIC.png',
      value: 'wbtc_matic',
    },
    {
      name: 'WBTC/WETH',
      feePercent: 0.25,
      apr: 34.43,
      icon: token,
      icon2: '/MATIC.png',
      value: 'wbtc_weth',
    },
  ];

  return (
    <div className='select_vault'>
      <p style={{ marginBottom: '12px' }}>2. {t('selectVault')}</p>

      <Grid
        container
        style={{
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 78px 0 20px',
        }}
      >
        <Grid>
          <Typography style={{ color: '#696c80', fontSize: '14px' }}>
            Pool
          </Typography>
        </Grid>
        <Grid>
          <Typography style={{ color: '#696c80', fontSize: '14px' }}>
            APR
          </Typography>
        </Grid>
      </Grid>

      {vaultList.map((item, index) => {
        const isSelected = item.value === selectedVault;
        return (
          <Grid
            key={index}
            container
            style={{
              backgroundColor: '#282d3d',
              padding: '20px 21px 20px 17px',
              border: 'solid 1px rgba(68, 138, 255, 0.8);',
              marginBottom: '12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={() => {
              setSelectedVault(item.value);
            }}
          >
            <Grid
              item
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {isSelected ? (
                <img src='/icons/pools/selected.svg' alt='' />
              ) : (
                <img src='/icons/pools/unselect.svg' alt='' />
              )}
              <img src={item.icon} alt='icon' width={20} />
              <img
                src={item.icon2}
                alt='icon'
                width={20}
                style={{ marginLeft: '-18px' }}
              />
              <Typography>{item.name}</Typography>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  backgroundColor: '#404557',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '12px',
                }}
              >
                {item.feePercent}% Fee
              </Box>
            </Grid>
            <Grid item>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gridGap: '4px' }}
              >
                <Typography style={{ color: '#0fc679' }}>
                  {item.apr}%
                </Typography>
                <img src='/icons/pools/star.webp' alt='star' width={20} />
              </Box>
            </Grid>
          </Grid>
        );
      })}
    </div>
  );
};
export default SelectVault;
