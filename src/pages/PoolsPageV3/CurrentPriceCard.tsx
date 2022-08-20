import React from "react";
import { Currency } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import Card from "components/v3/Card/Card";
import { AutoColumn } from "components/v3/Column";

interface CurrentPriceCardProps {
    inverted?: boolean;
    pool: Pool | null;
    currencyQuote?: Currency;
    currencyBase?: Currency;
}

export function CurrentPriceCard({ inverted, pool, currencyQuote, currencyBase }: CurrentPriceCardProps) {
    if (!pool || !currencyQuote || !currencyBase) return null;

    return (
        <Card isDark classes={"p-1 br-12"}>
            <AutoColumn gap="1">
                <span className={"c-lg fs-095 ta-c"} style={{ color: "var(--white)" }}>
                    Current price
                </span>
                <span className={"fs-125 ta-c"}>{(inverted ? pool.token1Price : pool.token0Price).toSignificant(6)} </span>
                <span className={"c-lg fs-085 ta-c"} style={{ color: "var(--white)" }}>
                    {currencyQuote?.symbol} per {currencyBase?.symbol}
                </span>
            </AutoColumn>
        </Card>
    );
}
