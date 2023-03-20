import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import HelpIcon from 'svgs/HelpIcon1.svg';
import { CustomModal } from 'components';
import { useActiveWeb3React, useInitTransak } from 'hooks';
import styles from 'styles/components/BuyFiatModal.module.scss';
import { useTranslation } from 'next-i18next';
import { CBPayInstanceType, initOnRamp } from '@coinbase/cbpay-js';
import { useWalletModalToggle } from 'state/application/hooks';
import Image from 'next/image';

interface BuyFiatModalProps {
  open: boolean;
  onClose: () => void;
  buyMoonpay: () => void;
  buyBinance: () => void;
}

const BuyFiatModal: React.FC<BuyFiatModalProps> = ({
  open,
  onClose,
  buyBinance,
}) => {
  const { account } = useActiveWeb3React();
  const [onrampInstance, setOnRampInstance] = useState<
    CBPayInstanceType | undefined
  >(undefined);
  const [coinbaseReady, setCoinbaseReady] = useState(false);
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const { initTransak } = useInitTransak();
  const toggleWalletModal = useWalletModalToggle();
  const { t } = useTranslation();

  useEffect(() => {
    if (!account || !process.env.REACT_APP_COINBASE_APP_ID || !open) return;

    if (!coinbaseReady) {
      initOnRamp(
        {
          appId: process.env.REACT_APP_COINBASE_APP_ID,
          widgetParameters: {
            destinationWallets: [
              {
                address: account,
                blockchains: ['polygon'],
              },
            ],
          },
          onSuccess: () => {
            console.log('success');
          },
          onExit: () => {
            console.log('exit');
          },
          onEvent: (event) => {
            console.log('evt', event);
          },
          experienceLoggedIn: 'embedded',
          experienceLoggedOut: 'embedded',
          closeOnExit: true,
          closeOnSuccess: true,
        },
        (_, instance) => {
          if (instance) {
            setOnRampInstance(instance);
            setCoinbaseReady(true);
          }
        },
      );
    }

    return () => {
      onrampInstance?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, open, coinbaseReady]);

  const buyWithCoinbase = () => {
    if (!account) {
      toggleWalletModal();
    } else if (onrampInstance) {
      onrampInstance.open();
      setCoinbaseReady(false);
    }
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box padding={3}>
        <Box className='flex items-center justify-between'>
          <h6>{t('fiatProviders')}</h6>
          <Close className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box className={styles.paymentBox}>
          <Image
            src='/assets/images/binanceConnect.png'
            alt='binance connect'
          />
          <Box className={styles.buyButton} onClick={buyBinance}>
            {t('buy')}
          </Box>
        </Box>
        <Box className={styles.paymentBox}>
          <Image src='/assets/images/coinbasePay.png' alt='coinbase pay' />
          <Box
            className={`${styles.buyButton} ${
              account && !coinbaseReady ? 'disabled' : ''
            }`}
            onClick={buyWithCoinbase}
          >
            {account ? t('buy') : t('connectWallet')}
          </Box>
        </Box>
        <Box className={styles.paymentBox}>
          <Image src='/assets/images/Transak.png' alt='transak' />
          <Box
            className='buyButton'
            onClick={() => {
              onClose();
              initTransak(account, mobileWindowSize);
            }}
          >
            {t('buy')}
          </Box>
        </Box>
        <Box mt={3} display='flex'>
          <Box display='flex' mt={0.3}>
            <HelpIcon />
          </Box>
          <Box ml={1.5} width='calc(100% - 32px)'>
            <small>{t('fiatServiceDesc')}</small>
          </Box>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default BuyFiatModal;
