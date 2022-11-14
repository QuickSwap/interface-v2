import React from 'react';
import { CustomModal } from 'components';
import { useTranslation } from 'react-i18next';
import { generateOnRampURL } from '@coinbase/cbpay-js';
import { useActiveWeb3React } from 'hooks';

interface BuyWithCoinbasemodalProps {
  open: boolean;
  onClose: () => void;
}

const BuyWithCoinbasemodal: React.FC<BuyWithCoinbasemodalProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const appId = process.env.REACT_APP_COINBASE_APP_ID;
  const destinationWallets = account
    ? [
        {
          address: account,
          blockchains: ['polygon'],
        },
      ]
    : undefined;

  const urlParams =
    appId && destinationWallets
      ? {
          appId,
          destinationWallets,
        }
      : undefined;

  const url = urlParams ? generateOnRampURL(urlParams) : '';

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      background='#fff'
      overflow='hidden'
    >
      <div style={{ height: '100%', width: '100%', overflowY: 'auto' }}>
        {url && (
          <iframe
            title='buy with coinbase'
            allow='accelerometer; autoplay; camera; gyroscope; payment'
            frameBorder='0'
            height='600px'
            src={url}
            width='100%'
          >
            <p>{t('notSupportIframe')}</p>
          </iframe>
        )}
      </div>
    </CustomModal>
  );
};

export default BuyWithCoinbasemodal;
