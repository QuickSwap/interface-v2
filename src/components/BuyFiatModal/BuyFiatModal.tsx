import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon2.svg';
import Transak from 'assets/images/Transak.png';
import BinanceConnect from 'assets/images/binanceConnect.png';
import CoinbasePay from 'assets/images/coinbasePay.png';
import { CustomModal } from 'components';
import { useActiveWeb3React, useInitTransak } from 'hooks';
import 'components/styles/BuyFiatModal.scss';
import { useTranslation } from 'react-i18next';
import { CBPayInstanceType, initOnRamp } from '@coinbase/cbpay-js';
import { useWalletModalToggle } from 'state/application/hooks';

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
        <Box className='flex justify-between items-center'>
          <h6>{t('fiatProviders')}</h6>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box className='paymentBox'>
          <img src={BinanceConnect} alt='binance connect' />
          <Box className='buyButton' onClick={buyBinance}>
            {t('buy')}
          </Box>
        </Box>
        <Box className='paymentBox'>
          <img src={CoinbasePay} alt='coinbase pay' />
          <Box
            className={`buyButton ${
              account && !coinbaseReady ? 'disabled' : ''
            }`}
            onClick={buyWithCoinbase}
          >
            {account ? t('buy') : t('connectWallet')}
          </Box>
        </Box>
        <Box className='paymentBox'>
          <img src={Transak} alt='transak' />
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
