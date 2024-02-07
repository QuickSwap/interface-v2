import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { ExternalLink as LinkIcon } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { LockInterface } from 'state/data/liquidityLocker';
import { useIsTransactionPending } from 'state/transactions/hooks';
import {
  ConfirmationModalContent,
  NumericalInput,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigNumber, utils } from 'ethers';
import './index.scss';
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
  const [amount, setAmount] = useState(liquidityLocked)
  const [error, setError] = useState(false)

  // @Hassaan: claim logic here
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

  const onMax = () => {
    setAmount(liquidityLocked)
  }

  const onPercentageClick = (percentage: string) => {
    const formattedLiquidityLocked = BigNumber.from(lock.event.lockAmount)
    setAmount(utils.formatUnits(formattedLiquidityLocked.mul(BigNumber.from(percentage)).div(100), lock.liquidityContract.tokenDecimals))
  }

  const onSetAmount = (inputAmount: string) => { 
    setError(Number(inputAmount) > Number(liquidityLocked))
    setAmount(inputAmount)
  }

  const amountInputDisabled = useMemo(() => 
    Number(amount) === 0 || error
  ,[amount])

  const selectedAmountPercentage = useMemo(() => {
    const formattedLiquidityLocked = BigNumber.from(lock.event.lockAmount)
    const formatedAmount = utils.parseUnits(amount, lock.liquidityContract.tokenDecimals)

    return formatedAmount.mul(100).div(formattedLiquidityLocked).toString()
  } ,[amount])
  

  function modalHeader() {
    return (
      <>
        <Box mb={2} textAlign='left'>
          <p>{t('claimLpTokensHeader')}</p>
        </Box>
        <Box
          className={`inputWrapper${
            error ? ' errorInput' : ''
          }`}
        >
          <NumericalInput
            value={amount}
            align='left'
            placeholder='0.00'
            onUserInput={(val) => {
              onSetAmount(val);
            }}
          />
        </Box>
        {error && (
          <small className='text-error'>
            {t('insufficientBalance', { symbol: `${lock.pair.tokenSymbol}/${lock.token.tokenSymbol}` })}
          </small>
        )}
        <Box className='flex justify-between items-center flex-wrap' mt={1}>
          <Box mb={1} display='flex'>
            <small>{`${t('available')}:`}</small>
            <Box ml={0.5}>
              <small>{liquidityLocked}</small>
            </Box>
          </Box>
          <Box className='flex flex-wrap'>
            <Box className={`percentageWrapper${selectedAmountPercentage === '25' ? ' selectedPercentageWrapper' : ''}`} onClick={() => onPercentageClick('25')}>
              <small>25%</small>
            </Box>
            <Box className={`percentageWrapper${selectedAmountPercentage === '50' ? ' selectedPercentageWrapper' : ''}`} ml={1} onClick={() => onPercentageClick('50')}>
              <small>50%</small>
            </Box>
            <Box className={`percentageWrapper${selectedAmountPercentage === '75' ? ' selectedPercentageWrapper' : ''}`} ml={1} onClick={() => onPercentageClick('75')}>
              <small>75%</small>
            </Box>
            <Box className={`percentageWrapper${selectedAmountPercentage === '100' ? ' selectedPercentageWrapper' : ''}`} ml={1} onClick={onMax}>
              <small>{t('max')}</small>
            </Box>
          </Box>
        </Box>
        <Box mt={2} className='flex justify-center'>
          <Button
            className='claimButton'
            disabled={amountInputDisabled || error}
            fullWidth
            onClick={claim}
          >
            {t('withdrawLpTokens')}
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
          modalWrapper='modalWrapper'
          isTxWrapper={false}
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
            onClick={() => window.open('https://app.team.finance/liquidity-locks', '_blank')}
          >
            <Box className='linkButton'>
              <small>{t('seeMoreDetails')}</small>
              <LinkIcon size={20} />
            </Box>
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
