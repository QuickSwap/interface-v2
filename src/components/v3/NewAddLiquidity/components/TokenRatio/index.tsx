import { Trans } from "@lingui/macro";
import { Currency } from "@uniswap/sdk-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Divide } from "react-feather";

import "./index.scss";
import { invert } from "polished";

interface ITokenRatio {
    currencyA: Currency | null | undefined;
    currencyB: Currency | null | undefined;
    token0Ratio: string;
    token1Ratio: string;
    decrementLeft: () => string;
    decrementRight: (rate?: number) => string;
    incrementLeft: (rate?: number) => string;
    incrementRight: () => string;
    onUserLeftInput: (a: string) => void;
    onUserRightInput: (a: string) => void;
    decrementDisabled?: boolean;
    incrementDisabled?: boolean;
    disabled: boolean;
    lowerPrice: string | undefined;
    upperPrice: string | undefined;
}

export function TokenRatio({
    currencyA,
    currencyB,
    token0Ratio,
    token1Ratio,
    decrementLeft,
    decrementRight,
    incrementLeft,
    incrementRight,
    onUserLeftInput,
    onUserRightInput,
    decrementDisabled = false,
    incrementDisabled = false,
    disabled,
    lowerPrice,
    upperPrice,
}: ITokenRatio) {
    const isEmpty = useMemo(() => {
        return token0Ratio === "0" && token1Ratio === "0";
    }, [token0Ratio, token1Ratio]);
    const [disableRightDecButton, setRDecButton] = useState(false);
    const [disableLeftIncButton, setLIncButton] = useState(false);

    // for button clicks
    const handleDecrementLeft = useCallback(() => {
        if (disableLeftIncButton) {
            setLIncButton(false);
        }
        if (disableRightDecButton) {
            setRDecButton(false);
        }
        onUserLeftInput(decrementLeft());
    }, [disableLeftIncButton, decrementLeft, onUserLeftInput]);

    const handleDecrementRight = useCallback(() => {
        onUserRightInput(decrementRight());
    }, [decrementRight, onUserRightInput]);

    useEffect(() => {
        if (!lowerPrice) return;

        const decr = decrementRight(2);

        if (+decr <= +lowerPrice) {
            setRDecButton(true);
            return;
        }
    }, [handleDecrementRight, decrementRight, lowerPrice]);

    const handleIncrementLeft = useCallback(() => {
        onUserLeftInput(incrementLeft());
    }, [incrementLeft, onUserLeftInput]);

    useEffect(() => {
        if (!upperPrice) return;

        const incr = incrementLeft(2);

        if (+incr >= +upperPrice) {
            setLIncButton(true);
            return;
        }
    }, [handleIncrementLeft, incrementLeft, upperPrice]);

    const handleIncrementRight = useCallback(() => {
        if (disableLeftIncButton) {
            setLIncButton(false);
        }
        if (disableRightDecButton) {
            setRDecButton(false);
        }
        onUserRightInput(incrementRight());
    }, [disableRightDecButton, upperPrice, lowerPrice, incrementRight, onUserRightInput]);

    return (
        <div className={"preset-ranges-wrapper pl-1 mxs_pl-0 mxs_mb-1 ms_pl-0 ms_mb-1"}>
            <div className="mb-1 f f-ac">
                <Divide style={{ display: "block", fill: "currentcolor" }} size={15} />
                <span className="ml-05">
                    <Trans>Token ratio</Trans>
                </span>
            </div>
            <div className="f full-h pos-r">
                <div className="token-ratio f ms_w-100" style={{ opacity: isEmpty ? "0.5" : "1" }}>
                    <div className="token-ratio__part full-h" style={{ width: `${token0Ratio}%`, background: "#707eff", borderRadius: +token0Ratio === 100 ? "8px" : "8px 0 0 8px" }}></div>
                    <div className="token-ratio__part full-h" style={{ width: `${token1Ratio}%`, background: "#ec92ff", borderRadius: +token1Ratio === 100 ? "8px" : "0 8px 8px 0" }}></div>
                </div>
            </div>
            <div className="mt-1" style={{ opacity: isEmpty ? 0.5 : "1" }}>
                <div className="f mb-1 f-ac">
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#707eff" }}></div>
                    <div className="ml-05">{currencyA?.symbol}</div>
                    <div className="ml-a mr-1">{`${Number(token0Ratio).toPrecision(3)}%`}</div>
                    <div className="">
                        <button onClick={handleDecrementLeft} disabled={decrementDisabled || disabled} className="range-input__btn">
                            -
                        </button>
                        <button onClick={handleIncrementLeft} disabled={disableLeftIncButton || incrementDisabled || disabled} className="range-input__btn">
                            +
                        </button>
                    </div>
                </div>
                <div className="f f-ac">
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#ec92ff" }}></div>
                    <div className="ml-05">{currencyB?.symbol}</div>
                    <div className="ml-a mr-1">{`${isEmpty ? 0 : (100 - +token0Ratio).toPrecision(3)}%`}</div>
                    <div className="">
                        <button onClick={handleDecrementRight} disabled={disableRightDecButton || decrementDisabled || disabled} className="range-input__btn">
                            +
                        </button>
                        <button onClick={handleIncrementRight} disabled={incrementDisabled || disabled} className="range-input__btn">
                            -
                        </button>
                    </div>
                </div>
            </div>
            <p className={"mt-1 fs-085"}>
                <Trans>Token ratio depends on selected price range.</Trans>
            </p>
            <p className={"mt-05 fs-085"}>
                <Trans>Ratio adjustment moves it.</Trans>
            </p>
        </div>
    );
}
