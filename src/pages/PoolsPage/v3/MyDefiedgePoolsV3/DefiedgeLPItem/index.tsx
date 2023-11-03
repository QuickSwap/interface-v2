import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DoubleCurrencyLogo } from 'components';
import './index.scss';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import DefiedgeLPItemDetails from '../DefiedgeLPItemDetails';
import { useActiveWeb3React } from 'hooks';
import { ArrowRight } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { getGammaPairsForTokens } from 'utils';

const DefiedgeLPItem: React.FC<{ defiedgePosition: any }> = ({
  defiedgePosition,
}) => {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const history = useHistory();
  const farmingLink = `/farm/v3?tab=my-farms`;

  return (
    <Box className='gamma-liquidity-item'>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center'>
          {defiedgePosition.token0 && defiedgePosition.token1 && (
            <>
              <Box className='flex' mr='8px'>
                <DoubleCurrencyLogo
                  currency0={defiedgePosition.token0}
                  currency1={defiedgePosition.token1}
                  size={24}
                />
              </Box>
              <p className='weight-600'>
                {defiedgePosition.token0.symbol}/
                {defiedgePosition.token1.symbol}
              </p>
            </>
          )}

          {defiedgePosition && defiedgePosition.farming && (
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
      {expanded && defiedgePosition && (
        <Box mt={2}>
          <DefiedgeLPItemDetails defiedgePosition={defiedgePosition} />
        </Box>
      )}
    </Box>
  );
};

export default DefiedgeLPItem;
