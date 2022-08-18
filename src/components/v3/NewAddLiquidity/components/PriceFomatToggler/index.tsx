import React, { useState } from 'react';
import Toggle from 'components/v3/Toggle';
import './index.scss';

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
  const [inputType, setInputType] = useState(currentFormat);

  return (
    <div className='f price-format-toggler'>
      <Toggle
        isActive={!!inputType}
        toggle={() => {
          handlePriceFormat(+!inputType);
          setInputType(+!inputType);
        }}
        checked={'USD'}
        unchecked={'Tokens'}
      />
    </div>
  );
}
