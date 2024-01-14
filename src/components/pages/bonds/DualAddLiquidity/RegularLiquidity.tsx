import React, { useCallback, useState } from 'react';
// import { Field } from 'state/mint/v2/actions';
// import AddLiquiditySign from 'views/V2/AddLiquidityV2/components/AddLiquiditySign';
// import PoolInfo from 'views/V2/AddLiquidityV2/components/PoolInfo';
// import AddLiquidityActions from 'views/V2/AddLiquidityV2/components/Actions';
// import { useSwapState } from 'state/swap/hooks/hooks';
// import { useCurrency } from 'hooks/Tokens';
// import DexPanel from 'components/DexPanel';
// import ModalProvider from '../../contexts/ModalContext';
// import { Pricing } from '../DexPanel/types';
import { Currency, Pair } from '@uniswap/sdk';
import { useTranslation } from 'next-i18next';
import { useActiveWeb3React } from 'hooks';
import { useDerivedMintInfo, useMintState } from 'state/mint/hooks';

interface RegularLiquidityProps {
  handleConfirmedTx: (hash: string, pairOut?: Pair) => void;
}

const RegularLiquidity: React.FC<RegularLiquidityProps> = ({
  handleConfirmedTx,
}) => {
  // const { t } = useTranslation();
  // const { chainId } = useActiveWeb3React();
  // const { INPUT, OUTPUT } = useSwapState();

  // // Set either param currency or swap currency
  // const setCurrencyIdA = INPUT.currencyId ?? '';
  // const setCurrencyIdB = OUTPUT.currencyId ?? '';

  // // Set currencies
  // const [currencyA, setCurrencyA] = useState(useCurrency(setCurrencyIdA));
  // const [currencyB, setCurrencyB] = useState(useCurrency(setCurrencyIdB));

  // // Handle currency selection
  // const handleCurrencySelect = useCallback(
  //   (field: Field, currency: Currency) => {
  //     const newCurrencyId = currency;
  //     if (field === Field.CURRENCY_A) {
  //       setCurrencyA(newCurrencyId);
  //     }
  //     if (field === Field.CURRENCY_B) {
  //       setCurrencyB(newCurrencyId);
  //     }
  //   },
  //   [],
  // );

  // // mint state
  // const { independentField, typedValue, otherTypedValue } = useMintState();
  // const {
  //   dependentField,
  //   currencies,
  //   currencyBalances,
  //   parsedAmounts,
  //   price,
  //   noLiquidity,
  //   liquidityMinted,
  //   poolTokenPercentage,
  //   error,
  // } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined);

  // const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  // // get formatted amounts
  // const formattedAmounts = {
  //   [independentField]: typedValue,
  //   [dependentField]: noLiquidity
  //     ? otherTypedValue
  //     : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  // };

  // // get the max amounts user can add
  // const maxAmounts: { [field in Field]?: CurrencyAmount<Token> } = [
  //   Field.CURRENCY_A,
  //   Field.CURRENCY_B,
  // ].reduce((accumulator, field) => {
  //   return {
  //     ...accumulator,
  //     [field]: maxAmountSpend(currencyBalances[field]),
  //   };
  // }, {});

  return (
    <></>
    // <ModalProvider>
    //   <Flex sx={styles.liquidityContainer}>
    //     {noLiquidity && (
    //       <Flex sx={styles.warningMessageContainer}>
    //         <Text size='14px' weight={700} mb='10px' color='primaryBright'>
    //           {t('You are the first liquidity provider.')}
    //         </Text>
    //         <Text
    //           size='12px'
    //           weight={500}
    //           color='primaryBright'
    //           sx={{ textAlign: 'center' }}
    //         >
    //           {t(
    //             'The ratio of tokens you add will set the price of this pool. Once you are happy with the rate click supply to review.',
    //           )}
    //         </Text>
    //       </Flex>
    //     )}
    //     <Flex sx={{ marginTop: '30px' }}>
    //       <DexPanel
    //         value={formattedAmounts[Field.CURRENCY_A]}
    //         panelText='Token 1'
    //         currency={currencyA}
    //         otherCurrency={currencyB}
    //         fieldType={Field.CURRENCY_A}
    //         onCurrencySelect={(cur: Currency) =>
    //           handleCurrencySelect(Field.CURRENCY_A, cur)
    //         }
    //         onUserInput={onFieldAInput}
    //         handleMaxInput={() => {
    //           onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '');
    //         }}
    //         showCommonBases
    //         pricing={Pricing.PRICEGETTER}
    //       />
    //     </Flex>
    //     <AddLiquiditySign />
    //     <DexPanel
    //       value={formattedAmounts[Field.CURRENCY_B]}
    //       panelText='Token 2'
    //       currency={currencyB}
    //       otherCurrency={currencyA}
    //       fieldType={Field.CURRENCY_B}
    //       onCurrencySelect={(cur: Currency) =>
    //         handleCurrencySelect(Field.CURRENCY_B, cur)
    //       }
    //       onUserInput={onFieldBInput}
    //       handleMaxInput={() => {
    //         onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '');
    //       }}
    //       showCommonBases
    //       pricing={Pricing.PRICEGETTER}
    //     />
    //     <PoolInfo
    //       currencies={currencies}
    //       poolTokenPercentage={poolTokenPercentage}
    //       noLiquidity={noLiquidity}
    //       price={price}
    //       chainId={chainId}
    //       liquidityMinted={liquidityMinted}
    //     />
    //     <AddLiquidityActions
    //       currencies={currencies}
    //       error={error}
    //       parsedAmounts={parsedAmounts}
    //       noLiquidity={noLiquidity}
    //       liquidityMinted={liquidityMinted}
    //       poolTokenPercentage={poolTokenPercentage}
    //       price={price}
    //       handleConfirmedTx={handleConfirmedTx}
    //     />
    //   </Flex>
    // </ModalProvider>
  );
};

export default React.memo(RegularLiquidity);
