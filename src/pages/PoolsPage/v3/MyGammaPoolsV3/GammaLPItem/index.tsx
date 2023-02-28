import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DoubleCurrencyLogo } from 'components';
import { GammaPairs } from 'constants/index';
import './index.scss';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import GammaLPItemDetails from '../GammaLPItemDetails';
import { ArrowRight } from 'react-feather';
import { useHistory } from 'react-router-dom';

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
  const history = useHistory();
  const farmingLink = `/farm/v3?tab=my-farms`;

  return (
    <Box className='gamma-liquidity-item'>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center'>
          {gammaPosition.token0 && gammaPosition.token1 && (
            <>
              <Box className='flex' mr='8px'>
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
            <Box ml={1.5} className='gamma-liquidity-range'>
              <small>
                {gammaPairInfo.title} {t('range').toLowerCase()}
              </small>
            </Box>
          )}
          {gammaPosition && gammaPosition.farming && (
            <Box
              className='flex items-center bg-primary cursor-pointer'
              padding='0 5px'
              height='22px'
              borderRadius='11px'
              ml={1}
              my={0.5}
              color='white'
              onClick={() => history.push(farmingLink)}
            >
              <p className='span'>{t('farming')}</p>
              <Box className='flex' ml='3px'>
                <ArrowRight size={12} />
              </Box>
            </Box>
          )}
        </Box>

        <Box
          className={`gamma-liquidity-item-expand ${
            expanded ? 'text-primary' : ''
          }`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </Box>
      </Box>
      {expanded && gammaPosition && (
        <Box mt={2}>
          <GammaLPItemDetails gammaPosition={gammaPosition} />
        </Box>
      )}
    </Box>
  );
};

export default GammaLPItem;
