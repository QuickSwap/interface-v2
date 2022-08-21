import { Currency, Token } from '@uniswap/sdk-core';
import { TYPE } from 'theme/index';
import CurrencyLogo from '../../components/CurrencyLogo';
import { WrappedCurrency } from '../../models/types';
import { ExternalLink } from 'theme/components';
import { getEtherscanLink, ExplorerDataType } from 'utils';
import { RowFixed } from 'components/v3/Row';

interface LinkedCurrencyProps {
  chainId?: number;
  currency?: Currency;
}

export function LinkedCurrency({ chainId, currency }: LinkedCurrencyProps) {
  const address = (currency as Token)?.address;

  if (typeof chainId === 'number' && address) {
    return (
      <ExternalLink
        href={getEtherscanLink(chainId, address, ExplorerDataType.TOKEN)}
      >
        <RowFixed>
          <CurrencyLogo
            currency={currency as WrappedCurrency}
            size={'24px'}
            style={{ marginRight: '0.5rem' }}
          />
          <TYPE.main>{currency?.symbol} ↗</TYPE.main>
        </RowFixed>
      </ExternalLink>
    );
  }
  return (
    <RowFixed>
      <CurrencyLogo
        currency={currency as WrappedCurrency}
        size={'24px'}
        style={{ marginRight: '0.5rem' }}
      />
      <TYPE.main>{currency?.symbol}</TYPE.main>
    </RowFixed>
  );
}
