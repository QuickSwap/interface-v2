import React, { useCallback, useMemo, useState } from 'react';
import DualCurrencySearchModal from './DualCurrencySearchModal';
import { useAllTokens } from 'hooks/Tokens';
import { useSetZapInputList, useZapInputList } from 'state/zap/hooks';
import DropdownDisplay from './DropdownDisplay';
import { useTranslation } from 'react-i18next';
import { Currency } from '@uniswap/sdk-core';
import { createFilterToken } from './filtering';
// import useModal from 'hooks/useModal';
// import { nativeOnChain } from 'config/constants/tokens';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { DualCurrencySelector } from 'types/bond';
import { Box, CircularProgress } from '@material-ui/core';

const DualCurrencyDropdown: React.FC<{
  inputCurrencies: Currency[];
  onCurrencySelect: (currency: DualCurrencySelector) => void;
  lpList: DualCurrencySelector[];
  principalToken: Currency | null;
  enableZap: boolean;
  showNativeFirst?: boolean;
}> = ({
  inputCurrencies,
  onCurrencySelect,
  lpList,
  principalToken,
  enableZap,
  showNativeFirst,
}) => {
  useSetZapInputList();
  const allTokens = useAllTokens();
  const rawZapInputList = useZapInputList();
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearchQuery = useCallback((val: string) => {
    setSearchQuery(val);
  }, []);

  const zapInputList = useMemo(() => {
    const addresses: any = [];
    if (rawZapInputList) {
      const listByChain = rawZapInputList[chainId as ChainId];
      for (const res of Object?.values(listByChain ?? [])) {
        if (res.address[chainId as ChainId]) {
          addresses.push(res.address[chainId as ChainId].toLowerCase());
        }
      }
    }
    const filteredZapInputTokens = Object.entries(allTokens).filter((token) =>
      addresses.includes(token[0].toLowerCase()),
    );
    return Object.fromEntries(filteredZapInputTokens);
  }, [allTokens, chainId, rawZapInputList]);

  const quickSorting = (token1: any, token2: any) => {
    // we might want to make this more involved. Sorting order is as follows: 1 WETH, 2 BUSD, 3 DAI, 4 USDC
    if (token1.symbol === 'WETH') {
      return -1;
    }
    if (token1.symbol === 'BUSD') {
      if (token2.symbol === 'WETH') {
        return 1;
      } else return -1;
    }
    if (token1.symbol === 'DAI') {
      if (token2.symbol === 'WETH' || token2.symbol === 'BUSD') {
        return 1;
      } else return -1;
    }
    if (token1.symbol === 'USDC') {
      if (
        token2.symbol === 'WETH' ||
        token2.symbol === 'BUSD' ||
        token2.symbol === 'DAI'
      ) {
        return 1;
      } else return -1;
    }
    return 1;
  };

  // const currenciesList: any = useMemo(() => {
  //   const filterToken = createFilterToken(searchQuery);
  //   const parsedList = Object.values(zapInputList)
  //     .filter(filterToken)
  //     .sort(quickSorting)
  //     .map((token) => {
  //       return { currencyA: token, currencyB: null };
  //     });
  //   if (showNativeFirst) {
  //     return [
  //       {
  //         currencyA: nativeOnChain(chainId as ChainId),
  //         currencyB: null,
  //       },
  //       lpList[0],
  //       parsedList,
  //     ].flat();
  //   }
  //   return [
  //     lpList[0],
  //     {
  //       currencyA: nativeOnChain(chainId as ChainId),
  //       currencyB: null,
  //     },
  //     parsedList,
  //   ].flat();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [zapInputList, searchQuery, showNativeFirst]);

  // const handleCurrencyDynamic = useCallback(
  //   (currency: DualCurrencySelector) => {
  //     onCurrencySelect(currency);
  //     setSearchQuery('');
  //   },
  //   [onCurrencySelect],
  // );

  // const [onPresentCurrencyModal] = useModal(
  //   <DualCurrencySearchModal
  //     onCurrencySelect={handleCurrencyDynamic}
  //     inputCurrencies={inputCurrencies}
  //     currenciesList={currenciesList}
  //     searchQuery={searchQuery}
  //     handleSearchQuery={handleSearchQuery}
  //   />,
  //   true,
  //   true,
  //   'DualCurrencySearch',
  // );

  // const Item = useCallback(
  //   (item: Currency[], index: number) => {
  //     return (
  //       <DropdownItem
  //         size='sm'
  //         key={index}
  //         onClick={() => handleCurrencyDynamic(currenciesList[index])}
  //         sx={{ width: '100%' }}
  //       >
  //         <DropdownDisplay
  //           principalToken={principalToken}
  //           inputCurrencies={item}
  //         />
  //       </DropdownItem>
  //     );
  //   },
  //   [currenciesList, handleCurrencyDynamic, principalToken],
  // );

  return (
    <Box className='flex' minWidth='max-content'>
      {inputCurrencies[0] ? (
        <Box className='flex'>
          {/* {enableZap ? (
            <Dropdown
              size='sm'
              component={
                <DropdownDisplay
                  principalToken={principalToken}
                  inputCurrencies={inputCurrencies}
                  active
                />
              }
              sx={{ width: '190px', zIndex: 1, background: 'white4' }}
            >
              {currenciesList.slice(0, 4).map((item: any, index: number) => {
                return Item([item.currencyA, item.currencyB], index);
              })}
              <DropdownItem
                size='sm'
                sx={{ textAlign: 'center' }}
                onClick={onPresentCurrencyModal}
              >
                <Text sx={{ '&:hover': { textDecoration: 'underline' } }}>
                  {t('See all')} &gt;
                </Text>
              </DropdownItem>
            </Dropdown>
          ) : (
            <Box>
              <Box>
                <DropdownDisplay
                  principalToken={principalToken}
                  inputCurrencies={inputCurrencies}
                  active
                />
              </Box>
            </Box>
          )} */}
        </Box>
      ) : (
        <CircularProgress size={15} />
      )}
    </Box>
  );
};

export default React.memo(DualCurrencyDropdown);
