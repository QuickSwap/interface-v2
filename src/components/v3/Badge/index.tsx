import React from 'react';
import './index.scss';
import { Box } from '@material-ui/core';
import { CustomTooltip } from 'components';

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
  textColor?: string;
  iconReverse?: boolean;
}

export default function Badge({
  variant,
  icon,
  text,
  tooltip,
  textColor,
  iconReverse,
}: BadgeProps) {
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
      {iconReverse ? (
        <>
          <span className={`${textColor ? textColor : ''}`}>{text}</span>
          {icon && (
            <Box className='flex' ml='5px'>
              {icon}
            </Box>
          )}
        </>
      ) : (
        <>
          {icon && (
            <Box className='flex' mr='5px'>
              {icon}
            </Box>
          )}
          <span className={`${textColor ? textColor : ''}`}>{text}</span>
        </>
      )}
    </Box>
  );
  return (
    <>
      {tooltip ? (
        <CustomTooltip title={tooltip}>
          <div>
            <BadgeComponent />
          </div>
        </CustomTooltip>
      ) : (
        <BadgeComponent />
      )}
    </>
  );
}
