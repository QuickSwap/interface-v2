import React, { useCallback, useMemo, useState } from 'react';
import { WrappedCurrency } from 'models/types';
import { Token, Currency } from '@uniswap/sdk-core';
import CurrencyLogo from 'components/CurrencyLogo';
import { ChevronRight } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import { useCurrencyBalance } from 'state/wallet/hooks';
import useUSDCPrice, { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import CurrencySearchModal from 'components/CurrencySearchModal';
import { Box } from '@material-ui/core';
import './index.scss';

interface ITokenCard {
  handleTokenSelection: (currency: Currency) => void;
  currency: Currency | null | undefined;
  otherCurrency: Currency | null | undefined;
  priceFormat: PriceFormats;
}

export function TokenCard({
  handleTokenSelection,
  currency,
  otherCurrency,
  priceFormat,
}: ITokenCard) {
  const [selectModal, toggleSelectModal] = useState(false);

  const { account } = useActiveWeb3React();

  const balance = useCurrencyBalance(
    account ?? undefined,
    currency ?? undefined,
  );
  const balanceUSD = useUSDCPrice(currency ?? undefined);

  const handleDismissSearch = useCallback(() => {
    toggleSelectModal(false);
  }, [toggleSelectModal]);

  const _balance = useMemo(() => {
    if (priceFormat === PriceFormats.USD) {
      if (balance && balanceUSD) {
        return parseFloat(
          Number(
            +balance?.toSignificant(5) * +balanceUSD.toSignificant(5),
          ).toFixed(4),
        );
      }
    }
    if (balance) {
      return parseFloat(balance.toSignificant(5));
    }

    return '0';
  }, [priceFormat, balance, balanceUSD]);

  return (
    <Box>
      <div
        className='token-card p-1 mxs_w-100 mm_w-100'
        onClick={() => toggleSelectModal(true)}
      >
        <div className='f mb-1'>
          <div className='token-card-logo'>
            <CurrencyLogo
              size={'35px'}
              currency={currency as WrappedCurrency}
            ></CurrencyLogo>
          </div>
          <div className={'f c f-jc ml-1'}>
            {currency && <div className='token-card__balance b'>BALANCE</div>}
            <div>{`${priceFormat === PriceFormats.USD && currency ? '$' : ''} ${
              currency ? _balance : `Not selected`
            }`}</div>
          </div>
        </div>
        <div className='token-card-selector'>
          <button
            className='token-card-selector__btn f f-ac w-100 f-jb'
            onClick={() => toggleSelectModal(true)}
          >
            <span>{currency ? currency.symbol : 'Select a token'}</span>
            <span className='token-card-selector__btn-chevron'>
              <ChevronRight className='ml-05' size={18} />
            </span>
          </button>
        </div>
      </div>
      {selectModal && (
        <CurrencySearchModal
          isOpen={selectModal}
          onDismiss={handleDismissSearch}
          onCurrencySelect={handleTokenSelection}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={true}
        ></CurrencySearchModal>
      )}
    </Box>
  );
}
