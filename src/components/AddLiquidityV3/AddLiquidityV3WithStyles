// import React, { useCallback, useEffect, useState, useMemo } from 'react';
// import { Box } from '@material-ui/core';
// import {
//   TransactionErrorContent,
//   TransactionConfirmationModal,
//   ConfirmationModalContent,
//   DoubleCurrencyLogo,
// } from 'components';
// import { useWalletModalToggle } from 'state/application/hooks';
// import { TransactionResponse } from '@ethersproject/providers';
// import { BigNumber } from '@ethersproject/bignumber';
// import ReactGA from 'react-ga';
// import { useTranslation } from 'react-i18next';
// import { Currency, Token } from '@uniswap/sdk-core';
// import { useActiveWeb3React } from 'hooks';
// import { useRouterContract } from 'hooks/useContract';
// import useTransactionDeadline from 'hooks/useTransactionDeadline';
// import { ApprovalState, useApproveCallbackV3 } from 'hooks/useApproveCallback';
// import { Field } from 'state/mint/actions';

// import {
//   useTransactionAdder,
//   useTransactionFinalizer,
// } from 'state/transactions/hooks';
// import { useIsExpertMode, useUserSlippageTolerance } from 'state/user/hooks';
// import {
//   addMaticToMetamask,
//   calculateGasMargin,
//   isSupportedNetwork,
//   calculateSlippageAmountV3,
// } from 'utils';
// import { wrappedCurrency } from 'utils/wrappedCurrency';
// import { ReactComponent as AddLiquidityIconV3 } from 'assets/images/AddLiquidityIconV3.svg';
// import { ReactComponent as ArrowDownIcon } from 'assets/images/arrowDown.svg';
// import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';

// import RateToggle from 'components/RateToggle';
// import { CurrencyLogo } from 'components';
// import {
//   LinkButton,
//   StyledButton,
//   StyledFilledBox,
//   StyledLabel,
//   StyledNumber,
// } from './CommonStyledElements';
// import { ConfirmationModalContentV3 } from 'components/TransactionConfirmationModal/TransactionConfirmationModal';
// import CurrencySelect from 'components/CurrencySelect';
// import {
//   useRangeHopCallbacks,
//   useV3DerivedMintInfo,
//   useV3MintActionHandlers,
//   useV3MintState,
// } from 'state/mint/v3/hooks';
// import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
// import { SelectRange } from './SelectRange';

// import usePrevious from 'hooks/usePrevious';
// import { PoolState } from 'hooks/v3/usePools';
// import { useUSDCValue } from 'hooks/v3/useUSDCPrice';
// import { PriceFormats } from './components/PriceFomatToggler';
// import { CurrencyAmount } from '@uniswap/sdk-core';
// import { maxAmountSpend } from 'utils/v3/maxAmountSpend';
// import CurrencyInputV3 from 'components/CurrencyInputV3';
// import { useCurrencyBalances } from 'state/wallet/v3/hooks';

// const AddLiquidityV3: React.FC<{
//   // currencyId0?: string;
//   // currencyId1?: string;
//   // tokenId?: string;
//   // handleSettingsOpen: (flag: boolean) => void;
// }> = () => {
//   const { t } = useTranslation();
//   const [addLiquidityErrorMessage, setAddLiquidityErrorMessage] = useState<
//     string | null
//   >(null);

//   const { account, chainId, library } = useActiveWeb3React();

//   const [showConfirm, setShowConfirm] = useState(false);
//   const [attemptingTxn, setAttemptingTxn] = useState(false);
//   const [txPending, setTxPending] = useState(false);
//   const [txHash, setTxHash] = useState('');
//   const addTransaction = useTransactionAdder();
//   const finalizedTransaction = useTransactionFinalizer();

//   const expertMode = useIsExpertMode();

//   const feeAmount = 100;

//   const {
//     independentField,
//     typedValue,
//     leftRangeTypedValue,
//     rightRangeTypedValue,
//     startPriceTypedValue,
//     [Field.CURRENCY_A]: { currencyId: currencyAId },
//     [Field.CURRENCY_B]: { currencyId: currencyBId },
//   } = useV3MintState();

