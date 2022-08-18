import { Trans } from "@lingui/macro";
import Toggle from "components/Toggle";
import { useState } from "react";
import "./index.scss";

export enum PriceFormats {
    TOKEN,
    USD,
}

interface IPriceFormatToggler {
    handlePriceFormat: (format: PriceFormats) => void;
    currentFormat: PriceFormats;
}

export function PriceFormatToggler({ handlePriceFormat, currentFormat }: IPriceFormatToggler) {
    const [inputType, setInputType] = useState(currentFormat);

    return (
        <div className="f price-format-toggler">
            <Toggle
                isActive={!!inputType}
                toggle={() => {
                    handlePriceFormat(+!inputType);
                    setInputType(+!inputType);
                }}
                checked={<Trans>USD</Trans>}
                unchecked={<Trans>Tokens</Trans>}
            />
        </div>
    );
}
