import React, { useMemo, useState } from 'react';
import { TransactionResponse } from '@ethersproject/providers';
import { useTheme } from '@material-ui/core/styles';
import {
  Box,
  Button,
  Tab,
  CircularProgress,
  useMediaQuery,
} from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import {
  useOldLairInfo,
  useNewLairInfo,
  useDerivedLairInfo,
} from 'state/stake/hooks';
import {
  CurrencyLogo,
  NumericalInput,
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
} from 'components';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/matic.svg';
import QUICKIcon from 'assets/images/quickIcon.svg';
import QUICKIconOld from 'assets/images/quickIconOld.svg';
import { ReactComponent as QUICKV2Icon } from 'assets/images/QUICKV2.svg';
import APRHover from 'assets/images/aprHover.png';
import { formatTokenAmount, useLairDQUICKAPY, calculateGasMargin } from 'utils';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import {
  DLDQUICK,
  DLQUICK,
  OLD_DQUICK,
  OLD_QUICK,
} from 'constants/v3/addresses';
import 'pages/styles/dragon.scss';
import Badge, { BadgeVariant } from 'components/v3/Badge';
import { GlobalConst } from 'constants/index';
import { useTokenBalance } from 'state/wallet/hooks';
import { tryParseAmount } from 'state/swap/hooks';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import {
  useNewLairContract,
  useQUICKConversionContract,
} from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import Web3 from 'web3';
import { TransactionType } from 'models/enums';
import { ReportProblemOutlined } from '@material-ui/icons';

