import React from 'react';
import Toggle from 'components/v3/Toggle';
import { useTranslation } from 'react-i18next';

interface ToggleVersionProps {
  method: (v: boolean) => void;
  checkValue: boolean;
}

const ToggleVersion = ({ method, checkValue }: ToggleVersionProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className={'mb-05 mxs_ta-c'}>{t('poolType')}</div>
      <Toggle
        isActive={!checkValue}
        toggle={() => method(!checkValue)}
        checked='V2'
        unchecked='V3'
      />
    </div>
  );
};

export default ToggleVersion;
