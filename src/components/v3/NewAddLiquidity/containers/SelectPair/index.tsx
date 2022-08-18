import { PoolStats } from "pages/NewAddLiquidity/components/PoolStats";
import { PopularPairs } from "pages/NewAddLiquidity/components/PopularPairs";
import { TokenCard } from "pages/NewAddLiquidity/components/TokenCard";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "react-feather";
import { Currency } from "@uniswap/sdk-core";
import "./index.scss";
import { fetchPoolsAPR } from "utils/api";
import { computePoolAddress } from "hooks/computePoolAddress";
import { POOL_DEPLOYER_ADDRESS } from "constants/addresses";
import { useInfoLiquidity } from "hooks/subgraph/useInfoLiquidity";
import Loader from "components/Loader";
import { IDerivedMintInfo } from "state/mint/v3/hooks";
import { PoolState } from "hooks/usePools";
import { StepTitle } from "pages/NewAddLiquidity/components/StepTitle";
import { PriceFormats } from "pages/NewAddLiquidity/components/PriceFomatToggler";
import { useHistory } from "react-router-dom";
import { t } from "@lingui/macro";
import { Helmet } from "react-helmet";

interface ISelectPair {
    baseCurrency: Currency | null | undefined;
    quoteCurrency: Currency | null | undefined;
    mintInfo: IDerivedMintInfo;
    isCompleted: boolean;
    priceFormat: PriceFormats;
    handleCurrencySwap: () => void;
    handleCurrencyASelect: (newCurrency: Currency) => void;
    handleCurrencyBSelect: (newCurrency: Currency) => void;
    handlePopularPairSelection: (pair: [string, string]) => void;
}

export function SelectPair({
    baseCurrency,
    quoteCurrency,
    mintInfo,
    isCompleted,
    priceFormat,
    handleCurrencySwap,
    handleCurrencyASelect,
    handleCurrencyBSelect,
    handlePopularPairSelection,
}: ISelectPair) {
    const history = useHistory();

    const [aprs, setAprs] = useState<undefined | { [key: string]: number }>();

    const {
        fetchPopularPools: { popularPools, popularPoolsLoading, fetchPopularPoolsFn },
    } = useInfoLiquidity();

    useEffect(() => {
        fetchPoolsAPR().then(setAprs);
        fetchPopularPoolsFn();
    }, []);

    const farmings: any[] = [];

    const feeString = useMemo(() => {
        if (mintInfo.poolState === PoolState.INVALID || mintInfo.poolState === PoolState.LOADING) return <Loader stroke="#22cbdc" />;

        if (mintInfo.noLiquidity) return t`0.01% fee`;

        return t`${(mintInfo.dynamicFee / 10000).toFixed(3)}% fee`;
    }, [mintInfo]);

    const aprString = useMemo(() => {
        if (!aprs || !baseCurrency || !quoteCurrency) return <Loader stroke="#22dc22" />;

        const poolAddress = computePoolAddress({
            poolDeployer: POOL_DEPLOYER_ADDRESS[137],
            tokenA: baseCurrency.wrapped,
            tokenB: quoteCurrency.wrapped,
        }).toLowerCase();

        return aprs[poolAddress] ? `${aprs[poolAddress].toFixed(2)}% APR` : undefined;
    }, [baseCurrency, quoteCurrency, aprs]);

    useEffect(() => {
        return () => {
            if (history.action === "POP") {
                history.push("/pool");
            }
        };
    }, []);

    return (
        <div className="select-pair-wrapper f c">
            <StepTitle title={"Select a pair"} isCompleted={isCompleted} step={1} />
            <div className="f mxs_fd-cr mxs_fd-cr ms_fd-cr mm_fd-cr">
                <div className="token-pairs-wrapper f c">
                    <div className="f mxs_fd-c ms_fd-cr">
                        <TokenCard currency={baseCurrency} otherCurrency={quoteCurrency} handleTokenSelection={handleCurrencyASelect} priceFormat={priceFormat}></TokenCard>
                        <div className={`token-pairs-plus ${baseCurrency && quoteCurrency ? "swap-btn" : ""} mh-1 mt-a mb-a f f-ac f-jc ms_mt-1 ms_mb-1 ms_ml-a ms_mr-a`}>
                            {baseCurrency && quoteCurrency && (
                                <div className="f f-ac f-jc full-wh" onClick={handleCurrencySwap}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M2.64645 3.64645C2.45118 3.84171 2.45118 4.15829 2.64645 4.35355L5.82843 7.53553C6.02369 7.7308 6.34027 7.7308 6.53553 7.53553C6.7308 7.34027 6.7308 7.02369 6.53553 6.82843L3.70711 4L6.53553 1.17157C6.7308 0.976311 6.7308 0.659728 6.53553 0.464466C6.34027 0.269204 6.02369 0.269204 5.82843 0.464466L2.64645 3.64645ZM13 3.5L3 3.5V4.5L13 4.5V3.5Z"
                                            fill="white"
                                        />
                                        <path
                                            d="M13.3536 12.3536C13.5488 12.1583 13.5488 11.8417 13.3536 11.6464L10.1716 8.46447C9.97631 8.26921 9.65973 8.26921 9.46447 8.46447C9.2692 8.65973 9.2692 8.97631 9.46447 9.17157L12.2929 12L9.46447 14.8284C9.2692 15.0237 9.2692 15.3403 9.46447 15.5355C9.65973 15.7308 9.97631 15.7308 10.1716 15.5355L13.3536 12.3536ZM3 12.5L13 12.5L13 11.5L3 11.5L3 12.5Z"
                                            fill="white"
                                        />
                                    </svg>
                                </div>
                            )}
                            {(!baseCurrency || !quoteCurrency) && <Plus size={16} />}
                        </div>
                        <TokenCard currency={quoteCurrency} otherCurrency={baseCurrency} handleTokenSelection={handleCurrencyBSelect} priceFormat={priceFormat}></TokenCard>
                    </div>

                    <div className="mt-1">
                        {baseCurrency && quoteCurrency && (
                            <PoolStats
                                fee={feeString}
                                apr={aprString}
                                loading={mintInfo.poolState === PoolState.LOADING || mintInfo.poolState === PoolState.INVALID}
                                noLiquidity={mintInfo.noLiquidity}
                            ></PoolStats>
                        )}
                    </div>
                </div>
                <div className="token-pairs__popular-wrapper mh-2 mxs_ml-0 mxs_mr-0 mm_ml-0 mm_mr-0">
                    <PopularPairs handlePopularPairSelection={handlePopularPairSelection} pairs={popularPools} farmings={farmings}></PopularPairs>
                </div>
            </div>
        </div>
    );
}
