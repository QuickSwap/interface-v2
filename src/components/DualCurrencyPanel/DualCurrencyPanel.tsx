import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DualCurrencyDropdown from './DualCurrencyDropdown';
// import useIsMobile from 'hooks/useIsMobile';
import { Currency, SupportedChainId } from '@uniswap/sdk-core';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
// import useTokenPriceUsd from 'hooks/useTokenPriceUsd';
// import { Flex, NumericInput, Text } from 'components/uikit';
// import Dots from 'components/Dots';
// import { nativeOnChain } from '../../config/constants/tokens';
import { DualCurrencySelector } from 'types/bond';
import { useActiveWeb3React } from 'hooks';
import { Box } from '@material-ui/core';

/**
 * Dropdown component that supports both single currencies and currency pairs. An array of pairs is passed as lpList,
 * while the single currencies are fetched by the component itself
 * @param handleMaxInput function to set max available user's balance
 * @param onUserInput function to set input's value
 * @param value input's value
 * @param onCurrencySelect function to select the input's currency (both single and pairs)
 * @param inputCurrencies selected currencies for the input
 * @param lpList param to define the list of pairs to be used by the component
 * @param enableZap determines whether zap functionality is enabled for the selected product
 */

interface DualCurrencyPanelProps {
  handleMaxInput: () => void;
  onUserInput: (val: string) => void;
  value: string;
  onCurrencySelect: (currency: DualCurrencySelector) => void;
  inputCurrencies: (Currency | null | undefined)[];
  lpList: DualCurrencySelector[];
  principalToken: Currency | null | undefined;
  enableZap?: boolean;
  lpUsdVal?: number;
}

const DualCurrencyPanel: React.FC<DualCurrencyPanelProps> = ({
  handleMaxInput,
  onUserInput,
  value,
  onCurrencySelect,
  inputCurrencies,
  lpList,
  principalToken,
  enableZap,
  lpUsdVal = 0,
}) => {
  const { account, chainId } = useActiveWeb3React();
  // const isMobile = useIsMobile();
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    inputCurrencies[1]
      ? principalToken ?? inputCurrencies[0] ?? undefined
      : inputCurrencies[0] ?? undefined,
  );
  const pairBalance = useCurrencyBalance(
    account,
    principalToken ?? inputCurrencies[0] ?? undefined,
  );
  const currencyBalance = selectedCurrencyBalance?.toSignificant(6);
  const { t } = useTranslation();

  // const [usdValue] = useTokenPriceUsd(
  //   inputCurrencies[1] ? principalToken : inputCurrencies[0],
  //   !!inputCurrencies[1],
  // );
  // const usdVal = inputCurrencies[1] ? lpUsdVal : usdValue;

  // // Once balances are fetched it should check if the user holds the selected LP
  // // if it doesn't, it will select the native coin to enable zap
  // const hasRunRef = useRef(false);
  // useEffect(() => {
  //   if (
  //     !hasRunRef.current &&
  //     enableZap &&
  //     pairBalance &&
  //     pairBalance?.toExact() === '0'
  //   ) {
  //     onCurrencySelect({
  //       currencyA: nativeOnChain(chainId as SupportedChainId),
  //       currencyB: undefined,
  //     });
  //     hasRunRef.current = true;
  //   }
  //   /* eslint-disable react-hooks/exhaustive-deps */
  // }, [pairBalance, chainId]);

  return (
    <Box className='flex'>
      {/* <Flex sx={styles.panelTopContainer}>
        <NumericInput
          value={value}
          onUserInput={(val) => onUserInput(val)}
          style={{ fontSize: isMobile ? '15px' : '22px', align: 'left' }}
          // removeLiquidity={isMobile}
        />
        <DualCurrencyDropdown
          inputCurrencies={inputCurrencies}
          onCurrencySelect={onCurrencySelect}
          lpList={lpList}
          principalToken={principalToken}
          enableZap={enableZap ?? true}
          showNativeFirst={enableZap && pairBalance?.toExact() === '0'}
        />
      </Flex>
      <Flex sx={styles.panelBottomContainer}>
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.4,
          }}
        >
          <Text size='12px' sx={styles.panelBottomText}>
            {!usdVal && value !== '0.0' ? (
              <Spinner width='15px' height='15px' />
            ) : value !== '0.0' && usdVal !== 0 && value ? (
              `$${(usdVal * parseFloat(value)).toFixed(2)}`
            ) : null}
          </Text>
        </Flex>
        {account && (
          <Flex sx={{ alignItems: 'center' }}>
            <Text size='12px' sx={styles.panelBottomText}>
              {t('Balance: %balance%', {
                balance: currencyBalance || 'loading',
              })}
              {!currencyBalance && <Dots />}
            </Text>
            {parseFloat(currencyBalance ?? '0') > 0 && (
              <Flex sx={styles.maxButton} size='sm' onClick={handleMaxInput}>
                <Text color='primaryBright' sx={{ lineHeight: '0px' }}>
                  {t('MAX')}
                </Text>
              </Flex>
            )}
          </Flex>
        )}
      </Flex> */}
    </Box>
  );
};

export default React.memo(DualCurrencyPanel);
