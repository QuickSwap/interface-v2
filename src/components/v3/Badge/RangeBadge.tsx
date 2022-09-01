import React from 'react';
import Badge, { BadgeVariant } from 'components/v3/Badge';
import styled from 'styled-components/macro';
import { Error } from '@material-ui/icons';

const ActiveDot = styled.span`
  background-color: ${({ theme }) => theme.success};
  border-radius: 50%;
  height: 8px;
  width: 8px;
`;

interface RangeBadgeProps {
  removed: boolean | undefined;
  inRange: boolean | undefined;
  withTooltip?: boolean;
}

export default function RangeBadge({
  removed,
  inRange,
  withTooltip = true,
}: RangeBadgeProps) {
  return (
    <>
      {removed ? (
        <Badge
          tooltip={
            withTooltip
              ? 'Your position has 0 liquidity, and is not earning fees.'
              : ''
          }
          variant={BadgeVariant.WARNING}
          icon={<Error width={14} height={14} />}
          text='Closed'
        />
      ) : inRange ? (
        <Badge
          tooltip={
            withTooltip
              ? 'The price of this pool is within your selected range. Your position is currently earning fees.'
              : ''
          }
          variant={BadgeVariant.POSITIVE}
          icon={<ActiveDot />}
          text='In range'
        />
      ) : (
        <Badge
          tooltip={
            withTooltip
              ? 'The price of this pool is outside of your selected range. Your position is not currently earning fees.'
              : ''
          }
          variant={BadgeVariant.WARNING}
          icon={<Error width={14} height={14} />}
          text='Out of range'
        />
      )}
    </>
  );
}
