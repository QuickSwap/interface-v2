import React from 'react';
import Badge, { BadgeVariant } from 'components/v3/Badge';
import styled from 'styled-components/macro';
import { Error } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <>
      {removed ? (
        <Badge
          tooltip={withTooltip ? t('v3PositionNoLiquidity') : ''}
          variant={BadgeVariant.WARNING}
          icon={<Error width={14} height={14} />}
          text={t('closed')}
        />
      ) : inRange ? (
        <Badge
          tooltip={withTooltip ? t('v3PoolWithinSelectedRange') : ''}
          variant={BadgeVariant.POSITIVE}
          icon={<ActiveDot />}
          text={t('inrange')}
        />
      ) : (
        <Badge
          tooltip={withTooltip ? t('v3PoolOutsideSelectedRange') : ''}
          variant={BadgeVariant.WARNING}
          icon={<Error width={14} height={14} />}
          text={t('outrange')}
        />
      )}
    </>
  );
}
