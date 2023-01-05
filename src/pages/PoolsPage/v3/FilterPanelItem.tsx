import React from 'react';
import Toggle from 'components/v3/Toggle';
import { useTranslation } from 'react-i18next';

interface FilterPanelProps {
  item: {
    title: string;
    method: (v: boolean) => void;
    checkValue: boolean;
  };
}

const FilterPanelItem = ({
  item: { title, method, checkValue },
}: FilterPanelProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className={'mb-05 mxs_ta-c'}>{title}</div>
      <Toggle
        isActive={!checkValue}
        toggle={() => method(!checkValue)}
        checked={t('show')}
        unchecked={t('hide')}
      />
    </div>
  );
};

export default FilterPanelItem;
