import { t, Trans } from "@lingui/macro";
import { useMemo } from "react";
import { Layers } from "react-feather";
import { Presets } from "state/mint/v3/reducer";
import "./index.scss";

export interface IPresetArgs {
    type: Presets;
    min: number;
    max: number;
}

interface IPresetRanges {
    isInvalid: boolean;
    outOfRange: boolean;
    isStablecoinPair: boolean;
    activePreset: Presets | null;
    handlePresetRangeSelection: (preset: IPresetArgs | null) => void;
    priceLower: string | undefined;
    priceUpper: string | undefined;
    price: string | undefined;
}

enum PresetProfits {
    VERY_LOW,
    LOW,
    MEDIUM,
    HIGH,
}

export function PresetRanges({ isStablecoinPair, activePreset, handlePresetRangeSelection, priceLower, price, priceUpper, isInvalid, outOfRange }: IPresetRanges) {
    const ranges = useMemo(() => {
        if (isStablecoinPair)
            return [
                {
                    type: Presets.STABLE,
                    title: t`Stablecoins`,
                    min: 0.984,
                    max: 1.01,
                    risk: PresetProfits.VERY_LOW,
                    profit: PresetProfits.HIGH,
                },
            ];

        return [
            {
                type: Presets.FULL,
                title: t`Full range`,
                min: 0,
                max: Infinity,
                risk: PresetProfits.VERY_LOW,
                profit: PresetProfits.VERY_LOW,
            },
            {
                type: Presets.SAFE,
                title: t`Safe`,
                min: 0.8,
                max: 1.4,
                risk: PresetProfits.LOW,
                profit: PresetProfits.LOW,
            },
            {
                type: Presets.NORMAL,
                title: t`Common`,
                min: 0.9,
                max: 1.2,
                risk: PresetProfits.MEDIUM,
                profit: PresetProfits.MEDIUM,
            },
            {
                type: Presets.RISK,
                title: t`Expert`,
                min: 0.95,
                max: 1.1,
                risk: PresetProfits.HIGH,
                profit: PresetProfits.HIGH,
            },
        ];
    }, [isStablecoinPair]);

    const risk = useMemo(() => {
        if (!priceUpper || !priceLower || !price) return;

        const upperPercent = 100 - (+price / +priceUpper) * 100;
        const lowerPercent = Math.abs(100 - (+price / +priceLower) * 100);

        const rangePercent = +priceLower > +price && +priceUpper > 0 ? upperPercent - lowerPercent : upperPercent + lowerPercent;

        if (rangePercent < 7.5) {
            return 5;
        } else if (rangePercent < 15) {
            return (15 - rangePercent) / 7.5 + 4;
        } else if (rangePercent < 30) {
            return (30 - rangePercent) / 15 + 3;
        } else if (rangePercent < 60) {
            return (60 - rangePercent) / 30 + 2;
        } else if (rangePercent < 120) {
            return (120 - rangePercent) / 60 + 1;
        } else {
            return 1;
        }
    }, [price, priceLower, priceUpper]);

    const _risk = useMemo(() => {
        const res: any[] = [];
        const split = risk?.toString().split(".");

        if (!split) return;

        for (let i = 0; i < 5; i++) {
            if (i < +split[0]) {
                res.push(100);
            } else if (i === +split[0]) {
                res.push(parseFloat("0." + split[1]) * 100);
            } else {
                res.push(0);
            }
        }

        return res;
    }, [risk]);

    return (
        <div className={"preset-ranges-wrapper pl-1 mxs_pl-0 mxs_mb-2 ms_pl-0 ms_mb-2"}>
            <div className="mb-1 f f-ac">
                <Layers style={{ display: "block", transform: "rotate(90deg)" }} size={15} />
                <span className="ml-05">
                    <Trans>Preset ranges</Trans>
                </span>
            </div>
            {ranges.map((range, i) => (
                <div className="i-f" key={i}>
                    <button
                        className={`preset-ranges__button ${activePreset === range.type ? "active" : ""} mr-05`}
                        onClick={() => {
                            handlePresetRangeSelection(range);
                            if (activePreset == range.type) {
                                handlePresetRangeSelection(null);
                            } else {
                                handlePresetRangeSelection(range);
                            }
                        }}
                        key={i}
                    >
                        <div>{range.title}</div>
                    </button>
                </div>
            ))}
            {_risk && !isInvalid && !isStablecoinPair && (
                <div className={`preset-ranges__description ${outOfRange && "mt-2"}`}>
                    <div className="f mb-05">
                        <span>
                            <Trans>Risk:</Trans>
                        </span>
                        <div className="f f-ac f-jc ml-a">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="preset-ranges__circle" style={{ background: "#42637b" }}>
                                    <div key={i} className="preset-ranges__circle--active" style={{ left: `calc(-100% + ${_risk[i]}%)` }} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="f">
                        <span>
                            <Trans>Profit:</Trans>
                        </span>
                        <div className="f f-ac f-jc ml-a">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="preset-ranges__circle" style={{ background: "#42637b" }}>
                                    <div key={i} className="preset-ranges__circle--active" style={{ left: `calc(-100% + ${_risk[i]}%)` }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
