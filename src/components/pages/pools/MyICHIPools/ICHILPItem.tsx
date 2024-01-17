import React, { useState } from 'react';
import { Box } from '@mui/material';
import { DoubleCurrencyLogo } from 'components';
import styles from 'styles/pages/pools/AutomaticLPItem.module.scss';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ICHILPItemDetails from './ICHILPItemDetails';
import { ICHIVault } from 'hooks/useICHIData';

const ICHILPItem: React.FC<{ position: ICHIVault }> = ({ position }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box className={styles.liquidityItem}>
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
          className={`${styles.liquidityItemExpand} ${
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