const DragonsLair = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const { t } = useTranslation();
  const { account, chainId, library } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const isNew = true;

  const quickToken = DLQUICK[chainIdToUse];
  const quickBalance = useTokenBalance(account ?? undefined, quickToken);
  const dQuickToken = DLDQUICK[chainIdToUse];
  const dQuickBalance = useTokenBalance(account ?? undefined, dQuickToken);
  const oldQuickToken = OLD_QUICK[chainIdToUse];
  const oldQuickBalance = useTokenBalance(account ?? undefined, oldQuickToken);
  const { price: quickPrice } = useUSDCPriceFromAddress(quickToken?.address);
  const [isQUICKRate, setIsQUICKRate] = useState(false);
  const [tabValue, setTabValue] = useState('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakedAmount, setStakedAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [unstakedAmount, setUnstakedAmount] = useState('');
  const [quickAmount, setQUICKAmount] = useState('');
  const [quickV2Amount, setQUICKV2Amount] = useState('');
  const [approving, setApproving] = useState(false);
  const [attemptStaking, setAttemptStaking] = useState(false);
  const [attemptUnstaking, setAttemptUnstaking] = useState(false);
  const [attemptConverting, setAttemptConverting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txError, setTxError] = useState('');

  // Stake
  const lairContract = useNewLairContract();
  const lairContractToUse = lairContract;
  const lairInfo = useOldLairInfo();
  const newLairInfo = useNewLairInfo();
  const lairInfoToUse = isNew ? newLairInfo : lairInfo;
  // const APY = useLairDQUICKAPY(isNew, lairInfoToUse);
  const APY = '0';
  const dQUICKtoQUICK = lairInfoToUse?.dQUICKtoQUICK?.toExact();
  const QUICKtodQUICK = lairInfoToUse?.QUICKtodQUICK?.toExact();

  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    quickToken,
  );

  const { parsedAmount: parsedStakingAmount, error } = useDerivedLairInfo(
    stakeAmount,
    quickToken,
    userLiquidityUnstaked,
  );

  const isInsufficientStakeAmount =
    Number(stakeAmount) > Number(quickBalance?.toExact() ?? 0);

  const isInsufficientUnstakeAmount =
    Number(unstakeAmount) > Number(lairInfoToUse?.dQUICKBalance.toExact() ?? 0);

  const [stakingApproval, approveStakingCallback] = useApproveCallback(
    parsedStakingAmount,
    lairContractToUse?.address,
  );

  const stakingButtonText = useMemo(() => {
    if (!stakeAmount || !Number(stakeAmount)) {
      return t('enterAmount');
    } else if (stakingApproval !== ApprovalState.APPROVED) {
      return t('approve');
    } else if (isInsufficientStakeAmount) {
      return t('insufficientBalance');
    } else {
      setApproving(false);
      return t('confirm');
    }
  }, [isInsufficientStakeAmount, stakeAmount, t, stakingApproval]);

  // Unstake
  const unstakingButtonText = useMemo(() => {
    if (!unstakeAmount || !Number(unstakeAmount)) {
      return t('enterAmount');
    } else if (isInsufficientUnstakeAmount) {
      return t('insufficientBalance');
    } else {
      return t('confirm');
    }
  }, [isInsufficientUnstakeAmount, unstakeAmount, t]);

  // Convert
  const quickConvertContract = useQUICKConversionContract();
  const parsedAmount = tryParseAmount(chainIdToUse, quickAmount, oldQuickToken);
  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    quickConvertContract?.address,
  );

  const quickConvertingText = t('convertingQUICKtoQUICKV2', {
    quickAmount,
    quickV2Amount,
  });
  const quickConvertedText = t('convertedQUICKtoQUICKV2', {
    quickAmount,
    quickV2Amount,
  });
  const txSubmittedQuickConvertText = t('submittedTxQUICKConvert', {
    quickAmount,
    quickV2Amount,
  });
  const successQuickConvertedText = t('successConvertedQUICKtoQUICKV2', {
    quickAmount,
    quickV2Amount,
  });

  const isInsufficientQUICK =
    Number(quickAmount) > Number(oldQuickBalance?.toExact() ?? 0);

  const buttonText = useMemo(() => {
    if (!quickAmount || !Number(quickAmount)) {
      return t('enterAmount');
    } else if (approval !== ApprovalState.APPROVED) {
      return t('approve');
    } else if (isInsufficientQUICK) {
      return t('insufficientBalance');
    } else {
      return t('convert');
    }
  }, [isInsufficientQUICK, quickAmount, t, approval]);
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();

  const handleTabChange = (event: any, newValue: string) => {
    setTabValue(newValue);
  };

  const handleDismissConfirmation = () => {
    setShowConfirm(false);
  };

  // for stake
  const attemptToStakeApprove = async () => {
    setApproving(true);
    try {
      await onAttemptToApprove();
      // setApproving(false);
    } catch (e) {
      setApproving(false);
    }
  };

  const onAttemptToApprove = async () => {
    if (!lairContractToUse) throw new Error(t('missingdependencies'));
    const liquidityAmount = parsedStakingAmount;
    if (!liquidityAmount) throw new Error(t('missingliquidity'));
    return approveStakingCallback();
  };

  const onStake = async () => {
    setAttemptStaking(true);
    if (lairContractToUse && parsedStakingAmount) {
      if (stakingApproval === ApprovalState.APPROVED) {
        try {
          const estimatedGas = await lairContractToUse.estimateGas.enter(
            `0x${parsedStakingAmount.raw.toString(16)}`,
          );
          const response: TransactionResponse = await lairContractToUse.enter(
            `0x${parsedStakingAmount.raw.toString(16)}`,
            {
              gasLimit: calculateGasMargin(estimatedGas),
            },
          );
          addTransaction(response, {
            summary: `${t('stake')} ${quickToken?.symbol}`,
            type: TransactionType.STAKE,
          });
          const receipt = await response.wait();
          finalizedTransaction(receipt, {
            summary: `${t('stake')} ${quickToken?.symbol}`,
          });
          setAttemptStaking(false);
          setStakeAmount('0');
          setStakedAmount('0');
        } catch (err) {
          setAttemptStaking(false);
        }
      } else {
        setAttemptStaking(false);
        throw new Error(t('stakewithoutapproval'));
      }
    }
  };

  // for unstake
  const web3 = new Web3();
  const onWithdraw = async () => {
    if (lairContractToUse && lairInfoToUse?.dQUICKBalance) {
      setAttemptUnstaking(true);
      const balance = web3.utils.toWei(unstakeAmount, 'ether');
      try {
        const estimatedGas = await lairContractToUse.estimateGas.leave(
          balance.toString(),
        );
        const response: TransactionResponse = await lairContractToUse.leave(
          balance.toString(),
          { gasLimit: calculateGasMargin(estimatedGas) },
        );
        addTransaction(response, {
          summary: `${t('unstake')} ${dQuickToken?.symbol}`,
          type: TransactionType.UNSTAKE,
        });
        const receipt = await response.wait();
        finalizedTransaction(receipt, {
          summary: `${t('unstake')} ${dQuickToken?.symbol}`,
        });
        setAttemptUnstaking(false);
        setUnstakeAmount('0');
        setUnstakedAmount('0');
      } catch (error) {
        setAttemptUnstaking(false);
        console.log(error);
      }
    }
  };

  // for convert
  const attemptToApprove = async () => {
    setApproving(true);
    try {
      await approveCallback();
      setApproving(false);
    } catch (e) {
      setApproving(false);
    }
  };

  const convertQUICK = async () => {
    if (quickConvertContract && library && parsedAmount) {
      setAttemptConverting(true);
      setShowConfirm(true);
      await quickConvertContract
        .quickToQuickX(parsedAmount.raw.toString(), {
          gasLimit: 300000,
        })
        .then(async (response: TransactionResponse) => {
          setAttemptConverting(false);
          setTxPending(true);
          setTxError('');
          setTxHash('');
          addTransaction(response, {
            summary: quickConvertingText,
            type: TransactionType.SWAPPED,
          });
          try {
            const tx = await response.wait();
            finalizedTransaction(tx, {
              summary: quickConvertedText,
            });
            setTxPending(false);
            setTxHash(tx.transactionHash);
          } catch (err) {
            setTxPending(false);
            setTxError(t('errorInTx'));
          }
        })
        .catch(() => {
          setAttemptConverting(false);
          setTxPending(false);
          setTxHash('');
          setTxError(t('txRejected'));
        });
    }
  };

  return (
    <Box position='relative' zIndex={3} className='dragonLairBg'>
      <Box
        mb={3}
        className={`${!isMobile ? 'dragonLairTitle' : 'dragonLairTitleMobile'}`}
      >
        <Box className='sub-title'>
          <h5>Manage QUICK</h5>
          <Badge
            variant={BadgeVariant.POSITIVE}
            text={`${APY ? APY : '-'}% APY`}
            textColor='text-success'
            icon={<img src={APRHover} width={12} />}
            iconReverse={true}
          />
        </Box>
        {tabValue !== 'convert' && (
          <Box
            className='quickTodQuick'
            style={{ marginTop: isMobile ? '20px' : '0px' }}
          >
            <CurrencyLogo currency={quickToken} size='16px' />
            <small style={{ margin: '0 8px' }}>
              {isQUICKRate ? 1 : Number(dQUICKtoQUICK).toLocaleString('us')}{' '}
              {quickToken?.symbol} =
            </small>
            <CurrencyLogo currency={dQuickToken} size='16px' />
            <small style={{ margin: '0 8px' }}>
              {isQUICKRate ? Number(QUICKtodQUICK).toLocaleString('us') : 1}{' '}
              {dQuickToken?.symbol}
            </small>
            <PriceExchangeIcon
              className='cursor-pointer'
              onClick={() => setIsQUICKRate(!isQUICKRate)}
            />
          </Box>
        )}
        {tabValue === 'convert' && (
          <Box
            className='quickTodQuick'
            style={{ marginTop: isMobile ? '20px' : '0px' }}
          >
            <img
              src={QUICKIconOld}
              alt='QUICK (OLD)'
              width='16px'
              height='16px'
            />
            <small style={{ margin: isMobile ? '0 2px' : '0 8px' }}>
              1 QUICK (OLD) ={' '}
            </small>
            <img src={QUICKIcon} alt='QUICK (NEW)' width='16px' height='16px' />
            <small style={{ margin: isMobile ? '0 2px' : '0 8px' }}>
              {GlobalConst.utils.QUICK_CONVERSION_RATE} QUICK (NEW)
            </small>
            <PriceExchangeIcon />
          </Box>
        )}
      </Box>
      <Box className='dragonWrapper-tab-container'>
        <TabContext value={tabValue}>
          <TabList
            onChange={handleTabChange}
            variant='fullWidth'
            className='border-dragon'
          >
            <Tab label='Stake' value='stake'></Tab>
            <Tab label='Unstake' value='unstake'></Tab>
            <Tab label='Convert' value='convert'></Tab>
          </TabList>

          <TabPanel value='stake'>
            <Box
              className='stake-wrapper items-center justify-center'
              minHeight={280}
            >
              <Box className='notice-msg' maxWidth={430}>
                <small style={{ marginBottom: '8px' }}>
                  <ReportProblemOutlined /> Important Notice
                </small>
                <small>
                  For the next three months, all $QUICK tokens purchased through
                  Dragons Lair buybacks will be sent to the burn address.
                </small>
                <small>
                  Unstaking during this trial period is not required.
                </small>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value='unstake'>
            <Box className='stake-wrapper'>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('unstake')}:</p>
                  <p>
                    {t('available')}:{' '}
                    {formatTokenAmount(lairInfoToUse?.dQUICKBalance)}
                  </p>
                </Box>
                <Box
                  className={
                    'input-wrapper ' +
                    `currencyInput${
                      isInsufficientUnstakeAmount ? ' errorInput' : ''
                    }`
                  }
                >
                  <NumericalInput
                    placeholder='0.00'
                    value={unstakeAmount}
                    fontSize={18}
                    onUserInput={(value) => {
                      const digits =
                        value.indexOf('.') > -1
                          ? value.split('.')[1].length
                          : 0;
                      let fixedVal = value;
                      if (digits > dQuickToken.decimals) {
                        fixedVal = Number(value).toFixed(dQuickToken.decimals);
                      }
                      setUnstakeAmount(fixedVal);
                      setUnstakedAmount(
                        (
                          Number(fixedVal) * Number(dQUICKtoQUICK)
                        ).toLocaleString('fullwide', {
                          useGrouping: false,
                          maximumFractionDigits: dQuickToken.decimals,
                        }),
                      );
                    }}
                  />
                  <Box display='flex' alignItems='center'>
                    <button
                      className='max-button'
                      onClick={() => {
                        if (lairInfoToUse?.dQUICKBalance) {
                          setUnstakeAmount(
                            lairInfoToUse?.dQUICKBalance.toExact(),
                          );
                          setUnstakedAmount(
                            (
                              Number(lairInfoToUse?.dQUICKBalance.toExact()) *
                              Number(dQUICKtoQUICK)
                            ).toString(),
                          );
                        }
                      }}
                    >
                      {t('max')}
                    </button>
                    <Box display='flex' alignItems='center'>
                      <CurrencyLogo currency={dQuickToken} />
                      <p className='token-name'>{dQuickToken?.symbol}</p>
                    </Box>
                  </Box>
                </Box>
                {isInsufficientUnstakeAmount && (
                  <small className='text-error'>
                    {t('insufficientBalance', { symbol: 'dQUICK' })}
                  </small>
                )}
              </Box>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('receive')}:</p>
                  <p>
                    {t('available')}: {formatTokenAmount(quickBalance)}
                  </p>
                </Box>
                <Box className='input-wrapper'>
                  <NumericalInput
                    placeholder='0.00'
                    value={unstakedAmount}
                    fontSize={18}
                    onUserInput={(value) => {
                      setUnstakedAmount(value);
                      const unstakeAmount = (
                        Number(value) * Number(dQUICKtoQUICK)
                      ).toLocaleString('fullwide', {
                        useGrouping: false,
                        maximumFractionDigits: quickToken.decimals,
                      });
                      setUnstakeAmount(unstakeAmount);
                    }}
                  />
                  <Box display='flex' alignItems='center'>
                    <Box display='flex' alignItems='center'>
                      <CurrencyLogo currency={quickToken} />
                      <p className='token-name'>{quickToken?.symbol}</p>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value='convert'>
            <Box className='stake-wrapper'>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('convert')}:</p>
                  <p>
                    {t('available')}: {formatTokenAmount(oldQuickBalance)}
                  </p>
                </Box>
                <Box
                  className={
                    'input-wrapper ' +
                    `currencyInput${isInsufficientQUICK ? ' errorInput' : ''}`
                  }
                >
                  <NumericalInput
                    placeholder='0.00'
                    value={quickAmount}
                    fontSize={18}
                    onUserInput={(value) => {
                      const digits =
                        value.indexOf('.') > -1
                          ? value.split('.')[1].length
                          : 0;
                      let fixedVal = value;
                      if (digits > oldQuickToken.decimals) {
                        fixedVal = Number(value).toFixed(
                          oldQuickToken.decimals,
                        );
                      }
                      setQUICKAmount(fixedVal);
                      setQUICKV2Amount(
                        (
                          Number(fixedVal) *
                          GlobalConst.utils.QUICK_CONVERSION_RATE
                        ).toLocaleString('fullwide', {
                          useGrouping: false,
                          maximumFractionDigits: oldQuickToken.decimals,
                        }),
                      );
                    }}
                  />
                  <Box display='flex' alignItems='center'>
                    <button
                      className='max-button'
                      onClick={() => {
                        if (oldQuickBalance) {
                          setQUICKAmount(oldQuickBalance.toExact());
                          setQUICKV2Amount(
                            (
                              Number(oldQuickBalance.toExact()) *
                              GlobalConst.utils.QUICK_CONVERSION_RATE
                            ).toString(),
                          );
                        }
                      }}
                    >
                      {t('max')}
                    </button>
                    <Box display='flex' alignItems='center'>
                      <img
                        src={QUICKIconOld}
                        alt='QUICK (OLD)'
                        width='24px'
                        height='24px'
                      />
                      <p className='token-name'>QUICK (OLD)</p>
                    </Box>
                  </Box>
                </Box>
                {isInsufficientQUICK && (
                  <small className='text-error'>
                    {t('insufficientBalance', { symbol: 'QUICK (OLD)' })}
                  </small>
                )}
              </Box>
              <Box className='input-item'>
                <Box className='input-header'>
                  <p>{t('receive')}:</p>
                  <p>
                    {t('available')}:{' '}
                    {formatTokenAmount(lairInfoToUse?.QUICKBalance)}
                  </p>
                </Box>
                <Box className='input-wrapper'>
                  <NumericalInput
                    placeholder='0.00'
                    value={quickV2Amount}
                    fontSize={18}
                    onUserInput={(value) => {
                      setQUICKV2Amount(value);
                      const quickAmount = (
                        Number(value) / GlobalConst.utils.QUICK_CONVERSION_RATE
                      ).toLocaleString('fullwide', {
                        useGrouping: false,
                        maximumFractionDigits: oldQuickToken.decimals,
                      });
                      setQUICKAmount(quickAmount);
                    }}
                  />
                  <Box display='flex' alignItems='center'>
                    <Box display='flex' alignItems='center'>
                      <img
                        src={QUICKIcon}
                        alt='QUICK (NEW)'
                        width='24px'
                        height='24px'
                      />
                      <p className='token-name'>QUICK (NEW)</p>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </TabPanel>
        </TabContext>
      </Box>
      {tabValue !== 'stake' && (
        <Box className='stakeButton'>
          {tabValue === 'unstake' && (
            <Button
              disabled={
                approving ||
                attemptUnstaking ||
                isInsufficientUnstakeAmount ||
                Number(unstakeAmount) <= 0
              }
              className='unstakeButton'
              onClick={() => {
                onWithdraw();
              }}
            >
              {unstakingButtonText}
            </Button>
          )}
          {tabValue === 'convert' && (
            <Button
              disabled={
                approving ||
                attemptConverting ||
                isInsufficientQUICK ||
                !quickAmount ||
                !Number(quickAmount)
              }
              className='convertButton'
              onClick={() => {
                if (approval === ApprovalState.APPROVED) {
                  convertQUICK();
                } else {
                  attemptToApprove();
                }
              }}
            >
              {buttonText}
            </Button>
          )}
        </Box>
      )}

      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptConverting}
          txPending={txPending}
          hash={txHash}
          content={() =>
            txError ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={txError}
              />
            ) : (
              <ConfirmationModalContent
                title={t('convertingQUICK')}
                onDismiss={handleDismissConfirmation}
                content={() => (
                  <Box textAlign='center'>
                    <Box mt={6} mb={5}>
                      <CircularProgress size={80} />
                    </Box>
                    <p>{quickConvertingText}</p>
                  </Box>
                )}
              />
            )
          }
          pendingText={quickConvertingText}
          modalContent={
            txPending ? txSubmittedQuickConvertText : successQuickConvertedText
          }
        />
      )}
    </Box>
  );
};

export default DragonsLair;
