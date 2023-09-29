import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@material-ui/core';
import { ReactComponent as EthIcon } from 'assets/images/Currency/ethereum-eth.svg';
import { ReactComponent as UsFlagIcon } from 'assets/images/Currency/us-flag.svg';
import { ReactComponent as SwapIcon } from 'assets/images/swap-icon.svg';
import { ReactComponent as UpArrowIcon } from 'assets/images/up-arrow.svg';

export const Calculator: React.FC<{ factor: number }> = ({ factor }) => {
  const { t } = useTranslation();
  const [ethValue, setEthValue] = useState<string | number>(0.01);
  const [usdValue, setUsdValue] = useState<string | number>('-');
  const [baseUsdValue, setBaseUsdValue] = useState('-');
  const [lastChange, setLastChange] = useState('eth');

  const incrementEth = () => {
    setLastChange('eth');
    const newValue = parseFloat(ethValue.toString()) + 0.01;
    setEthValue(newValue.toFixed(4));
  };

  const decrementEth = () => {
    setLastChange('eth');
    const newValue = Math.max(0.01, parseFloat(ethValue.toString()) - 0.01);
    setEthValue(newValue.toFixed(4));
  };

  const incrementUsd = () => {
    setLastChange('usd');
    const newValue = parseFloat(usdValue.toString()) + 0.5;
    setUsdValue(newValue.toFixed(4));
  };

  const decrementUsd = () => {
    setLastChange('usd');
    const newValue = Math.max(0.01, parseFloat(usdValue.toString()) - 0.5);
    setUsdValue(newValue.toFixed(4));
  };

  const handleOnConvert = () => {
    console.log('Handle on Convert');
    try {
      if (lastChange === 'eth') {
        const numEthValue = parseFloat(ethValue.toString());
        const newUsdValue = numEthValue * factor;
        setUsdValue(newUsdValue.toFixed(4));
      } else {
        const newUsdValue = parseFloat(usdValue.toString());
        const newEthValue = newUsdValue / factor;
        setEthValue(newEthValue.toFixed(4));
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (factor > 0) {
      const value = 0.01 * factor;
      setBaseUsdValue(value.toFixed(4));
      if (usdValue === '-') {
        handleOnConvert();
      }
    }
  }, [factor]);

  return (
    <Box width='100%' mb={3}>
      <Box className='heading'>{t('calculatorHeading')}</Box>
      <Box className='box-wrapper'>
        <Box className='calculatorContainer'>
          <Box className='flex currencyContainer'>
            <Box>
              <EthIcon className='currency-icon' />
            </Box>
            <Box className='mx-2'>ETH</Box>

            <input
              className='currency-input'
              type='number'
              min={0.01}
              step={0.01}
              value={ethValue}
              onChange={(e) => {
                setEthValue(e.target.value);
                setLastChange('eth');
              }}
            />
            <Box className='up-down-container'>
              <UpArrowIcon className='icon-up' onClick={incrementEth} />
              <UpArrowIcon className='icon-down' onClick={decrementEth} />
            </Box>
          </Box>
          <Box>
            <SwapIcon className='swap-icon' />
          </Box>
          <Box className='flex currencyContainer' style={{ height: '100%' }}>
            <Box>
              <UsFlagIcon className='currency-icon' />
            </Box>
            <Box className='mx-2'>USD</Box>

            <input
              className='currency-input'
              type='number'
              min={0.01}
              step={0.5}
              value={usdValue}
              onChange={(e) => {
                setUsdValue(e.target.value);
                setLastChange('usd');
              }}
            />
            <Box className='up-down-container'>
              <UpArrowIcon className='icon-up' onClick={incrementUsd} />
              <UpArrowIcon className='icon-down' onClick={decrementUsd} />
            </Box>
          </Box>
          <Box>
            <Box className='button filledButton' onClick={handleOnConvert}>
              <small>{t('convert')}</small>
            </Box>
          </Box>
        </Box>
        <Box className='sub-heading'>0.01 ETH = {baseUsdValue} USD</Box>
      </Box>
    </Box>
  );
};
