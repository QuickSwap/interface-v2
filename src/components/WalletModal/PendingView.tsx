import { AbstractConnector } from '@web3-react/abstract-connector';
import React from 'react';
import { Box } from 'theme/components';
import { GlobalConst, SUPPORTED_WALLETS } from 'constants/index';
import { injected } from 'connectors';
import Option from './Option';
import { useTranslation } from 'react-i18next';
import Loader from 'components/Loader';

interface PendingViewProps {
  connector?: AbstractConnector;
  error?: boolean;
  setPendingError: (error: boolean) => void;
  tryActivation: (connector: AbstractConnector) => void;
}

const PendingView: React.FC<PendingViewProps> = ({
  connector,
  error = false,
  setPendingError,
  tryActivation,
}) => {
  const { t } = useTranslation();
  const { ethereum } = window as any;
  const isMetamask = ethereum?.isMetaMask;
  const isBlockWallet = ethereum?.isBlockWallet;
  const isCypherD = ethereum?.isCypherD;
  const isBitKeep = ethereum?.isBitKeep;

  return (
    <Box className='pendingSection'>
      <Box className='flex items-center justify-center' margin='0 0 32px'>
        {error ? (
          <Box className='errorGroup'>
            <p>{t('errorConnect')}</p>
            <Box
              className='errorButton'
              onClick={() => {
                setPendingError(false);
                connector && tryActivation(connector);
              }}
            >
              {t('tryagain')}
            </Box>
          </Box>
        ) : (
          <>
            <Loader size='16px' />
            <p style={{ marginLeft: 12 }}>{t('initializing')}...</p>
          </>
        )}
      </Box>
      {Object.keys(SUPPORTED_WALLETS).map((key) => {
        const option = SUPPORTED_WALLETS[key];
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== GlobalConst.walletName.METAMASK) {
              return null;
            }
            if (
              !isMetamask &&
              option.name === GlobalConst.walletName.METAMASK
            ) {
              return null;
            }
            if (isBitKeep && option.name !== GlobalConst.walletName.BITKEEP) {
              return null;
            }
            if (!isBitKeep && option.name === GlobalConst.walletName.BITKEEP) {
              return null;
            }
            if (isCypherD && option.name !== GlobalConst.walletName.CYPHERD) {
              return null;
            }
            if (!isCypherD && option.name === GlobalConst.walletName.CYPHERD) {
              return null;
            }
            if (
              isBlockWallet &&
              option.name !== GlobalConst.walletName.BLOCKWALLET
            ) {
              return null;
            }
            if (
              !isBlockWallet &&
              option.name === GlobalConst.walletName.BLOCKWALLET
            ) {
              return null;
            }
          }
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              clickable={false}
              color={option.color}
              header={option.name}
              subheader={option.description}
              icon={option.iconName}
            />
          );
        }
        return null;
      })}
    </Box>
  );
};

export default PendingView;
