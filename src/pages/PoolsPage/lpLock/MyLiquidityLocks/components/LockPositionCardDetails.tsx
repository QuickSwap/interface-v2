import React, { useCallback, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { useTranslation } from 'react-i18next';
import { LockInterface } from 'state/data/liquidityLocker';
import { useIsTransactionPending } from 'state/transactions/hooks';
import {
  ConfirmationModalContent,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { utils } from 'ethers';
dayjs.extend(utc);

const LockPositionCardDetails: React.FC<{ lock: LockInterface }> = ({ lock }) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const liquidityLocked = utils.formatUnits(
    lock.event.lockAmount,
    lock.liquidityContract.tokenDecimals,
  )

  const isLocked = dayjs.unix(lock.event.unlockTime) > dayjs()
  const withdrawn = lock?.event?.isWithdrawn

  //modal states
  const [claimConfirm, showClaimConfirm] = useState(false);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimHash, setClaimHash] = useState<
    string | undefined
  >(undefined);
  const isClaimPending = useIsTransactionPending(claimHash);
  const [claimErrorMessage, setClaimErrorMessage] = useState('');

  const claim = useCallback(() => {
    if (!account) return

    setClaiming(true);

    try {
      console.log('On click "CLAIM"')
    } catch (error) {
      setClaimErrorMessage(t('errorInTx'));
      console.error(error);
    } finally {
      setClaiming(false);
    }
  }, [account]);

  function modalHeader() {
    return (
      <>
        <Box mb={2} textAlign='left'>
          <p>{t('claimLpTokensHeader')}</p>
        </Box>
        <Box className='flex justify-center'>
          <Button
            fullWidth
            style={{ maxWidth: 300 }}
            size='large'
            onClick={claim}
          >
            {t('claim')}
          </Button>
        </Box>
      </>
    );
  }

  const dismissCollectConfirm = () => {
    showClaimConfirm(false);
    setClaimErrorMessage('');
  };

  return (
    <>
      {claimConfirm && (
        <TransactionConfirmationModal
          isOpen={claimConfirm}
          onDismiss={dismissCollectConfirm}
          attemptingTxn={claiming}
          txPending={isClaimPending}
          hash={claimHash}
          content={() =>
            claimErrorMessage ? (
              <TransactionErrorContent
                onDismiss={dismissCollectConfirm}
                message={claimErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('claimLpTokens')}
                onDismiss={dismissCollectConfirm}
                content={modalHeader}
              />
            )
          }
          pendingText=''
          modalContent={
            isClaimPending
              ? t('submittedTxCollectLpTokens')
              : t('successClaimdLpTokens')
          }
        />
      )}
      <Box className='lockPositionCardDetails'>
        <Box className='cardRow'>
          <small>{t('lockedLiquidity')}:</small>
          <small>{liquidityLocked}</small>
        </Box>
        <Box className='cardRow'>
          <small>
            {t('lockupPeriod')}:
          </small>
          <small>{`${dayjs.unix(lock.event.timeStamp).format('DD MMM YYYY')} - ${dayjs.unix(lock.event.unlockTime).format('DD MMM YYYY')}, ${dayjs.unix(lock.event.timeStamp).format('h:mm a')}`}</small>
        </Box>

        <Box className='lockButtonRow'>
          <Button
            variant='outlined'
            onClick={() =>
              console.log('Click "See more details"')
            }
          >
            <small>{t('seeMoreDetails')}</small>
          </Button>
          <Button
            variant='contained'
            disabled={withdrawn}
            onClick={() => 
              console.log('Click "Extend"')  
            }
          >
            <small>{t('extend')}</small>
          </Button>
          <Button
            variant='contained'
            /* disabled={isLocked} */
            onClick={() => 
              showClaimConfirm(true)
            }
          >
            <small>{t('claimTokens')}</small>
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default LockPositionCardDetails;
