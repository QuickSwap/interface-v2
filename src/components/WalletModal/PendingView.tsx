import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import Option from './Option';
import { useTranslation } from 'next-i18next';
import { Connection, getConnections } from 'connectors';
import styles from 'styles/components/WalletModal.module.scss';

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
  const connections = getConnections();

  return (
    <Box className={styles.pendingSection}>
      <Box className='flex items-center justify-center' mb={4}>
        {error ? (
          <Box className={styles.errorGroup}>
            <p>{t('errorConnect')}</p>
            <Box
              className={styles.errorButton}
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
            <CircularProgress size='16px' />
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
