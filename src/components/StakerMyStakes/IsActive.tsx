import { useToken } from "../../hooks/Tokens";
import { usePool } from "../../hooks/usePools";
import { unwrappedToken } from "../../utils/wrappedCurrency";
import { PositionRange } from "./styled";

export function IsActive({ el }: { el: any }) {
    const { token0: token0Address, token1: token1Address, tickLower, tickUpper } = el;

    const token0 = useToken(token0Address);
    const token1 = useToken(token1Address);

    const currency0 = token0 ? unwrappedToken(token0) : undefined;
    const currency1 = token1 ? unwrappedToken(token1) : undefined;

    //   // construct Position from details returned
    const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined);

    // check if price is within range
    const outOfRange: boolean = pool ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper : false;

    return (
        <PositionRange>
            <svg width="10" height="10" style={{ marginRight: "5px" }}>
                <circle cx="5" r="5" cy="5" fill={outOfRange ? "#f7296d" : "#73f729"} />
            </svg>
            <span>{outOfRange ? `Out of range` : `In range`}</span>
        </PositionRange>
    );
}
