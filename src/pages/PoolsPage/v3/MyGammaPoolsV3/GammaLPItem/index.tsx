import React, { useState } from 'react';
import { Box } from 'theme/components';
import { useTranslation } from 'react-i18next';
import { DoubleCurrencyLogo } from 'components';
import { GammaPairs } from 'constants/index';
import './index.scss';
import { ChevronUp, ChevronDown } from 'react-feather';
import GammaLPItemDetails from '../GammaLPItemDetails';

const GammaLPItem: React.FC<{ gammaPosition: any }> = ({ gammaPosition }) => {
  const { t } = useTranslation();
  const gammaTokenStr =
    gammaPosition.token0.address.toLowerCase() +
    '-' +
    gammaPosition.token1.address.toLowerCase();
  const gammaPair = GammaPairs[gammaTokenStr];
  const gammaPairInfo = gammaPair
    ? gammaPair.find(
        (item) =>
          item.address.toLowerCase() ===
          gammaPosition.pairAddress.toLowerCase(),
      )
    : undefined;
  const [expanded, setExpanded] = useState(false);

  return (
    <Box className='gamma-liquidity-item'>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center'>
          {gammaPosition.token0 && gammaPosition.token1 && (
            <>
              <Box className='flex' margin='0 8px 0 0'>
                <DoubleCurrencyLogo
                  currency0={gammaPosition.token0}
                  currency1={gammaPosition.token1}
                  size={24}
                />
              </Box>
              <p className='weight-600'>
                {gammaPosition.token0.symbol}/{gammaPosition.token1.symbol}
              </p>
            </>
          )}
          {gammaPairInfo && (
            <Box margin='0 0 0 12px' className='gamma-liquidity-range'>
              <small>
                {gammaPairInfo.title} {t('range').toLowerCase()}
              </small>
            </Box>
          )}
        </Box>

        <Box
          className={`gamma-liquidity-item-expand ${
            expanded ? 'text-primary' : ''
          }`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Box>
      </Box>
      {expanded && gammaPosition && (
        <Box margin='16px 0 0'>
          <GammaLPItemDetails gammaPosition={gammaPosition} />
        </Box>
      )}
    </Box>
  );
};

export default GammaLPItem;
