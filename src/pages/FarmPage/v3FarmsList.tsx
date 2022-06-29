import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { ChainId } from '@uniswap/sdk';

const v3FarmsList: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const chainIdOrDefault = chainId ?? ChainId.MATIC;

  return (
    <>
      <Box className='farmListHeader'>
        <Box>
          <h5>{t('earndQUICK')}</h5>
          <small>
            {t('v3stakeMessage')}
          </small>
        </Box>
      </Box>
    </>
  );
};

export default v3FarmsList;
