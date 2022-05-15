import React from 'react';
import { ChainId, Currency, currencyEquals, ETHER, Token } from '@uniswap/sdk';
import { Box, Typography } from '@material-ui/core';
import { GlobalData } from 'constants/index';
import { CurrencyLogo, QuestionHelper } from 'components';

interface CommonBasesProps {
  chainId?: ChainId;
  selectedCurrency?: Currency | null;
  onSelect: (currency: Currency) => void;
}

const CommonBases: React.FC<CommonBasesProps> = ({
  chainId,
  onSelect,
  selectedCurrency,
}) => {
  return (
    <Box mb={2}>
      <Box display='flex' className='title' my={1.5}>
        <Typography variant='caption'>Common bases</Typography>
        <QuestionHelper text='These tokens are commonly paired with other tokens.' />
      </Box>
      <Box display='flex' flexWrap='wrap'>
        <Box
          className='baseWrapper'
          onClick={() => {
            if (!selectedCurrency || !currencyEquals(selectedCurrency, ETHER)) {
              onSelect(ETHER);
            }
          }}
        >
          <CurrencyLogo currency={ETHER} size='24px' />
          <Typography variant='body2'>MATIC</Typography>
        </Box>
        {(chainId ? GlobalData.bases.SUGGESTED_BASES[chainId] : []).map(
          (token: Token) => {
            const selected =
              selectedCurrency instanceof Token &&
              selectedCurrency.address === token.address;
            return (
              <Box
                className='baseWrapper'
                key={token.address}
                onClick={() => !selected && onSelect(token)}
              >
                <CurrencyLogo currency={token} size='24px' />
                <Typography variant='body2'>{token.symbol}</Typography>
              </Box>
            );
          },
        )}
      </Box>
    </Box>
  );
};

export default CommonBases;
