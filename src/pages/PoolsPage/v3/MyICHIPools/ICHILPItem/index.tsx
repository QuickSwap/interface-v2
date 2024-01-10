import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { DoubleCurrencyLogo } from 'components';
import './index.scss';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import ICHILPItemDetails from '../ICHILPItemDetails';
import { ICHIVault } from 'hooks/useICHIData';

const ICHILPItem: React.FC<{ position: ICHIVault }> = ({ position }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box className='ichi-liquidity-item'>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center'>
          <Box className='flex' mr='8px'>
            <DoubleCurrencyLogo
              currency0={position.token0}
              currency1={position.token1}
              size={24}
            />
          </Box>
          <p className='weight-600'>
            {position.token0?.symbol}/{position.token1?.symbol}
          </p>
        </Box>

        <Box
          className={`ichi-liquidity-item-expand ${
            expanded ? 'text-primary' : ''
          }`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </Box>
      </Box>
      {expanded && position && (
        <Box mt={2}>
          <ICHILPItemDetails position={position} />
        </Box>
      )}
    </Box>
  );
};

export default ICHILPItem;
