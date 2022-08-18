import { t } from "@lingui/macro";
import { Currency } from "@uniswap/sdk-core";
import useUSDCPrice from "hooks/useUSDCPrice";
import { PriceFormats } from "pages/NewAddLiquidity/components/PriceFomatToggler";
import StartingPrice from "pages/NewAddLiquidity/components/StartingPrice";
import { StepTitle } from "pages/NewAddLiquidity/components/StepTitle";
import { USDPrices } from "pages/NewAddLiquidity/components/USDPrices";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAppDispatch } from "state/hooks";
import { updateCurrentStep } from "state/mint/v3/actions";
import { IDerivedMintInfo, useV3MintActionHandlers } from "state/mint/v3/hooks";

import "./index.scss";

interface IInitialPrice {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
    isCompleted: boolean;
    priceFormat: PriceFormats;
    backStep: number;
}

export function InitialPrice({ currencyA, currencyB, mintInfo, isCompleted, priceFormat, backStep }: IInitialPrice) {
    const currencyAUSDC = useUSDCPrice(currencyA ?? undefined);
    const currencyBUSDC = useUSDCPrice(currencyB ?? undefined);

    const dispatch = useAppDispatch();

    const { onStartPriceInput } = useV3MintActionHandlers(mintInfo.noLiquidity);

    const history = useHistory();

    useEffect(() => {
        return () => {
            if (history.action === "POP") {
                dispatch(updateCurrentStep({ currentStep: backStep }));
            }
        };
    }, []);

    return (
        <div className="initial-price-wrapper f c">
            <StepTitle title={t`Set initial price`} isCompleted={isCompleted} step={2} />
            <div className="f mxs_fd-c">
                <StartingPrice currencyA={currencyA} currencyB={currencyB} mintInfo={mintInfo} startPriceHandler={onStartPriceInput} priceFormat={priceFormat} />
                <div className="ml-2 mxs_ml-0 mxs_mt-1">
                    {currencyA && currencyB && <USDPrices currencyA={currencyA} currencyB={currencyB} currencyAUSDC={currencyAUSDC} currencyBUSDC={currencyBUSDC} priceFormat={priceFormat} />}
                </div>
            </div>
        </div>
    );
}