//   const {
//     ticks,
//     dependentField,
//     pricesAtTicks,
//     parsedAmounts,
//     currencyBalances,
//     position,
//     noLiquidity,
//     currencies,
//     errorMessage,
//     invalidPool,
//     invalidRange,
//     outOfRange,
//     depositADisabled,
//     depositBDisabled,
//     ticksAtLimit,
//     dynamicFee,
//   } = useV3DerivedMintInfo(
//     baseCurrency ?? undefined,
//     quoteCurrency ?? undefined,
//     feeAmount,
//     baseCurrency ?? undefined,
//     existingPosition,
//   );

//   const prevDerivedMintInfo = usePrevious({ ...derivedMintInfo });

//   const mintInfo = useMemo(() => {
//     if (
//       (!derivedMintInfo.pool ||
//         !derivedMintInfo.price ||
//         derivedMintInfo.noLiquidity) &&
//       prevDerivedMintInfo
//     ) {
//       return {
//         ...prevDerivedMintInfo,
//         pricesAtTicks: derivedMintInfo.pricesAtTicks,
//         ticks: derivedMintInfo.ticks,
//         parsedAmounts: derivedMintInfo.parsedAmounts,
//       };
//     }
//     return {
//       ...derivedMintInfo,
//     };
//   }, [derivedMintInfo]);

//   const baseCurrency = mintInfo?.currencies?.[Field.CURRENCY_A];
//   const currencyB = mintInfo?.currencies?.[Field.CURRENCY_B];
//   // prevent an error if they input ETH/WETH
//   //TODO
//   const quoteCurrency =
//     baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped)
//       ? undefined
//       : currencyB;

//   const {
//     onFieldAInput,
//     onFieldBInput,
//     onLeftRangeInput,
//     onRightRangeInput,
//     onStartPriceInput,
//     onCurrencySelection,
//   } = useV3MintActionHandlers(mintInfo?.noLiquidity);

//   const pendingText = t('supplyingTokens', 'liquidityTokenData');

//   const stepPair = useMemo(() => {
//     return Boolean(
//       baseCurrency &&
//         quoteCurrency &&
//         mintInfo.poolState !== PoolState.INVALID &&
//         mintInfo.poolState !== PoolState.LOADING,
//     );
//   }, [baseCurrency, quoteCurrency, mintInfo]);

//   const stepRange = useMemo(() => {
//     return Boolean(
//       mintInfo.lowerPrice &&
//         mintInfo.upperPrice &&
//         !mintInfo.invalidRange &&
//         account,
//     );
//   }, [mintInfo]);

//   const stepInitialPrice = useMemo(() => {
//     return mintInfo.noLiquidity
//       ? Boolean(+startPriceTypedValue && account)
//       : false;
//   }, [mintInfo, startPriceTypedValue]);

//   const [allowedSlippage] = useUserSlippageTolerance();

//   const deadline = useTransactionDeadline(); // custom from users settings

//   // get formatted amounts
//   const formattedAmounts = {
//     [independentField]: typedValue,
//     [mintInfo?.dependentField]:
//       mintInfo?.parsedAmounts?.[mintInfo?.dependentField]?.toSignificant(6) ??
//       '',
//   };

//   const usdcValues = {
//     [Field.CURRENCY_A]: useUSDCValue(
//       mintInfo?.parsedAmounts?.[Field.CURRENCY_A],
//       true,
//     ),
//     [Field.CURRENCY_B]: useUSDCValue(
//       mintInfo?.parsedAmounts?.[Field.CURRENCY_B],
//       true,
//     ),
//   };

//   const currencyBalances = useCurrencyBalances(account ?? undefined, [
//     baseCurrency ?? undefined,
//     quoteCurrency ?? undefined,
//   ]);

//   // get the max amounts user can add
//   const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
//     Field.CURRENCY_A,
//     Field.CURRENCY_B,
//   ].reduce((accumulator, field) => {
//     return {
//       ...accumulator,
//       [field]: maxAmountSpend(mintInfo?.currencyBalances?.[field]),
//     };
//   }, {});

