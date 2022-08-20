import React, { useMemo } from "react";
import PositionListItem from "components/v3/PositionListItem";
import { useShowNewestPosition } from "state/mint/v3/hooks";
import { PositionPool } from "models/interfaces";

type PositionListProps = React.PropsWithChildren<{
    positions: PositionPool[];
    newestPosition: number | undefined;
}>;

export default function PositionList({ positions, newestPosition }: PositionListProps) {
    const showNewestPosition = useShowNewestPosition();

    const _positions = useMemo(() => {
        if (!positions) {
            return [];
        }

        return positions.filter((position) => !position.onFarming && !position.oldFarming);
    }, [positions]);

    const _positionsOnFarming = useMemo(() => {
        if (!positions) {
            return [];
        }

        return positions.filter((position) => position.onFarming);
    }, [positions]);

    const _positionsOnOldFarming = useMemo(() => {
        if (!positions) {
            return [];
        }

        return positions.filter((position) => position.oldFarming);
    }, [positions]);

    return (
        <>
            <div className={"flex-s-between w-100 pr-2"}>
                <div>
                    Your positions
                    {positions && " (" + positions.length + ")"}
                </div>
                <span className={"hide-xs"}>
                    Status
                </span>
            </div>
            {_positionsOnOldFarming.map((p) => {
                return <PositionListItem key={p.tokenId.toString()} positionDetails={p} />;
            })}
            {_positionsOnFarming.map((p) => {
                return <PositionListItem key={p.tokenId.toString()} positionDetails={p} />;
            })}
            {_positions.map((p) => {
                return <PositionListItem newestPosition={newestPosition} highlightNewest={showNewestPosition} key={p.tokenId.toString()} positionDetails={p} />;
            })}
        </>
    );
}
