import React, { useMemo } from 'react';
import PositionListItem from '../PositionListItem';
import { useShowNewestPosition } from 'state/mint/v3/hooks';
import { PositionPool } from 'models/interfaces';
import { Box } from 'theme/components';

type PositionListProps = React.PropsWithChildren<{
  positions: PositionPool[];
  newestPosition: number | undefined;
}>;

export default function PositionList({
  positions,
  newestPosition,
}: PositionListProps) {
  const showNewestPosition = useShowNewestPosition();

  const _positions = useMemo(() => {
    if (!positions) {
      return [];
    }

    return positions.filter(
      (position) => !position.onFarming && !position.oldFarming,
    );
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
    <Box margin='0 0 -16px'>
      {_positionsOnOldFarming.map((p) => {
        return (
          <Box margin='0 0 16px' key={p.tokenId.toString()}>
            <PositionListItem positionDetails={p} />
          </Box>
        );
      })}
      {_positionsOnFarming.map((p) => {
        return (
          <Box margin='0 0 16px' key={p.tokenId.toString()}>
            <PositionListItem positionDetails={p} />
          </Box>
        );
      })}
      {_positions.map((p) => {
        return (
          <Box margin='0 0 16px' key={p.tokenId.toString()}>
            <PositionListItem
              newestPosition={newestPosition}
              highlightNewest={showNewestPosition}
              positionDetails={p}
            />
          </Box>
        );
      })}
    </Box>
  );
}
