import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DoubleCurrencyLogo } from 'components';
import { unipilotVaultTypes } from 'constants/index';
import './index.scss';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import UnipilotLPItemDetails from '../UnipilotLPItemDetails';
import { useActiveWeb3React } from 'hooks';
// import { ArrowRight } from 'react-feather';
import { useHistory } from 'react-router-dom';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getTokenFromAddress } from 'utils';
import { Token } from '@uniswap/sdk-core';

const UnipilotLPItem: React.FC<{ position: any }> = ({ position }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [expanded, setExpanded] = useState(false);
  const history = useHistory();
  const farmingLink = `/farm/v3?tab=my-farms`;

  const tokenMap = useSelectedTokenList();
  const token0 = getTokenFromAddress(
    position.vault.quickswapPool.token0.id,
    chainId,
    tokenMap,
    [],
  );
  const token1 = getTokenFromAddress(
    position.vault.quickswapPool.token1.id,
    chainId,
    tokenMap,
    [],
  );
  const positionDetail = { ...position, token0, token1 };

  return (
    <Box className='unipilot-liquidity-item'>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center'>
          {token0 && token1 && (
            <>
              <Box className='flex' mr='8px'>
                <DoubleCurrencyLogo
                  currency0={token0}
                  currency1={token1}
                  size={24}
                />
              </Box>
              <p className='weight-600'>
                {token0.symbol}/{token1.symbol}
              </p>
            </>
          )}
          <Box ml={1.5} className='unipilot-liquidity-range'>
            <small>
              {unipilotVaultTypes[Number(position.vault.strategyId) - 1]}
            </small>
          </Box>
          {/* {gammaPosition && gammaPosition.farming && (
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
          )} */}
        </Box>

        <Box
          className={`unipilot-liquidity-item-expand ${
            expanded ? 'text-primary' : ''
          }`}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </Box>
      </Box>
      {expanded && position && (
        <Box mt={2}>
          <UnipilotLPItemDetails position={positionDetail} />
        </Box>
      )}
    </Box>
  );
};

export default UnipilotLPItem;
