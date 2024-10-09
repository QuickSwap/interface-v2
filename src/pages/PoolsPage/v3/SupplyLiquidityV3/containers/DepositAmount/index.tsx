import { Box, ButtonBase, InputBase, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import token from '../../../../../../assets/tokenLogo/0xfa9343c3897324496a05fc75abed6bac29f8a40f.png';

interface DepositAmountProps {
  handleChange?: () => void;
}

const DepositAmount: React.FC<DepositAmountProps> = ({ handleChange }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');

  return (
    <div>
      <p style={{ marginBottom: '12px' }}>3. {t('depositAmount')}</p>

      <Box
        style={{
          padding: '16px',
          backgroundColor: '#282d3d',
          borderRadius: '16px',
          width: '100%',
        }}
      >
        <Box style={{ position: 'relative', marginBottom: '12px' }}>
          <InputBase
            type='text'
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
            }}
            style={{
              width: '100%',
              height: '24px',
              paddingRight: '80px',
            }}
          />
          <Box
            style={{
              position: 'absolute',
              right: 0,
              top: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <img src={token} alt='token' width={20} />
            <p style={{ fontSize: '16px', color: '#ccced9' }}>WBTC</p>
          </Box>
        </Box>
        <Box
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography style={{ color: '#666b80', fontSize: '14px' }}>
            $425.17
          </Typography>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Typography>
              <span style={{ color: '#666b80' }}>Balance: </span>2.03
            </Typography>
            <ButtonBase
              style={{
                backgroundColor: '#1761ec3a',
                color: '#448aff',
                padding: '2px 6px',
                borderRadius: '8px',
              }}
            >
              Max
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </div>
  );
};
export default DepositAmount;
