import React from 'react';
import { Box } from '@material-ui/core';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { ReactComponent as ZapIcon } from 'assets/images/bonds/ZapIcon.svg';
import { DoubleCurrencyLogo, CurrencyLogo } from 'components';
import { formatNumber } from 'utils';
import { BondToken } from 'types/bond';
import { ChainId } from '@uniswap/sdk';
import { isArray } from 'lodash';
import { useCurrencyFromSymbol } from 'hooks/Tokens';

const DropdownDisplay: React.FC<{
  principalToken?: BondToken;
  inputCurrency: Currency;
  chainId: ChainId;
}> = ({ principalToken, inputCurrency, chainId }) => {
  const isBondPrincipalTokenSelected =
    inputCurrency.isToken &&
    inputCurrency.address === principalToken?.address?.[chainId];
  const tokenName = isBondPrincipalTokenSelected
    ? principalToken?.symbol
    : inputCurrency.symbol;

  const tokenList = ['ETH', 'BNB', 'MATIC', 'IOTA'];
  let modifiedTokenName = tokenName?.toUpperCase();

  if (tokenName && tokenList.includes(tokenName)) {
    if (!inputCurrency.isNative) {
      modifiedTokenName = 'w' + tokenName;
    }
  }

  const splitedTokens = tokenName?.split('-');
  const isLP = isArray(splitedTokens) && splitedTokens.length > 1;

  const currency0 = useCurrencyFromSymbol(splitedTokens?.[0]);
  const currency1 = useCurrencyFromSymbol(splitedTokens?.[1]);

  return (
    <Box width='100%'>
      <Box className='flex items-center' gridGap='5px'>
        {!isBondPrincipalTokenSelected && <ZapIcon />}
        {isLP ? (
          <DoubleCurrencyLogo
            currency0={currency0}
            currency1={currency1}
            size={24}
          />
        ) : (
          <CurrencyLogo currency={currency0} size='24px' />
        )}
        <p className='weight-600'>{modifiedTokenName}</p>
      </Box>
    </Box>
  );
};

export default React.memo(DropdownDisplay);
