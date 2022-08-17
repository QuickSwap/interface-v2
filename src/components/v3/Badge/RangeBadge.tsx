import Badge, { BadgeVariant } from 'components/v3/Badge';
import styled from 'styled-components/macro';
import { MouseoverTooltip } from '../Tooltip';
import { AlertCircle } from 'react-feather';

const BadgeWrapper = styled.div`
  font-size: 14px;
  display: flex;
  justify-content: flex-end;
  user-select: none;
  margin-right: 0.5rem;
`;

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
  cursor: default;
`;

const ActiveDot = styled.span`
  background-color: ${({ theme }) => theme.success};
  border-radius: 50%;
  height: 8px;
  width: 8px;
  margin-right: 4px;
`;

interface RangeBadgeProps {
  removed: boolean | undefined;
  inRange: boolean | undefined;
}

export default function RangeBadge({ removed, inRange }: RangeBadgeProps) {
  return (
    <BadgeWrapper>
      {removed ? (
        <MouseoverTooltip
          text={'Your position has 0 liquidity, and is not earning fees.'}
        >
          <Badge variant={BadgeVariant.DEFAULT}>
            <AlertCircle width={14} height={14} />
            &nbsp;
            <BadgeText>'Closed'</BadgeText>
          </Badge>
        </MouseoverTooltip>
      ) : inRange ? (
        <MouseoverTooltip
          text={`The price of this pool is within your selected range. Your position is
                            currently earning fees.`}
        >
          <Badge variant={BadgeVariant.DEFAULT}>
            <ActiveDot /> &nbsp;
            <BadgeText>In range</BadgeText>
          </Badge>
        </MouseoverTooltip>
      ) : (
        <MouseoverTooltip
          text={`The price of this pool is outside of your selected range. Your position
                            is not currently earning fees.`}
        >
          <Badge variant={BadgeVariant.WARNING}>
            <AlertCircle width={14} height={14} />
            &nbsp;
            <BadgeText>Out of range</BadgeText>
          </Badge>
        </MouseoverTooltip>
      )}
    </BadgeWrapper>
  );
}
