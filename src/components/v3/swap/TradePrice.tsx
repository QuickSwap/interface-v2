import { useCallback } from 'react'
import { Currency, Price } from '@uniswap/sdk-core'
import { Text } from 'rebass'
import { StyledPriceContainer } from './styled'

interface TradePriceProps {
    price: Price<Currency, Currency>
    showInverted: boolean
    setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {

    let formattedPrice: string
    try {
        formattedPrice = showInverted ? price.toSignificant(4) : price.invert()?.toSignificant(4)
    } catch (error) {
        formattedPrice = '0'
    }

    const label = showInverted ? `${price.quoteCurrency?.symbol}` : `${price.baseCurrency?.symbol} `
    const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`
    const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

    const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`

    return (
        <StyledPriceContainer onClick={flipPrice} title={text}>
            <div style={{ alignItems: 'center', display: 'flex', width: 'fit-content' }}>
                <Text fontWeight={500} fontSize={14} color={'var(--primary)'}>
                    {text}
                </Text>
            </div>
        </StyledPriceContainer>
    )
}
