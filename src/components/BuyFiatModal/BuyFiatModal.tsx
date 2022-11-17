import React, { useEffect, useRef, useState } from 'react';
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
  const onrampInstance = useRef<CBPayInstanceType>();
  const [openCoinbase, setOpenCoinbase] = useState(false);
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const { initTransak } = useInitTransak();
  const { t } = useTranslation();

  useEffect(() => {
    if (!account || !process.env.REACT_APP_COINBASE_APP_ID) return;
    if (openCoinbase) {
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
            console.log('event', event);
          },
          experienceLoggedIn: 'embedded',
          experienceLoggedOut: 'popup',
          closeOnExit: true,
          closeOnSuccess: true,
        },
        (_, instance) => {
          if (instance) {
            onrampInstance.current = instance;
          }
        },
      );
    } else {
      if (onrampInstance.current) {
        onrampInstance.current.destroy();
        onrampInstance.current = undefined;
      }
    }
    return () => {
      onrampInstance.current?.destroy();
    };
  }, [account, openCoinbase]);

  useEffect(() => {
    if (onrampInstance.current) {
      onrampInstance.current.open();
      setOpenCoinbase(false);
      onClose();
    }
  }, [onClose]);

  const buyWithCoinbase = () => {
    setOpenCoinbase(true);
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
          <Box className='buyButton' onClick={buyWithCoinbase}>
            {t('buy')}
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
