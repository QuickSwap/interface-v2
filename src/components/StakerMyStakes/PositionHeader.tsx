import React, { useMemo } from "react";
import { NFTPositionIcon } from "./styled";
import { IsActive } from "./IsActive";
import CurrencyLogo from "../CurrencyLogo";
import { Token } from "@uniswap/sdk-core";
import { WrappedCurrency } from "../../models/types";
import Loader from "../Loader";
import { ChevronsUp, Send } from "react-feather";
import { Deposit, UnstakingInterface } from "../../models/interfaces";
import { t, Trans } from "@lingui/macro";
import { formatAmountTokens } from "utils/numbers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";

import BachelorTierIcon from "../../assets/images/bachelor-tier-icon.png";
import MasterTierIcon from "../../assets/images/master-tier-icon.png";
import ProfessorTierIcon from "../../assets/images/professor-tier-icon.png";

interface PositionHeaderProps {
    el: Deposit;
    unstaking: UnstakingInterface;
    setSendModal: any;
    setUnstaking: any;
    withdrawHandler: any;
}

export default function PositionHeader({ el, unstaking, setUnstaking, withdrawHandler, setSendModal }: PositionHeaderProps) {
    const tierLevel = useMemo(() => {
        if (!el.algbLocked || !el.lockedToken || !el.level) return;

        switch (+el.level) {
            case 0:
                return;
            case 1:
                return BachelorTierIcon;
            case 2:
                return MasterTierIcon;
            case 3:
                return ProfessorTierIcon;
            default:
                return;
        }
    }, [el]);

    const tierName = useMemo(() => {
        if (!el.algbLocked || !el.lockedToken || !el.level) return;

        switch (+el.level) {
            case 0:
                return;
            case 1:
                return t`Bachelor`;
            case 2:
                return t`Master`;
            case 3:
                return t`Professor`;
            default:
                return;
        }
    }, [el]);

    return (
        <div className={"my-stakes__position-card__header flex-s-between mb-1 br-8 p-1"}>
            <div className={"my-stakes__position-card__header__row"}>
                <div className={"f f-ac mxs_ml-0 mxs_mb-1"}>
                    <NFTPositionIcon name={el.id}>
                        <span>{el.id}</span>
                    </NFTPositionIcon>
                    <div className={"ml-05"}>
                        <IsActive el={el} />
                        <a
                            style={{ textDecoration: "underline" }}
                            className={"c-w fs-075"}
                            href={`https://app.algebra.finance/#/pool/${+el.id}?onFarming=true`}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <Trans>View position</Trans>
                        </a>
                    </div>
                </div>
                <div className={"f f-ac ml-2 mxs_ml-0 mxs_mv-1"}>
                    <CurrencyLogo currency={new Token(137, el.token0, 18, el.pool.token0.symbol) as WrappedCurrency} size={"35px"} />
                    <CurrencyLogo currency={new Token(137, el.token1, 18, el.pool.token1.symbol) as WrappedCurrency} size={"35px"} style={{ marginLeft: "-1rem" }} />
                    <div className={"ml-05"}>
                        <div className={"b fs-075"} style={{ marginBottom: "2px" }}>
                            <Trans>POOL</Trans>
                        </div>
                        <div>{`${el.pool.token0.symbol} / ${el.pool.token1.symbol}`}</div>
                    </div>
                </div>
                {el.lockedToken && Boolean(+el.algbLocked) && (
                    <div className={"f f-ac ml-2 mxs_ml-0 mxs_mv-1"}>
                        {/* <CurrencyLogo currency={new Token(137, el.lockedToken.id, 18, el.lockedToken.symbol) as WrappedCurrency} size={"35px"} /> */}
                        <div style={{ width: "35px", height: "35px", background: "#324e64", borderRadius: "50%" }} className={"f f-ac f-jc"}>
                            <img src={tierLevel} width={30} height={30} />
                        </div>
                        <div className={"ml-05"}>
                            <div className={"b fs-075"} style={{ marginBottom: "2px" }}>
                                <Trans>TIER</Trans>
                            </div>
                            <div>{tierName}</div>
                        </div>
                    </div>
                )}
                {el.lockedToken && Boolean(+el.algbLocked) && (
                    <div className={"f f-ac ml-2 mxs_ml-0 mxs_mv-1"}>
                        <CurrencyLogo currency={new Token(137, el.lockedToken.id, 18, el.lockedToken.symbol) as WrappedCurrency} size={"35px"} />
                        <div className={"ml-05"}>
                            <div className={"b fs-075"} style={{ marginBottom: "2px" }}>
                                <Trans>LOCKED</Trans>
                            </div>
                            <div>{`${formatAmountTokens(+formatUnits(BigNumber.from(el.algbLocked), el.lockedToken.decimals))} ${el.lockedToken.symbol}`}</div>
                        </div>
                    </div>
                )}
            </div>
            <div className={"my-stakes__position-card__header__row"}>
                {!el.incentive && !el.eternalFarming && (
                    <button
                        className={"btn c-w f f-ac b pv-05 ph-1 mxs_mv-05 mxs_f-jc"}
                        disabled={unstaking.id === el.id && unstaking.state !== "done"}
                        onClick={() => {
                            setUnstaking({ id: el.id, state: "pending" });
                            withdrawHandler(el.id);
                        }}
                    >
                        {unstaking && unstaking.id === el.id && unstaking.state !== "done" ? (
                            <>
                                <Loader size={"1rem"} stroke={"var(--white)"} style={{ margin: "auto" }} />
                                <span className={"ml-05"}>
                                    <Trans>Withdrawing</Trans>
                                </span>
                            </>
                        ) : (
                            <>
                                <ChevronsUp size={"1rem"} />
                                <span className={"ml-05"}>{t`Withdraw`}</span>
                            </>
                        )}
                    </button>
                )}
                <button className={"btn c-w f f-ac b pv-05 ph-1 ml-05 mxs_ml-0 mxs_f-jc"} onClick={() => setSendModal(el.L2tokenId)}>
                    <Send size={"1rem"} />
                    <span className={"ml-05"}>
                        <Trans>Send</Trans>
                    </span>
                </button>
            </div>
        </div>
    );
}
