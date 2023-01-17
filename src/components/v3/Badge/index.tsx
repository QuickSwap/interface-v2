import React from 'react';
import './index.scss';
import { Box } from 'theme/components';
import { MouseoverTooltip } from '../Tooltip';

export enum BadgeVariant {
  DEFAULT = 'DEFAULT',
  NEGATIVE = 'NEGATIVE',
  POSITIVE = 'POSITIVE',
  PRIMARY = 'PRIMARY',
  WARNING = 'WARNING',
  WARNING_OUTLINE = 'WARNING_OUTLINE',
}

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  text?: string;
  tooltip?: string;
}

export default function Badge({ variant, icon, text, tooltip }: BadgeProps) {
  const BadgeComponent = () => (
    <Box
      className={`v3-badge ${
        variant === BadgeVariant.WARNING
          ? 'v3-badge-warning'
          : variant === BadgeVariant.POSITIVE
          ? 'v3-badge-success'
          : variant === BadgeVariant.PRIMARY
          ? 'v3-badge-primary'
          : ''
      }`}
    >
      {icon && (
        <Box className='flex' margin='0 5px 0 0'>
          {icon}
        </Box>
      )}
      <span>{text}</span>
    </Box>
  );
  return (
    <>
      {tooltip ? (
        <MouseoverTooltip text={tooltip}>
          <BadgeComponent />
        </MouseoverTooltip>
      ) : (
        <BadgeComponent />
      )}
    </>
  );
}
