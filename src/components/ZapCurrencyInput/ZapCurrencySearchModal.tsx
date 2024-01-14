import { ChainId, ETHER } from '@uniswap/sdk';
import { Currency } from '@uniswap/sdk-core';
import React, { useCallback } from 'react';
import { CustomModal } from 'components';
import ZapCurrencySearch from './ZapCurrencySearch';
import styles from 'styles/components/ZapCurrencySearchModal.module.scss';
import { WrappedTokenInfo } from 'state/lists/v3/wrappedTokenInfo';
import { TokenInfo } from '@uniswap/token-lists';
import { NativeCurrency, Currency as CurrencyV3 } from '@uniswap/sdk-core';
import { useIsV2 } from 'state/application/hooks';
import { useActiveWeb3React } from 'hooks';

interface ZapCurrencySearchModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  //TODO: Ignore typing to support new currency sdk
  onCurrencySelect: (currency: any) => void;
  otherSelectedCurrency?: Currency | null;
}

const ZapCurrencySearchModal: React.FC<ZapCurrencySearchModalProps> = ({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
}) => {
  const { isV2 } = useIsV2();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (!isV2) {
        if ((currency as CurrencyV3).isNative) {
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
    [isV2, onDismiss, onCurrencySelect, nativeCurrency],
  );

  return (
    <CustomModal
      open={isOpen}
      onClose={onDismiss}
      modalWrapper={styles.zapSearchModalWrapper}
      hideBackdrop={true}
    >
      <ZapCurrencySearch
        isOpen={isOpen}
        onDismiss={onDismiss}
        onCurrencySelect={handleCurrencySelect}
        selectedCurrency={selectedCurrency}
        otherSelectedCurrency={otherSelectedCurrency}
      />
    </CustomModal>
  );
};

export default ZapCurrencySearchModal;
