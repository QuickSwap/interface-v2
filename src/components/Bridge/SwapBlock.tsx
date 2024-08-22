import { Box, Button, ButtonBase, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import usdc from 'assets/images/Currency/USDC.svg';
import eth from 'assets/images/Currency/ethereum-eth.svg';
import { KeyboardArrowDown } from '@material-ui/icons';
import arrowDown from 'assets/images/icons/arrow-down.png';
import plus from 'assets/images/icons/plus-circle.svg';
import { InfomationHelper } from 'components/QuestionHelper';
import { ReactComponent as SettingsIcon } from 'assets/images/icons/cog-fill.svg';
import NumericalInput from 'components/NumericalInput';

interface SwapBlockProps {
  onConfirm: () => void;
}

const SwapBlock: React.FC<SwapBlockProps> = ({ onConfirm }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box
        style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
        sx={{ bgcolor: '#192338', padding: '16px' }}
      >
        <Typography
          style={{ color: '#fff', fontSize: '13px', marginBottom: '10px' }}
        >
          {t('from')}
        </Typography>
        <Box sx={{ display: 'flex', gridGap: '1px', width: '100%' }}>
          <Box
            style={{
              borderTopLeftRadius: '10px',
              borderBottomLeftRadius: '10px',
              width: '100%',
            }}
            sx={{ padding: '12px 16px', bgcolor: '#22314d' }}
          >
            <Typography
              style={{
                fontSize: '11px',
                color: '#6880a3',
                marginBottom: '6px',
              }}
            >
              {t('Token')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}>
              <img src={usdc} alt='usdc' width={'20px'} height={'20px'} />
              <Typography style={{ color: '#fff', fontSize: '16px' }}>
                {t('USDC')}
              </Typography>
              <KeyboardArrowDown />
            </Box>
          </Box>
          <Box
            style={{
              borderTopRightRadius: '10px',
              borderBottomRightRadius: '10px',
              width: 'fit-content',
            }}
            sx={{ padding: '12px 16px', bgcolor: '#22314d' }}
          >
            <Typography
              style={{
                fontSize: '11px',
                color: '#6880a3',
                marginBottom: '6px',
              }}
            >
              {t('Network')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}>
              <img src={eth} alt='usdc' width={'20px'} height={'20px'} />
              <Typography style={{ color: '#fff', fontSize: '16px' }}>
                {t('Ethereum')}
              </Typography>
              <KeyboardArrowDown />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className='exchangeSwap'>
        <Box
          onClick={() => {
            console.log('asdasd');
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            border: '2px solid #191b2e',
            bgcolor: '#232734',
          }}
        >
          {/* <AddLiquidityIcon /> */}
          <img src={arrowDown} alt='arrow down' width='12px' height='12px' />
        </Box>
      </Box>
      <Box
        style={{
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
        }}
        sx={{ bgcolor: '#192338', padding: '16px' }}
      >
        <Typography
          style={{ color: '#fff', fontSize: '13px', marginBottom: '10px' }}
        >
          {t('to')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gridGap: '1px',
            width: '100%',
            marginBottom: '24px',
          }}
        >
          <Box
            style={{
              borderTopLeftRadius: '10px',
              borderBottomLeftRadius: '10px',
              width: '100%',
            }}
            sx={{ padding: '12px 16px', bgcolor: '#22314d' }}
          >
            <Typography
              style={{
                fontSize: '11px',
                color: '#6880a3',
                marginBottom: '6px',
              }}
            >
              {t('Token')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}>
              <img src={usdc} alt='usdc' width={'20px'} height={'20px'} />
              <Typography style={{ color: '#fff', fontSize: '16px' }}>
                {t('USDC')}
              </Typography>
              <KeyboardArrowDown />
            </Box>
          </Box>
          <Box
            style={{
              borderTopRightRadius: '10px',
              borderBottomRightRadius: '10px',
              width: 'fit-content',
            }}
            sx={{ padding: '12px 16px', bgcolor: '#22314d' }}
          >
            <Typography
              style={{
                fontSize: '11px',
                color: '#6880a3',
                marginBottom: '6px',
              }}
            >
              {t('Network')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}>
              <img src={eth} alt='usdc' width={'20px'} height={'20px'} />
              <Typography style={{ color: '#fff', fontSize: '16px' }}>
                {t('Ethereum')}
              </Typography>
              <KeyboardArrowDown />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <Typography style={{ color: '#fff', fontSize: '13px' }}>
            {t('Total amount')}
          </Typography>
          <Typography style={{ color: '#6880a3', fontSize: '13px' }}>
            {t('Balance')} :{' '}
            <small style={{ color: '#fff' }}>124.59 USDC</small>
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            bgcolor: '#22314d',
            borderRadius: '10px',
            marginBottom: '16px',
          }}
        >
          <NumericalInput
            onUserInput={(val) => {
              console.log(val);
            }}
            value={0}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}>
            <ButtonBase
              style={{
                border: '1px solid #fff',
                borderRadius: '5px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 500,
              }}
            >
              MAX
            </ButtonBase>
            <Typography
              style={{ fontSize: '20px', fontWeight: 500, color: '#f6f6f9' }}
            >
              USDC
            </Typography>
          </Box>
        </Box>
        <Box
          style={{ cursor: 'pointer' }}
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '7px 12px',
            bgcolor: '#22314d',
            borderRadius: '10px',
            gridGap: '6px',
          }}
        >
          <img src={plus} alt='plus' width={'16px'} height={'16px'} />
          <Typography
            style={{ fontSize: '12px', fontWeight: 500, color: '#ccd8e8' }}
          >
            {t('addDestinationAddress')}
          </Typography>
        </Box>
      </Box>
      <Box
        mt={1.5}
        sx={{
          border: '1px solid #3a4769',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gridGap: '8px',
          marginBottom: '16px',
        }}
      >
        <Box className='summaryRow'>
          <Typography style={{ color: '#fff', fontSize: '13px' }}>
            {t('You will receive')} :
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}>
            <img src={usdc} alt='usdc' width={'20px'} height={'20px'} />
            <Typography style={{ color: '#fff', fontSize: '16px' }}>
              99.30 {t('USDC')}
            </Typography>
            <KeyboardArrowDown style={{ transform: 'rotate(180deg)' }} />
          </Box>
        </Box>
        <Box className='summaryRow'>
          <Box>
            <InfomationHelper text={t('slippageHelper')} />
            <small>{t('slippage')}</small>
          </Box>
          <Box
            onClick={() => {
              console.log('asdasd');
            }}
            className='swapSlippage'
          >
            <small>0.5%</small>
            <SettingsIcon />
          </Box>
        </Box>
        <Box className='summaryRow'>
          <Box>
            <InfomationHelper text={t('gas')} />
            <small>{t('gas')} </small>
          </Box>
          <Box>
            <small>0.099 MATIC</small>
          </Box>
        </Box>
        <Box className='summaryRow'>
          <Box>
            <InfomationHelper text={t('free')} />
            <small>{t('free')}</small>
          </Box>
          <Box>
            <small>$0.70</small>
          </Box>
        </Box>
        <Box className='summaryRow'>
          <Box>
            <InfomationHelper text={t('Gas cost')} />
            <small>{t('Gas cost')}</small>
          </Box>
          <Box>
            <small>0.01 MATIC</small>
          </Box>
        </Box>
      </Box>
      <Button
        style={{
          width: '100%',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
        }}
      >
        {t('confirm')}
      </Button>
    </Box>
  );
};
export default SwapBlock;
