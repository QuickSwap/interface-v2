import React from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import Option from './Option';
import { useTranslation } from 'react-i18next';
import { Connection, getConnections } from 'connectors';
import { useWeb3React } from '@web3-react/core';
import { ChainId } from '@uniswap/sdk';

interface PendingViewProps {
  connection?: Connection;
  error?: boolean;
  setPendingError: (error: boolean) => void;
  tryActivation: (connector: Connection) => void;
}

const PendingView: React.FC<PendingViewProps> = ({
  connection,
  error = false,
  setPendingError,
  tryActivation,
}) => {
  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const localChainId = localStorage.getItem('localChainId');
  const chainIdToUse = chainId ?? Number(localChainId ?? ChainId.MATIC);
  const connections = getConnections(chainIdToUse);

  return (
    <Box className='pendingSection'>
      <Box className='flex items-center justify-center' mb={4}>
        {error ? (
          <Box className='errorGroup'>
            <p>{t('errorConnect')}</p>
            <Box
              className='errorButton'
              onClick={() => {
                setPendingError(false);
                connection && tryActivation(connection);
              }}
            >
              {t('tryagain')}
            </Box>
          </Box>
        ) : (
          <>
            <CircularProgress />
            <p style={{ marginLeft: 12 }}>{t('initializing')}...</p>
          </>
        )}
      </Box>
      {connections.map((option) => {
        if (connection && option.connector === connection.connector) {
          return (
            <Option
              id={`connect-${option.key}`}
              key={option.key}
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
