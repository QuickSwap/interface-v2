import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Box } from '@mui/material';
import styles from 'styles/pages/Calculator.module.scss';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factor]);

  return (
    <Box width='100%' mb={3}>
      <Box className={styles.heading}>{t('calculatorHeading')}</Box>
      <Box className={styles.boxWrapper}>
        <Box className={styles.calculatorContainer}>
          <Box className={`flex ${styles.currencyContainer}`}>
            <Box>
              <img
                src='/assets/images/Currency/ethereum-eth.svg'
                className={styles.currencyIcon}
              />
            </Box>
            <Box className={styles.mx2}>ETH</Box>

            <input
              className={styles.currencyInput}
              type='number'
              min={0.01}
              step={0.01}
              value={ethValue}
              onChange={(e) => {
                setEthValue(e.target.value);
                setLastChange('eth');
              }}
            />
            <Box className={styles.upDownContainer}>
              <img
                src='/assets/images/up-arrow.svg'
                className={styles.iconUp}
                onClick={incrementEth}
              />
              <img
                src='/assets/images/up-arrow.svg'
                className={styles.iconDown}
                onClick={decrementEth}
              />
            </Box>
          </Box>
          <Box>
            <img
              src='/assets/images/swap-icon.svg'
              className={styles.swapIcon}
            />
          </Box>
          <Box
            className={`flex ${styles.currencyContainer}`}
            style={{ height: '100%' }}
          >
            <Box>
              <img
                src='/assets/images/Currency/us-flag.svg'
                className='currency-icon'
              />
            </Box>
            <Box className={styles.mx2}>USD</Box>

            <input
              className={styles.currencyInput}
              type='number'
              min={0.01}
              step={0.5}
              value={usdValue}
              onChange={(e) => {
                setUsdValue(e.target.value);
                setLastChange('usd');
              }}
            />
            <Box className={styles.upDownContainer}>
              <img
                src='/assets/images/up-arrow.svg'
                className={styles.iconUp}
                onClick={incrementUsd}
              />
              <img
                src='/assets/images/up-arrow.svg'
                className={styles.iconDown}
                onClick={decrementUsd}
              />
            </Box>
          </Box>
          <Box>
            <Box
              className={`button ${styles.filledButton}`}
              onClick={handleOnConvert}
            >
              <small>{t('convert')}</small>
            </Box>
          </Box>
        </Box>
        <Box className={styles.subHeading}>0.01 ETH = {baseUsdValue} USD</Box>
      </Box>
    </Box>
  );
};