//   const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [
//     Field.CURRENCY_A,
//     Field.CURRENCY_B,
//   ].reduce((accumulator, field) => {
//     return {
//       ...accumulator,
//       [field]: maxAmounts[field]?.equalTo(
//         mintInfo?.parsedAmounts?.[field] ?? '0',
//       ),
//     };
//   }, {});

//   // non v3 states

//   const { ethereum } = window as any;
//   const toggleWalletModal = useWalletModalToggle();
//   const [approvingA, setApprovingA] = useState(false);
//   const [approvingB, setApprovingB] = useState(false);
//   // check whether the user has approved the router on the tokens
//   const [approvalA, approveACallback] = useApproveCallbackV3(
//     mintInfo?.parsedAmounts?.[Field.CURRENCY_A],
//     chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined,
//   );
//   const [approvalB, approveBCallback] = useApproveCallbackV3(
//     mintInfo?.parsedAmounts?.[Field.CURRENCY_B],
//     chainId ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId] : undefined,
//   );

//   const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

//   const handleCurrencyASelect = useCallback(
//     (currencyA: Token) => {
//       onCurrencySelection(Field.CURRENCY_A, currencyA);
//     },
//     [onCurrencySelection],
//   );

//   const handleCurrencyBSelect = useCallback(
//     (currencyB: Currency) => {
//       onCurrencySelection(Field.CURRENCY_B, currencyB);
//     },
//     [onCurrencySelection],
//   );

//   // todo: fix intial currency selection
//   // useEffect(() => {
//   //   if (currencyId0) {
//   //     onCurrencySelection(Field.CURRENCY_A, currencyId0);
//   //   } else {
//   //     onCurrencySelection(Field.CURRENCY_A, Token.ETHER);
//   //   }
//   //   if (currency1) {
//   //     onCurrencySelection(Field.CURRENCY_B, currency1);
//   //   } else {
//   //     onCurrencySelection(Field.CURRENCY_B, returnTokenFromKey('USDT'));
//   //   }
//   // }, [onCurrencySelection, currency0, currency1]);

//   const onAdd = () => {
//     if (expertMode) {
//       onAddLiquidity();
//     } else {
//       setShowConfirm(true);
//     }
//   };

//   const router = useRouterContract();

//   const onAddLiquidity = async () => {
//     if (!chainId || !library || !account || !router) return;

//     const {
//       [Field.CURRENCY_A]: parsedAmountA,
//       [Field.CURRENCY_B]: parsedAmountB,
//     } = mintInfo?.parsedAmounts;
//     if (
//       !parsedAmountA ||
//       !parsedAmountB ||
//       !mintInfo?.currencies[Field.CURRENCY_A] ||
//       !mintInfo?.currencies[Field.CURRENCY_B] ||
//       !deadline
//     ) {
//       return;
//     }

//     const amountsMin = {
//       [Field.CURRENCY_A]: calculateSlippageAmountV3(
//         parsedAmountA,
//         mintInfo?.noLiquidity ? 0 : allowedSlippage,
//       )[0],
//       [Field.CURRENCY_B]: calculateSlippageAmountV3(
//         parsedAmountB,
//         mintInfo?.noLiquidity ? 0 : allowedSlippage,
//       )[0],
//     };

//     let estimate,
//       method: (...args: any) => Promise<TransactionResponse>,
//       args: Array<string | string[] | number>,
//       value: BigNumber | null;
//     if (
//       mintInfo?.currencies[Field.CURRENCY_A]?.isNative ||
//       mintInfo?.currencies[Field.CURRENCY_B]?.isNative
//     ) {
//       const tokenBIsETH = mintInfo?.currencies[Field.CURRENCY_B]?.isNative;
//       estimate = router.estimateGas.addLiquidityETH;
//       method = router.addLiquidityETH;
//       args = [
//         wrappedCurrency(
//           tokenBIsETH
//             ? mintInfo?.currencies[Field.CURRENCY_A]
//             : mintInfo?.currencies[Field.CURRENCY_B],
//           chainId,
//         )?.address ?? '', // token
//         (tokenBIsETH ? parsedAmountA : parsedAmountB).toExact().toString(), // token desired
//         amountsMin[
//           tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B
//         ].toString(), // token min
//         amountsMin[
//           tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A
//         ].toString(), // eth min
//         account,
//         deadline.toHexString(),
//       ];
//       value = BigNumber.from(
//         (tokenBIsETH ? parsedAmountB : parsedAmountA).toExact().toString(),
//       );
//     } else {
//       estimate = router.estimateGas.addLiquidity;
//       method = router.addLiquidity;
//       args = [
//         wrappedCurrency(mintInfo?.currencies[Field.CURRENCY_A], chainId)
//           ?.address ?? '',
//         wrappedCurrency(mintInfo?.currencies[Field.CURRENCY_B], chainId)
//           ?.address ?? '',
//         parsedAmountA.toExact().toString(),
//         parsedAmountB.toExact().toString(),
//         amountsMin[Field.CURRENCY_A].toString(),
//         amountsMin[Field.CURRENCY_B].toString(),
//         account,
//         deadline.toHexString(),
//       ];
//       value = null;
//     }

