import { Currency, Token } from '@uniswap/sdk-core'
import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { ExternalLink, TYPE } from '../../theme'
import { RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { WrappedCurrency } from '../../models/types'

interface LinkedCurrencyProps {
    chainId?: number;
    currency?: Currency
}

export function LinkedCurrency({ chainId, currency }: LinkedCurrencyProps) {
    const address = (currency as Token)?.address

    if (typeof chainId === 'number' && address) {
        return (
            <ExternalLink href={getExplorerLink(chainId, address, ExplorerDataType.TOKEN)}>
                <RowFixed>
                    <CurrencyLogo currency={currency as WrappedCurrency} size={'24px'}
                                  style={{ marginRight: '0.5rem' }} />
                    <TYPE.main>{currency?.symbol} ↗</TYPE.main>
                </RowFixed>
            </ExternalLink>
        )
    }
    return (
        <RowFixed>
            <CurrencyLogo currency={currency as WrappedCurrency} size={'24px'} style={{ marginRight: '0.5rem' }} />
            <TYPE.main>{currency?.symbol}</TYPE.main>
        </RowFixed>
    )
}
