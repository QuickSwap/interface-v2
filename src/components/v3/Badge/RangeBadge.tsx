import React from 'react';
import Badge, { BadgeVariant } from 'components/v3/Badge';
import { Error } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

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
          icon={
            <div
              className='bg-success'
              style={{ width: 8, height: 8, borderRadius: 4 }}
            />
          }
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