//     setAttemptingTxn(true);
//     await estimate(...args, value ? { value } : {})
//       .then((estimatedGasLimit) =>
//         method(...args, {
//           ...(value ? { value } : {}),
//           gasLimit: calculateGasMargin(estimatedGasLimit),
//         }).then(async (response) => {
//           setAttemptingTxn(false);
//           setTxPending(true);
//           const summary = t('addLiquidityTokens', 'liquidityTokenData');

//           addTransaction(response, {
//             summary,
//           });

//           setTxHash(response.hash);

//           try {
//             const receipt = await response.wait();
//             finalizedTransaction(receipt, {
//               summary,
//             });
//             setTxPending(false);
//           } catch (error) {
//             setTxPending(false);
//             setAddLiquidityErrorMessage(t('errorInTx'));
//           }

//           ReactGA.event({
//             category: 'Liquidity',
//             action: 'Add',
//             label: [
//               mintInfo?.currencies[Field.CURRENCY_A]?.symbol,
//               mintInfo?.currencies[Field.CURRENCY_B]?.symbol,
//             ].join('/'),
//           });
//         }),
//       )
//       .catch((error) => {
//         setAttemptingTxn(false);
//         setAddLiquidityErrorMessage(t('txRejected'));
//         // we only care if the error is something _other_ than the user rejected the tx
//         if (error?.code !== 4001) {
//           console.error(error);
//         }
//       });
//   };

//   const connectWallet = () => {
//     if (ethereum && !isSupportedNetwork(ethereum)) {
//       addMaticToMetamask();
//     } else {
//       toggleWalletModal();
//     }
//   };

//   const handleDismissConfirmation = useCallback(() => {
//     setShowConfirm(false);
//     // if there was a tx hash, we want to clear the input
//     if (txHash) {
//       onFieldAInput('');
//     }
//     setTxHash('');
//   }, [onFieldAInput, txHash]);

//   const buttonText = useMemo(() => {
//     if (account) {
//       return mintInfo?.errorMessage ?? t('Preview');
//     } else if (ethereum && !isSupportedNetwork(ethereum)) {
//       return t('switchPolygon');
//     }
//     return t('connectWallet');
//   }, [account, ethereum, mintInfo?.errorMessage, t]);

//   const modalHeaderV3 = () => {
//     return (
//       <Box>
//         <Box className='flex justify-between items-center' mt={2.5} mb={2.5}>
//           <DoubleCurrencyLogo
//             currency0={mintInfo?.currencies?.[Field.CURRENCY_A]}
//             currency1={mintInfo?.currencies?.[Field.CURRENCY_B]}
//             size={32}
//           />
//           <Box
//             bgcolor={' rgba(15, 198, 121, 0.3)'}
//             className='flex items-center'
//             px={1.5}
//             py={0.5}
//             ml={1.5}
//             borderRadius={8}
//           >
//             <Box
//               height={10}
//               width={10}
//               borderRadius={'50%'}
//               bgcolor='#0fc679'
//               mr={1}
//             ></Box>
//             <StyledLabel fontSize='12px' color='#0fc679'>
//               in range
//             </StyledLabel>
//           </Box>
//         </Box>

