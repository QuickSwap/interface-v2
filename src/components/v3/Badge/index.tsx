import React, { CSSProperties, PropsWithChildren } from 'react';
import './index.scss';
import { Box } from '@material-ui/core';
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
  style?: CSSProperties | undefined;
}

export default function Badge({
  variant,
  icon,
  text,
  tooltip,
  style,
}: PropsWithChildren<BadgeProps>) {
  const BadgeComponent = () => (
    <Box
      style={style}
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
        <Box className='flex' mr='5px'>
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
