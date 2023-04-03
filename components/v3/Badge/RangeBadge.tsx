import React from 'react';
import Badge, { BadgeVariant } from 'components/v3/Badge';
import { Error } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import styles from './Badge.module.scss';

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
          tooltip={withTooltip ? t('v3PositionNoLiquidity') ?? '' : ''}
          variant={BadgeVariant.WARNING}
          icon={<Error width={14} height={14} />}
          text={t('closed') ?? ''}
        />
      ) : inRange ? (
        <Badge
          tooltip={withTooltip ? t('v3PoolWithinSelectedRange') ?? '' : ''}
          variant={BadgeVariant.POSITIVE}
          icon={<span className={styles.activeDot} />}
          text={t('inrange') ?? ''}
        />
      ) : (
        <Badge
          tooltip={withTooltip ? t('v3PoolOutsideSelectedRange') ?? '' : ''}
          variant={BadgeVariant.WARNING}
          icon={<Error width={14} height={14} />}
          text={t('outrange') ?? ''}
        />
      )}
    </>
  );
}