//         <StyledFilledBox
//           className='flex flex-col items-center justify-evenly'
//           alignSelf='center'
//           justifySelf={'center'}
//           height={100}
//           mt={2}
//         >
//           <Box className='flex justify-between' width='90%'>
//             <Box className='flex items-center'>
//               <CurrencyLogo
//                 currency={mintInfo?.currencies?.CURRENCY_A}
//                 size={'28px'}
//               />

//               <StyledLabel fontSize='14px' style={{ marginLeft: 5 }}>
//                 {t(`${mintInfo?.currencies?.CURRENCY_A?.symbol}`)}
//               </StyledLabel>
//             </Box>

//             <Box>
//               {' '}
//               <StyledNumber fontSize='16px'>0</StyledNumber>
//             </Box>
//           </Box>
//           <Box className='flex justify-between' width='90%'>
//             <Box className='flex items-center'>
//               <CurrencyLogo
//                 currency={mintInfo?.currencies?.CURRENCY_B}
//                 size={'28px'}
//               />
//               <StyledLabel fontSize='14px' style={{ marginLeft: 5 }}>
//                 {t(`${mintInfo?.currencies?.CURRENCY_B?.symbol}`)}
//               </StyledLabel>
//             </Box>

//             <Box>
//               {' '}
//               <StyledNumber fontSize='16px'>0</StyledNumber>
//             </Box>
//           </Box>
//         </StyledFilledBox>

//         <Box
//           className='flex justify-between'
//           alignSelf='center'
//           justifySelf={'center'}
//           mt={2.5}
//         >
//           <StyledLabel fontSize='14px'>{t('Selected range')}</StyledLabel>
//           <Box>Toggle</Box>
//         </Box>

//         <Box
//           className='flex justify-between'
//           alignSelf='center'
//           justifySelf={'center'}
//           mt={2.5}
//         >
//           <StyledFilledBox
//             width='48%'
//             className='flex flex-col justify-center items-center'
//             padding={2}
//             textAlign='center'
//           >
//             <StyledLabel color='#696c80'>Min price</StyledLabel>
//             <StyledNumber fontSize='18px'>0.58</StyledNumber>
//             <StyledLabel color='#696c80' style={{ marginBottom: 10 }}>
//               Your position will be 100%
//             </StyledLabel>
//             <StyledLabel color='#696c80'>
//               Composed of MATIC at this price
//             </StyledLabel>
//           </StyledFilledBox>
//           <StyledFilledBox
//             width='48%'
//             // height={120}
//             className='flex flex-col justify-center items-center'
//             padding={2}
//             textAlign='center'
//           >
//             <StyledLabel color='#696c80'>Max price</StyledLabel>
//             <StyledNumber fontSize='18px'>0.58</StyledNumber>
//             <StyledLabel color='#696c80' style={{ marginBottom: 10 }}>
//               Your position will be 100%
//             </StyledLabel>
//             <StyledLabel color='#696c80'>
//               Composed of MATIC at this price
//             </StyledLabel>
//           </StyledFilledBox>
//         </Box>

//         <Box justifySelf={'center'} alignSelf='center' mt={2.5} mb={2.5}>
//           <StyledFilledBox
//             className='flex flex-col justify-center items-center'
//             height={120}
//           >
//             <StyledLabel color='#696c80'>Max price</StyledLabel>
//             <StyledNumber fontSize='18px'>0.59</StyledNumber>
//             <StyledLabel color='#696c80'>
//               Your position will be 100%
//             </StyledLabel>
//             <StyledLabel color='#696c80'>
//               Composed of USDC at this price
//             </StyledLabel>
//           </StyledFilledBox>

//           <Box mt={2.5}>
//             <StyledButton onClick={onAddLiquidity}>{t('Confirm')}</StyledButton>
//           </Box>
//         </Box>
//       </Box>
//     );
//   };

//   const handleOpenModal = useCallback(() => {
//     setCurrencyModalOpen(true);
//   }, [setCurrencyModalOpen]);

//   return (
//     <Box>
//       <Box className='flex justify-between items-center'>
//         <StyledLabel fontSize='16px'>{t('supplyLiquidity')}</StyledLabel>
//         <Box className='flex items-center'>
//           <Box className='headingItem'>
//             <Box
//               className='flex flex-end'
//               style={{ width: 'fit-content', minWidth: 'fit-content' }}
//             >
//               <LinkButton
//                 style={{ marginRight: 10, alignSelf: 'center' }}
//                 fontSize='14px'
//               >
//                 {' '}
//                 {t('Clear All')}
//               </LinkButton>

