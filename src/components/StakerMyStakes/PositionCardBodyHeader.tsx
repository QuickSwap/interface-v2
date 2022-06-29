import { t, Trans } from "@lingui/macro";
import React, { useMemo } from "react";
import { FarmingType } from "../../models/enums";
import "./index.scss";

interface PositionCardBodyHeaderProps {
    farmingType: number;
    date: string;
    eternalFarming?: any;
    enteredInEternalFarming?: any;
    el?: any;
}

export default function PositionCardBodyHeader({ el, farmingType, date, enteredInEternalFarming, eternalFarming }: PositionCardBodyHeaderProps) {
    const tierMultiplier = useMemo(() => {
        if (!el || farmingType !== FarmingType.FINITE || !el.level || !el.lockedToken) return;

        switch (+el.level) {
            case 0:
                return;
            case 1:
                return el.level1multiplier;
            case 2:
                return el.level2multiplier;
            case 3:
                return el.level3multiplier;
            default:
                return;
        }
    }, [el, farmingType]);

    return (
        <div className={`flex-s-between b mb-1 fs-125 ${farmingType === FarmingType.ETERNAL ? "farming-card-header ms_fd-c" : ""}`}>
            <span className={"w-100"}>
                <span>{farmingType === FarmingType.FINITE ? t`Limit ` : t`Infinite `}</span>
                <span>&nbsp;</span>
                <span>
                    <Trans> Farming</Trans>
                </span>
            </span>
            {farmingType === FarmingType.ETERNAL && enteredInEternalFarming && eternalFarming && (
                <span className={"fs-085 l w-100 ms_ta-l mxs_ta-l ta-r"}>
                    <span>
                        <Trans>Entered at: </Trans>
                    </span>
                    <span>{date.slice(0, -3)}</span>
                </span>
            )}
            {farmingType === FarmingType.FINITE && tierMultiplier && (
                <span className={"fs-1 l w-100 ms_ta-l mxs_ta-r ta-r"}>
                    <span>
                        <Trans>Tier bonus: </Trans>
                    </span>
                    <span style={{ color: "#33FF89" }}>{`+${tierMultiplier / 100}%`}</span>
                </span>
            )}
        </div>
    );
}
