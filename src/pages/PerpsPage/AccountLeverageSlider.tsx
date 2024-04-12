import { Box } from '@material-ui/core';
import { useLeverage } from '@orderly.network/hooks';
import { ColoredSlider } from 'components';
import React from 'react';

export const AccountLeverageSlider: React.FC<{
  leverage?: number;
  setLeverage: (val: number) => void;
}> = ({ leverage, setLeverage }) => {
  const [maxLeverage, { config: leverageLevers }] = useLeverage();
  const availableLeverages: number[] = (leverageLevers ?? []).map((item: any) =>
    Number(item),
  );

  const selectedLeverage = leverage ?? Number(maxLeverage);
  const leverageIndex = availableLeverages.findIndex(
    (item) => item === selectedLeverage,
  );

  return (
    <>
      <Box className='leverageSquareWrapper' margin='0 4px 0 12px'>
        {availableLeverages.map((value, ind) => (
          <Box
            key={value}
            className={`leverageSquare
                  ${leverageIndex > ind ? ' filledSquare' : ''}`}
            left={`calc(${(ind / (availableLeverages.length - 1)) *
              100}% - 8px)`}
          />
        ))}
        <ColoredSlider
          min={0}
          max={availableLeverages.length - 1}
          step={1}
          value={leverageIndex}
          handleChange={async (_, value) => {
            const nextLeverage = availableLeverages[Number(value)];
            setLeverage(Number(nextLeverage));
          }}
        />
      </Box>
      <Box mt={1} className='flex items-center justify-between'>
        {availableLeverages.map((value) => (
          <p
            style={{ width: 15.56 }}
            className='span text-secondary'
            key={value}
          >
            {value}x
          </p>
        ))}
      </Box>
    </>
  );
};