//               <RateToggle
//                 currencyA={{ symbol: 'MATIC' }}
//                 currencyB={{ symbol: 'USDT' }}
//                 handleRateToggle={() => {
//                   // todo: handle toggle actions
//                 }}
//               />
//             </Box>
//           </Box>
//           <Box className='headingItem'>
//             <SettingsIcon />
//           </Box>
//         </Box>
//       </Box>
//       <Box className='flex justify-between items-center' mt={2.5}>
//         {t('Select Pair')}
//       </Box>
//       <Box mt={2.5}>
//         {showConfirm && (
//           <TransactionConfirmationModal
//             isOpen={showConfirm}
//             onDismiss={handleDismissConfirmation}
//             attemptingTxn={attemptingTxn}
//             txPending={txPending}
//             hash={txHash}
//             content={() =>
//               addLiquidityErrorMessage ? (
//                 <TransactionErrorContent
//                   onDismiss={handleDismissConfirmation}
//                   message={addLiquidityErrorMessage}
//                 />
//               ) : (
//                 <ConfirmationModalContentV3
//                   title={t('Supply Liquidity')}
//                   onDismiss={handleDismissConfirmation}
//                   content={modalHeaderV3}
//                 />
//               )
//             }
//             pendingText={pendingText}
//             modalContent={
//               txPending ? t('submittedTxLiquidity') : t('successAddedliquidity')
//             }
//           />
//         )}
//         <Box className='flex justify-between items-center' mt={2.5}>
//           <CurrencySelect
//             currency={mintInfo?.currencies?.CURRENCY_A}
//             otherCurrency={mintInfo?.currencies?.CURRENCY_B}
//             handleCurrencySelect={(currency: any) => {
//               handleCurrencyASelect(currency);
//             }}
//             bgClass='token-select-background cursor-pointer'
//             id='select-token-a'
//           >
//             <ArrowDownIcon />
//           </CurrencySelect>

//           <Box className='exchangeSwap'>
//             <AddLiquidityIconV3 />
//           </Box>

//           <CurrencySelect
//             currency={mintInfo?.currencies?.CURRENCY_B}
//             otherCurrency={mintInfo?.currencies?.CURRENCY_A}
//             handleCurrencySelect={(currency: any) => {
//               handleCurrencyBSelect(currency);
//             }}
//             bgClass='token-select-background cursor-pointer'
//             id='select-token-b'
//           >
//             <ArrowDownIcon />
//           </CurrencySelect>
//         </Box>
//         <Box className='flex justify-between items-center' mt={2.5}>
//           Select range
//         </Box>

//         <SelectRange
//           currencyA={baseCurrency}
//           currencyB={quoteCurrency}
//           mintInfo={mintInfo}
//           disabled={!stepPair}
//           isCompleted={stepRange}
//           additionalStep={stepInitialPrice}
//           priceFormat={PriceFormats.TOKEN} // todo add selected format
//           backStep={stepInitialPrice ? 1 : 0}
//         />

//         <Box className='flex justify-between items-center' mt={2.5} mb={2.5}>
//           Deposit Amounts
//         </Box>
//         <Box mb={2}>
//           <CurrencyInputV3
//             id='add-liquidity-input-tokena'
//             title={`${t('token')} 1:`}
//             currency={mintInfo?.currencies?.[Field.CURRENCY_A]}
//             showHalfButton={Boolean(maxAmounts?.[Field.CURRENCY_A])}
//             showMaxButton={!atMaxAmounts?.[Field.CURRENCY_A]}
//             onMax={() =>
//               onFieldAInput(maxAmounts?.[Field.CURRENCY_A]?.toExact() ?? '')
//             }
//             onHalf={() =>
//               onFieldAInput(
//                 maxAmounts?.[Field.CURRENCY_A]
//                   ? (
//                       Number(maxAmounts?.[Field.CURRENCY_A]?.toExact()) / 2
//                     ).toString()
//                   : '',
//               )
//             }
//             handleCurrencySelect={(currency: any) => {
//               handleCurrencyASelect(currency);
//             }}
//             amount={formattedAmounts?.[Field.CURRENCY_A]}
//             usdValue={usdcValues?.[Field.CURRENCY_A]}
//             balance={currencyBalances?.[0]}
//             setAmount={onFieldAInput}
//           />
//         </Box>

