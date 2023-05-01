import React from 'react';
import styles from './Badge.module.scss';
import { Box } from '@mui/material';
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
}

export default function Badge({ variant, icon, text, tooltip }: BadgeProps) {
  const BadgeComponent = () => (
    <Box
      className={`${styles.v3Badge} ${
        variant === BadgeVariant.WARNING
          ? styles.v3BadgeWarning
          : variant === BadgeVariant.POSITIVE
          ? styles.v3BadgeSuccess
          : variant === BadgeVariant.PRIMARY
          ? styles.v3BadgePrimary
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
