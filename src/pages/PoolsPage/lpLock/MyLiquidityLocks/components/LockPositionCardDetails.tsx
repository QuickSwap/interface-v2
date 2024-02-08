import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, TextField } from '@material-ui/core';
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

  // claim modal states
  const [claimConfirm, showClaimConfirm] = useState(false);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimHash, setClaimHash] = useState<
    string | undefined
  >(undefined);
  const isClaimPending = useIsTransactionPending(claimHash);
  const [claimErrorMessage, setClaimErrorMessage] = useState('');
  const [amount, setAmount] = useState(liquidityLocked)
  const [errorAmount, setErrorAmount] = useState(false)

  // extend modal states
  const [extendConfirm, showExtendConfirm] = useState(false);
  const [extending, setExtending] = useState<boolean>(false);
  const [extendHash, setExtendHash] = useState<
    string | undefined
  >(undefined);
  const isExtendPending = useIsTransactionPending(extendHash);
  const [extendErrorMessage, setExtendErrorMessage] = useState('');
  const [extendDate, setExtendDate] = useState(dayjs.unix(lock.event.unlockTime).add(3, 'month'))
  const [errorExtendDate, setErrorExtendDate] = useState(false)
  const [selectedExtendDate, setSelectedExtendDate] = useState('3M')

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

  // @Hassaan: extend logic here
  const extend = useCallback(() => {
    if (!account) return

    console.log('extendDate', extendDate) // dayjs object

    setExtending(true);

    try {
      console.log('On click "EXTEND"')
    } catch (error) {
      setExtendErrorMessage(t('errorInTx'));
      console.error(error);
    } finally {
      setExtending(false);
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
    setErrorAmount(Number(inputAmount) > Number(liquidityLocked))
    setAmount(inputAmount)
  }

  const onChangeDate = (e: string) => {
    setExtendDate(dayjs(e));
    setSelectedExtendDate('')
  };

  const addMonths = (months: number) => {
    const newDate = dayjs.unix(lock.event.unlockTime).add(months, 'month')
    setExtendDate(newDate);
    setSelectedExtendDate(`${months}M`)
  }

  const addYears = (years: number) => {
    const newDate = dayjs.unix(lock.event.unlockTime).add(years, 'year')
    setExtendDate(newDate);
    setSelectedExtendDate(`${years}Y`)
  }

  const amountInputDisabled = useMemo(() => 
    Number(amount) === 0 || errorAmount
  ,[amount])

  const selectedAmountPercentage = useMemo(() => {
    const formattedLiquidityLocked = BigNumber.from(lock.event.lockAmount)
    const formatedAmount = utils.parseUnits(amount, lock.liquidityContract.tokenDecimals)

    return formatedAmount.mul(100).div(formattedLiquidityLocked).toString()
  } ,[amount])

  function modalHeaderClaim() {
    return (
      <>
        <Box mb={2} textAlign='left'>
          <p>{t('claimLpTokensHeader')}</p>
        </Box>
        <Box
          className={`inputWrapper${
            errorAmount ? ' errorInput' : ''
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
        {errorAmount && (
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
            disabled={amountInputDisabled || errorAmount}
            fullWidth
            onClick={claim}
          >
            {t('withdrawLpTokens')}
          </Button>
        </Box>
      </>
    );
  }

  function modalHeaderExtend() {
    return (
      <>
        <Box mb={2} textAlign='left'>
          <p>{t('extendLockHeader')}</p>
        </Box>
        <Box
          className={`inputWrapper${
            errorAmount ? ' errorInput' : ''
          }`}
        >
          <TextField
            fullWidth
            label="Lock until"
            type="datetime-local"
            value={extendDate.format('YYYY-MM-DDTHH:mm')}
            onChange={(e)=> onChangeDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: new Date((lock.event.unlockTime) * 1000).toISOString().slice(0, 16),
            }}
          />
        </Box>
        {errorExtendDate && (
          <small className='text-error'>
            {t('invalidDate')}
          </small>
        )}
        <Box className='flex flex-wrap items-center flex-wrap' mt={1}>
          <Box className={`percentageWrapper${selectedExtendDate === '3M' ? ' selectedPercentageWrapper' : ''}`} onClick={() => addMonths(3)}>
            <small>3M</small>
          </Box>
          <Box className={`percentageWrapper${selectedExtendDate === '6M' ? ' selectedPercentageWrapper' : ''}`} onClick={() => addMonths(6)} ml={1}>
            <small>6M</small>
          </Box>
          <Box className={`percentageWrapper${selectedExtendDate === '9M' ? ' selectedPercentageWrapper' : ''}`} onClick={() => addMonths(9)} ml={1}>
            <small>9M</small>
          </Box>
          <Box className={`percentageWrapper${selectedExtendDate === '1Y' ? ' selectedPercentageWrapper' : ''}`} onClick={() => addYears(1)} ml={1}>
            <small>1Y</small>
          </Box>
          <Box className={`percentageWrapper${selectedExtendDate === '2Y' ? ' selectedPercentageWrapper' : ''}`} onClick={() => addYears(2)} ml={1}>
            <small>2Y</small>
          </Box>
          <Box className={`percentageWrapper${selectedExtendDate === '5Y' ? ' selectedPercentageWrapper' : ''}`} onClick={() => addYears(5)} ml={1}>
            <small>5Y</small>
          </Box>
        </Box>
        <Box mt={2} className='flex justify-center'>
          <Button
            className='claimButton'
            disabled={errorExtendDate}
            fullWidth
            onClick={extend}
          >
            {t('extendLock')}
          </Button>
        </Box>
      </>
    );
  }

  const dismissClaimConfirm = () => {
    showClaimConfirm(false);
    setClaimErrorMessage('');
  };

  const dismissExtendConfirm = () => {
    showExtendConfirm(false);
    setExtendErrorMessage('');
  };

  return (
    <>
      {claimConfirm && (
        <TransactionConfirmationModal
          modalWrapper='modalWrapper'
          isTxWrapper={false}
          isOpen={claimConfirm}
          onDismiss={dismissClaimConfirm}
          attemptingTxn={claiming}
          txPending={isClaimPending}
          hash={claimHash}
          content={() =>
            claimErrorMessage ? (
              <TransactionErrorContent
                onDismiss={dismissClaimConfirm}
                message={claimErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('claimLpTokens')}
                onDismiss={dismissClaimConfirm}
                content={modalHeaderClaim}
              />
            )
          }
          pendingText=''
          modalContent={
            isClaimPending
              ? t('submittedTxClaimLpTokens')
              : t('successClaimdLpTokens')
          }
        />
      )}
      {extendConfirm && (
        <TransactionConfirmationModal
          modalWrapper='modalWrapper'
          isTxWrapper={false}
          isOpen={extendConfirm}
          onDismiss={dismissExtendConfirm}
          attemptingTxn={extending}
          txPending={isExtendPending}
          hash={extendHash}
          content={() =>
            extendErrorMessage ? (
              <TransactionErrorContent
                onDismiss={dismissExtendConfirm}
                message={extendErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={t('extendLock')}
                onDismiss={dismissExtendConfirm}
                content={modalHeaderExtend}
              />
            )
          }
          pendingText=''
          modalContent={
            isExtendPending
              ? t('submittedTxExtendLock')
              : t('successExtendLock')
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
          <small>{`${dayjs.unix(lock.event.timeStamp).format('DD MMM YYYY')} - ${dayjs.unix(lock.event.unlockTime).format('DD MMM YYYY, h:mm a')}`}</small>
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
              showExtendConfirm(true)
            }
          >
            <small>{t('extend')}</small>
          </Button>
          <Button
            variant='contained'
            disabled={isLocked}
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
