import { Check, Lock } from "react-feather";

import { Currency, CurrencyAmount, Token } from "@uniswap/sdk-core";

import "./index.scss";
import CurrencyLogo from "components/CurrencyLogo";
import { WrappedCurrency } from "models/types";
import { useCurrencyBalance } from "state/wallet/hooks";
import { useActiveWeb3React } from "hooks/web3";
import useUSDCPrice, { useUSDCValue } from "hooks/useUSDCPrice";
import { useCallback, useEffect, useMemo, useState } from "react";
import Input from "components/NumericalInput";
import Loader from "components/Loader";
import { PriceFormats } from "../PriceFomatToggler";
import { tryParseAmount } from "state/swap/hooks";
import { useBestV3TradeExactIn } from "hooks/useBestV3Trade";
import { USDC_POLYGON } from "constants/tokens";
import { useInitialTokenPrice, useInitialUSDPrices } from "state/mint/v3/hooks";
import { t, Trans } from "@lingui/macro";

interface ITokenAmountCard {
    currency: Currency | undefined | null;
    otherCurrency: Currency | undefined | null;
    value: string;
    fiatValue: CurrencyAmount<Token> | null;
    handleMax: () => void;
    handleInput: (value: string) => void;
    showApproval: boolean | undefined;
    handleApprove: () => void;
    isApproving: boolean;
    disabled: boolean;
    locked: boolean;
    isMax: boolean;
    error: string | undefined;
    priceFormat: PriceFormats;
    isBase: boolean;
}