//         <Box>
//           <CurrencyInputV3
//             id='add-liquidity-input-tokenb'
//             title={`${t('token')} 2:`}
//             showHalfButton={Boolean(maxAmounts[Field.CURRENCY_B])}
//             currency={mintInfo?.currencies?.[Field.CURRENCY_B]}
//             showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
//             onHalf={() =>
//               onFieldBInput(
//                 maxAmounts[Field.CURRENCY_B]
//                   ? (
//                       Number(maxAmounts[Field.CURRENCY_B]?.toExact()) / 2
//                     ).toString()
//                   : '',
//               )
//             }
//             onMax={() =>
//               onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
//             }
//             handleCurrencySelect={(currency: any) => {
//               handleCurrencyBSelect(currency);
//             }}
//             amount={formattedAmounts[Field.CURRENCY_B]}
//             usdValue={usdcValues[Field.CURRENCY_B]}
//             balance={currencyBalances?.[1]}
//             setAmount={onFieldBInput}
//           />
//         </Box>

//         <Box className='flex-wrap' mt={2.5}>
//           {(approvalA === ApprovalState.NOT_APPROVED ||
//             approvalA === ApprovalState.PENDING ||
//             approvalB === ApprovalState.NOT_APPROVED ||
//             approvalB === ApprovalState.PENDING) &&
//             !mintInfo?.errorMessage && (
//               <Box className='flex fullWidth justify-between' mb={2}>
//                 {approvalA !== ApprovalState.APPROVED && (
//                   <Box
//                     width={
//                       approvalB !== ApprovalState.APPROVED ? '48%' : '100%'
//                     }
//                   >
//                     <StyledButton
//                       onClick={async () => {
//                         setApprovingA(true);
//                         try {
//                           await approveACallback();
//                           setApprovingA(false);
//                         } catch (e) {
//                           setApprovingA(false);
//                         }
//                       }}
//                       disabled={
//                         approvingA || approvalA === ApprovalState.PENDING
//                       }
//                     >
//                       {approvalA === ApprovalState.PENDING
//                         ? `${t('approving')} ${
//                             mintInfo?.currencies?.[Field.CURRENCY_A]?.symbol
//                           }`
//                         : `${t('approve')} ${
//                             mintInfo?.currencies?.[Field.CURRENCY_A]?.symbol
//                           }`}
//                     </StyledButton>
//                   </Box>
//                 )}
//                 {approvalB !== ApprovalState.APPROVED && (
//                   <Box
//                     width={
//                       approvalA !== ApprovalState.APPROVED ? '48%' : '100%'
//                     }
//                   >
//                     <StyledButton
//                       fullWidth
//                       onClick={async () => {
//                         setApprovingB(true);
//                         try {
//                           await approveBCallback();
//                           setApprovingB(false);
//                         } catch (e) {
//                           setApprovingB(false);
//                         }
//                       }}
//                       disabled={
//                         approvingB || approvalB === ApprovalState.PENDING
//                       }
//                     >
//                       {approvalB === ApprovalState.PENDING
//                         ? `${t('approving')} ${
//                             mintInfo?.currencies?.[Field.CURRENCY_B]?.symbol
//                           }`
//                         : `${t('approve')} ${
//                             mintInfo?.currencies?.[Field.CURRENCY_B]?.symbol
//                           }`}
//                     </StyledButton>
//                   </Box>
//                 )}
//               </Box>
//             )}

//           <StyledButton
//             disabled={
//               Boolean(account) &&
//               (Boolean(mintInfo?.errorMessage) ||
//                 approvalA !== ApprovalState.APPROVED ||
//                 approvalB !== ApprovalState.APPROVED)
//             }
//             onClick={account ? onAdd : connectWallet}
//           >
//             {' '}
//             {buttonText}
//           </StyledButton>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default AddLiquidityV3;
