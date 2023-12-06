import React, { useCallback, useMemo, useState } from 'react';
import DualCurrencySearchModal from './DualCurrencySearchModal';
import { useAllTokens } from 'hooks/v3/Tokens';
import { useSetZapInputList, useZapInputList } from 'state/zap/hooks';
import DropdownDisplay from './DropdownDisplay';
import { useTranslation } from 'react-i18next';
import { Currency } from '@uniswap/sdk-core';
import { createFilterToken } from './filtering';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { DualCurrencySelector } from 'types/bond';
import { Box, CircularProgress } from '@material-ui/core';
import { toNativeCurrency } from 'utils';
import { DropdownItem, Dropdown } from 'components/Dropdown';

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
  const [openCurrencyModal, setOpenCurrencyModal] = useState(false);

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

  const currenciesList: any = useMemo(() => {
    const filterToken = createFilterToken(searchQuery);
    const parsedList = Object.values(zapInputList)
      .filter(filterToken)
      .sort(quickSorting)
      .map((token) => {
        return { currencyA: token, currencyB: null };
      });
    if (showNativeFirst) {
      return [
        {
          currencyA: toNativeCurrency(chainId),
          currencyB: null,
        },
        lpList[0],
        parsedList,
      ].flat();
    }
    return [
      lpList[0],
      {
        currencyA: toNativeCurrency(chainId),
        currencyB: null,
      },
      parsedList,
    ].flat();
  }, [searchQuery, zapInputList, showNativeFirst, lpList, chainId]);

  const handleCurrencyDynamic = useCallback(
    (currency: DualCurrencySelector) => {
      onCurrencySelect(currency);
      setSearchQuery('');
    },
    [onCurrencySelect],
  );

  const Item = useCallback(
    (item: Currency[], index: number) => {
      return (
        <DropdownItem
          key={index}
          onClick={() => handleCurrencyDynamic(currenciesList[index])}
          sx={{ width: '100%' }}
        >
          <DropdownDisplay
            principalToken={principalToken}
            inputCurrencies={item}
          />
        </DropdownItem>
      );
    },
    [currenciesList, handleCurrencyDynamic, principalToken],
  );

  return (
    <Box className='flex' minWidth='max-content'>
      {openCurrencyModal && (
        <DualCurrencySearchModal
          open={openCurrencyModal}
          onClose={() => setOpenCurrencyModal(false)}
          onCurrencySelect={handleCurrencyDynamic}
          inputCurrencies={inputCurrencies}
          currenciesList={currenciesList}
          searchQuery={searchQuery}
          handleSearchQuery={handleSearchQuery}
        />
      )}
      {inputCurrencies[0] ? (
        <Box className='flex'>
          {enableZap ? (
            <Dropdown
              component={
                <DropdownDisplay
                  principalToken={principalToken}
                  inputCurrencies={inputCurrencies}
                  active
                />
              }
            >
              {currenciesList.slice(0, 4).map((item: any, index: number) => {
                return Item([item.currencyA, item.currencyB], index);
              })}
              <DropdownItem
                sx={{ textAlign: 'center' }}
                onClick={() => setOpenCurrencyModal(true)}
              >
                <Box>{t('seeAll')}</Box>
              </DropdownItem>
            </Dropdown>
          ) : (
            <DropdownDisplay
              principalToken={principalToken}
              inputCurrencies={inputCurrencies}
              active
            />
          )}
        </Box>
      ) : (
        <CircularProgress size={15} />
      )}
    </Box>
  );
};

export default React.memo(DualCurrencyDropdown);
