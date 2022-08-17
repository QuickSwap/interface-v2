import React, { ReactNode, useCallback, useContext, useState } from 'react'
import { TYPE } from 'theme/index'
import CurrencyLogo from 'components/CurrencyLogo'
import { unwrappedToken } from 'utils/unwrappedToken'
import { Currency } from '@uniswap/sdk-core'
import { ThemeContext } from 'styled-components/macro'
import JSBI from 'jsbi'
import { Bound } from 'state/mint/v3/actions'
import { RowFixedStyled } from './styled'
import { Position } from 'v3lib/entities'
import Card from '../Card/Card'
import { RowBetween, RowFixed } from '../Row'
import { WrappedCurrency } from 'models/types/Currency'
import { formatTickPrice } from 'utils/v3/formatTickPrice'
import { AutoColumn } from '../Column'
import RateToggle from '../RateToggle'
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo'
import RangeBadge from '../Badge/RangeBadge'

interface PositionPreviewProps {
    position: Position
    title?: ReactNode
    inRange: boolean
    baseCurrencyDefault?: Currency | undefined
    ticksAtLimit: { [bound: string]: boolean | undefined }
}

export const PositionPreview = ({ position, title, inRange, baseCurrencyDefault, ticksAtLimit }: PositionPreviewProps) => {
    const theme = useContext(ThemeContext)

    const currency0 = unwrappedToken(position.pool.token0)
    const currency1 = unwrappedToken(position.pool.token1)

    // track which currency should be base
    const [baseCurrency, setBaseCurrency] = useState(
        baseCurrencyDefault
            ? baseCurrencyDefault === currency0
                ? currency0
                : baseCurrencyDefault === currency1
                    ? currency1
                    : currency0
            : currency0
    )

    const sorted = baseCurrency === currency0
    const quoteCurrency = sorted ? currency1 : currency0

    const price = sorted ? position.pool.priceOf(position.pool.token0) : position.pool.priceOf(position.pool.token1)

    const priceLower = sorted ? position.token0PriceLower : position.token0PriceUpper.invert()
    const priceUpper = sorted ? position.token0PriceUpper : position.token0PriceLower.invert()

    const handleRateChange = useCallback(() => {
        setBaseCurrency(quoteCurrency)
    }, [quoteCurrency])

    const removed = position?.liquidity && JSBI.equal(position?.liquidity, JSBI.BigInt(0))

    return (
        <AutoColumn gap='md' style={{ marginTop: '0.5rem' }}>
            <div className={'flex-s-between mb-05 mxs_fd-c'}>
                <div className={'f f-ac mb-05 mxs_w-100 mxs_ml-2'}>
                    <DoubleCurrencyLogo
                        currency0={currency0 ?? undefined}
                        currency1={currency1 ?? undefined}
                        size={24}
                    />
                    <TYPE.label ml='10px' fontSize='24px' color={'white'}>
                        {currency0?.symbol} / {currency1?.symbol}
                    </TYPE.label>
                </div>
                <div className={'f mxs_w-100'}>
                    <RangeBadge removed={removed} inRange={inRange} />
                </div>
            </div>

            <Card isDark={title === 'Selected Range'} classes={'p-1 br-12'}>
                <AutoColumn gap='md'>
                    <RowBetween>
                        <RowFixed>
                            <CurrencyLogo currency={currency0 as WrappedCurrency} />
                            <TYPE.label ml='8px'>{currency0?.symbol}</TYPE.label>
                        </RowFixed>
                        <RowFixed>
                            <TYPE.label mr='8px'>{position.amount0.toSignificant(4)}</TYPE.label>
                        </RowFixed>
                    </RowBetween>
                    <RowBetween>
                        <RowFixed>
                            <CurrencyLogo currency={currency1 as WrappedCurrency} />
                            <TYPE.label ml='8px'>{currency1?.symbol}</TYPE.label>
                        </RowFixed>
                        <RowFixed>
                            <TYPE.label mr='8px'>{position.amount1.toSignificant(4)}</TYPE.label>
                        </RowFixed>
                    </RowBetween>
                    <RowBetween>
                        <TYPE.label>
                            Fee
                        </TYPE.label>
                        <TYPE.label>
                            {position?.pool?.fee / 10000}%
                        </TYPE.label>
                    </RowBetween>
                </AutoColumn>
            </Card>

            <AutoColumn gap='md'>
                <RowBetween>
                    {title ?
                        <TYPE.main color={'white'}>{title}</TYPE.main> :
                        <div />
                    }
                    <RateToggle
                        currencyA={sorted ? currency0 : currency1}
                        currencyB={sorted ? currency1 : currency0}
                        handleRateToggle={handleRateChange}
                    />
                </RowBetween>

                <div className={'flex-s-between cg-2 rg-1 mxs_fd-c'}>
                    <Card isDark={title === 'Selected Range'} classes={'p-1 br-12 w-100'}>
                        <AutoColumn gap='4px' justify='center'>
                            <TYPE.main fontSize='12px'>
                                Min Price
                            </TYPE.main>
                            <TYPE.mediumHeader textAlign='center'>{`${formatTickPrice(
                                priceLower,
                                ticksAtLimit,
                                Bound.LOWER
                            )}`}</TYPE.mediumHeader>
                            <TYPE.main textAlign='center' fontSize='12px'>
                                
                                {quoteCurrency.symbol} per {baseCurrency.symbol}
                                
                            </TYPE.main>
                            <TYPE.small textAlign='center' color={theme.text3}
                                        style={{ marginTop: '4px' }}>
                                Your position will be 100% composed
                                    of {baseCurrency?.symbol} at this price
                            </TYPE.small>
                        </AutoColumn>
                    </Card>

                    <Card isDark={title === 'Selected Range'} classes={'p-1 br-12 w-100'}>
                        <AutoColumn gap='4px' justify='center'>
                            <TYPE.main fontSize='12px'>
                                Max Price
                            </TYPE.main>
                            <TYPE.mediumHeader textAlign='center'>{`${formatTickPrice(
                                priceUpper,
                                ticksAtLimit,
                                Bound.UPPER
                            )}`}</TYPE.mediumHeader>
                            <TYPE.main textAlign='center' fontSize='12px'>
                                {quoteCurrency.symbol} per {baseCurrency.symbol}
                            </TYPE.main>
                            <TYPE.small textAlign='center' color={theme.text3}
                                        style={{ marginTop: '4px' }}>
                                Your position will be 100% composed
                                    of {quoteCurrency?.symbol} at this price
                            </TYPE.small>
                        </AutoColumn>
                    </Card>
                </div>
                <Card isDark={title === 'Selected Range'} classes={'p-1 br-12'}>
                    <AutoColumn gap='4px' justify='center'>
                        <TYPE.main fontSize='12px'>
                            Current price
                        </TYPE.main>
                        <TYPE.mediumHeader>{`${price.toSignificant(5)} `}</TYPE.mediumHeader>
                        <TYPE.main textAlign='center' fontSize='12px'>
                            {quoteCurrency.symbol} per {baseCurrency.symbol}
                        </TYPE.main>
                    </AutoColumn>
                </Card>
            </AutoColumn>
        </AutoColumn>
    )
}
