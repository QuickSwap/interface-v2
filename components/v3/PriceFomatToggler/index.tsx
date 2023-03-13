import React from 'react';
import Toggle from 'components/v3/Toggle';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export enum PriceFormats {
  TOKEN,
  USD,
}

interface IPriceFormatToggler {
  handlePriceFormat: (format: PriceFormats) => void;
  currentFormat: PriceFormats;
}

export function PriceFormatToggler({
  handlePriceFormat,
  currentFormat,
}: IPriceFormatToggler) {
  const { t } = useTranslation();
  const [inputType, setInputType] = useState(currentFormat);

  return (
    <Toggle
      isActive={!!inputType}
      toggle={() => {
        handlePriceFormat(+!inputType);
        setInputType(+!inputType);
      }}
      checked={t('usd').toUpperCase()}
      unchecked={t('tokens')}
    />
  );
}