export function TokenAmountCard({
    currency,
    otherCurrency,
    value,
    fiatValue,
    handleMax,
    handleInput,
    showApproval,
    handleApprove,
    isApproving,
    disabled,
    locked,
    isMax,
    error,
    priceFormat,
    isBase,
}: ITokenAmountCard) {
    const { account } = useActiveWeb3React();

    const balance = useCurrencyBalance(account ?? undefined, currency ?? undefined);
    const balanceUSD = useUSDCPrice(currency ?? undefined);

    const [localUSDValue, setLocalUSDValue] = useState("");
    const [localTokenValue, setLocalTokenValue] = useState("");

    const valueUSD = useUSDCValue(tryParseAmount(value, currency ? (currency.isNative ? currency.wrapped : currency) : undefined), true);
    const tokenValue = useBestV3TradeExactIn(tryParseAmount("1", USDC_POLYGON), currency ?? undefined);

    const currencyPrice = useUSDCPrice(currency ?? undefined);
    const otherCurrencyPrice = useUSDCPrice(otherCurrency ?? undefined);

    const initialUSDPrices = useInitialUSDPrices();
    const initialTokenPrice = useInitialTokenPrice();

    const isUSD = useMemo(() => {
        return priceFormat === PriceFormats.USD;
    }, [priceFormat]);

    const handleOnBlur = useCallback(() => {
        if (currency?.wrapped.address === USDC_POLYGON.address) {
            handleInput(localUSDValue);
            return;
        }

        if (isUSD && currencyPrice) {
            handleInput(String(+localUSDValue / +currencyPrice.toSignificant(5)));
            setLocalTokenValue(String(+localUSDValue / +currencyPrice.toSignificant(5)));
        } else if (isUSD && isBase && initialTokenPrice && otherCurrencyPrice) {
            handleInput(String(+localUSDValue * +initialTokenPrice * +otherCurrencyPrice.toSignificant(5)));
            setLocalTokenValue(String(+localUSDValue * +initialTokenPrice * +otherCurrencyPrice.toSignificant(5)));
        } else if (isUSD && initialUSDPrices.CURRENCY_A && initialUSDPrices.CURRENCY_B) {
            const initialUSDPrice = isBase ? initialUSDPrices.CURRENCY_B : initialUSDPrices.CURRENCY_A;
            handleInput(String(+localUSDValue / +initialUSDPrice));
            setLocalTokenValue(String(+localUSDValue / +initialUSDPrice));
        } else if (isUSD && initialTokenPrice && !isBase && otherCurrencyPrice) {
            handleInput(String(+localUSDValue * +initialTokenPrice * +otherCurrencyPrice.toSignificant(5)));
            setLocalTokenValue(String(+localUSDValue * +initialTokenPrice * +otherCurrencyPrice.toSignificant(5)));
        } else if (!isUSD) {
            if (currencyPrice) {
                setLocalUSDValue(String(+localTokenValue * +currencyPrice.toSignificant(5)));
            } else if (isBase && initialUSDPrices.CURRENCY_B) {
                setLocalUSDValue(String(+localTokenValue * +initialUSDPrices.CURRENCY_B));
            } else if (!isBase && initialUSDPrices.CURRENCY_A) {
                setLocalUSDValue(String(+localTokenValue * +initialUSDPrices.CURRENCY_A));
            }
            handleInput(localTokenValue);
        }
    }, [localTokenValue, localUSDValue, tokenValue, valueUSD, currencyPrice, handleInput]);

    useEffect(() => {
        if (value) {
            if (currencyPrice) {
                setLocalUSDValue(String(+value * +currencyPrice.toSignificant(5)));
            } else if (isBase && initialUSDPrices.CURRENCY_B) {
                setLocalUSDValue(String(+value * +initialUSDPrices.CURRENCY_B));
            } else if (!isBase && initialUSDPrices.CURRENCY_A) {
                setLocalUSDValue(String(+value * +initialUSDPrices.CURRENCY_A));
            } else if (initialTokenPrice && otherCurrencyPrice) {
                setLocalUSDValue(String(+value * +initialTokenPrice * +otherCurrencyPrice.toSignificant(5)));
            }

            setLocalTokenValue(value);
        }
    }, [initialTokenPrice, initialUSDPrices, currencyPrice, otherCurrencyPrice, value]);

    const balanceString = useMemo(() => {
        if (!balance || !currency) return <Loader stroke={"white"} />;

        const _balance =
            isUSD && balanceUSD
                ? String(parseFloat(String((+balance.toSignificant(5) * +balanceUSD.toSignificant(5)).toFixed(5))))
                : String(parseFloat(String(Number(balance.toSignificant(5)).toFixed(5))));

        if (_balance.split(".")[0].length > 10) {
            return `${isUSD ? "$ " : ""}${_balance.slice(0, 7)}...${isUSD ? "" : ` ${currency.symbol}`}`;
        }

        if (+balance.toFixed() === 0) {
            return `${isUSD ? "$ " : ""}0${isUSD ? "" : ` ${currency.symbol}`}`;
        }
        if (+balance.toFixed() < 0.0001) {
            return `< ${isUSD ? "$ " : ""}0.0001${isUSD ? "" : ` ${currency.symbol}`}`;
        }

        return `${isUSD ? "$ " : ""}${_balance}${isUSD ? "" : ` ${currency.symbol}`}`;
    }, [balance, isUSD, fiatValue, currency]);

    return (
        <div className="token-amount-card-wrapper p-1 f c pos-r mxs_w-100 ms_w-100 mm_w-100">
            {locked && (
                <div className="token-amount-card__locked w-100 full-h pos-a f c f-ac f-jc">
                    <div>
                        <Trans>Price is outside specified price range.</Trans>
                    </div>
                    <div className="mt-05">
                        <Trans>Single-asset deposit only.</Trans>
                    </div>
                </div>
            )}
            <div className="f f-ac mb-1" style={{ pointerEvents: locked ? "none" : "unset" }}>
                <div className="token-amount-card__logo">
                    <CurrencyLogo size={"35px"} currency={currency as WrappedCurrency}></CurrencyLogo>
                </div>
                <div className="ml-1">
                    <div className="f f-ac mxs_fd-c ms_f-as">
                        <span className="mr-05 mb-025">
                            <Trans>Balance: </Trans>
                        </span>
                        <span>{balanceString}</span>
                    </div>
                    <div>
                        <button onClick={handleMax} disabled={isMax || balance?.toSignificant(5) === "0"} className="token-amount-card__max-btn">
                            <Trans>MAX</Trans>
                        </button>
                    </div>
                </div>
                <div className="ml-a">
                    {showApproval ? (
                        isApproving ? (
                            <button className="token-amount-card__approve-btn f f-ac" disabled>
                                <Loader style={{ marginRight: "3px" }} stroke="white" />
                                <span>
                                    <Trans>Approving</Trans>
                                </span>
                            </button>
                        ) : (
                            <button className="token-amount-card__approve-btn" onClick={handleApprove}>
                                <Trans>Approve</Trans>
                            </button>
                        )
                    ) : showApproval !== undefined ? (
                        <div className="token-amount-card__approved f f-ac">
                            <span>
                                <Check size={16} />
                            </span>
                            <span className="fs-085" style={{ marginLeft: "3px" }}>
                                <Trans>Approved</Trans>
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>
            <div className="f pos-r f-ac">
                {isUSD && (
                    <label htmlFor={`amount-${currency?.symbol}`} className="token-amount-card__usd">
                        $
                    </label>
                )}
                <Input
                    value={isUSD ? localUSDValue : localTokenValue}
                    id={`amount-${currency?.symbol}`}
                    disabled={locked}
                    onBlur={handleOnBlur}
                    onUserInput={(val) => (isUSD ? setLocalUSDValue(val.trim()) : setLocalTokenValue(val.trim()))}
                    className={`token-amount-card__input ${isUSD ? "is-usd" : ""} mb-05 w-100`}
                    placeholder={t`Enter an amount`}
                />
            </div>
            {error && <div className="token-amount-card__error mt-05">{error}</div>}
        </div>
    );
}
