import { ChainId, Currency, currencyEquals, ETHER } from '@uniswap/sdk';
import React, { useCallback, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import { CustomModal } from 'components';
import useLast from 'hooks/useLast';
import CurrencySearch from './CurrencySearch';
import 'components/styles/CurrencySearchModal.scss';
import { WrappedTokenInfo } from 'state/lists/v3/wrappedTokenInfo';
import { TokenInfo } from '@uniswap/token-lists';
import { NativeCurrency } from '@uniswap/sdk-core';
import { useIsV3 } from 'state/application/hooks';
import { useActiveWeb3React } from 'hooks';

interface CurrencySearchModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  //TODO: Ignore typing to support new currency sdk
  onCurrencySelect: (currency: any) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
}

const CurrencySearchModal: React.FC<CurrencySearchModalProps> = ({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = false,
}) => {
  const { isV3 } = useIsV3();
  const [listView, setListView] = useState<boolean>(false);
  const lastOpen = useLast(isOpen);
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];
  useEffect(() => {
    if (isOpen && !lastOpen) {
      setListView(false);
    }
  }, [isOpen, lastOpen]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (isV3) {
        if (currencyEquals(currency, nativeCurrency)) {
          onCurrencySelect({
            ...nativeCurrency,
            isNative: true,
            isToken: false,
          } as NativeCurrency);
        } else {
          onCurrencySelect(new WrappedTokenInfo(currency as TokenInfo));
        }
      } else {
        onCurrencySelect(currency);
      }
      onDismiss();
    },
    [onDismiss, onCurrencySelect, isV3],
  );

  const handleClickChangeList = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Change Lists',
    });
    setListView(true);
  }, []);

  return (
    <CustomModal
      open={isOpen}
      onClose={onDismiss}
      modalWrapper={'searchModalWrapper'}
      hideBackdrop={true}
    >
      <CurrencySearch
        isOpen={isOpen}
        onDismiss={onDismiss}
        onCurrencySelect={handleCurrencySelect}
        onChangeList={handleClickChangeList}
        selectedCurrency={selectedCurrency}
        otherSelectedCurrency={otherSelectedCurrency}
        showCommonBases={showCommonBases}
      />
    </CustomModal>
  );
};

export default CurrencySearchModal;
