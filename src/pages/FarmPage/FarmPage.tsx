import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { AdsSlider, CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { ChainId } from '@uniswap/sdk';
import VersionToggle from 'components/Toggle/VersionToggle';
import V3Farms from 'pages/FarmPage/V3';
import { useIsV3 } from 'state/application/hooks';
import { getConfig } from '../../config/index';

const FarmPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const [farmIndex, setFarmIndex] = useState(
    GlobalConst.farmIndex.LPFARM_INDEX,
  );
  const [v3FarmIndex, setV3FarmIndex] = useState(
    GlobalConst.v3FarmIndex.ETERNAL_FARMS_INDEX,
  );
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const farms = config['farm']['available'];
  const v3 = config['v3'];
  const v2 = config['v2'];
  const { isV3, updateIsV3 } = useIsV3();

  const lpFarms = useDefaultFarmList();
  const dualFarms = useDefaultDualFarmList();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const pairLists = useMemo(() => {
    const stakingPairLists = Object.values(lpFarms[chainIdToUse]).map(
      (item) => item.pair,
    );
    const dualPairLists = Object.values(dualFarms[chainIdToUse]).map(
      (item) => item.pair,
    );
    return stakingPairLists.concat(dualPairLists);
  }, [chainIdToUse, lpFarms, dualFarms]);

  useEffect(() => {
    getBulkPairData(chainIdToUse, pairLists).then((data) => setBulkPairs(data));
  }, [pairLists]);

  useEffect(() => {
    updateIsV3(
      v2 === true && v3 === true
        ? isV3 === true
          ? true
          : false
        : v2
        ? false
        : true,
    );
  }, [v2, v3, isV3]);

  const farmCategories = [
    {
      text: t('lpMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.LPFARM_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.LPFARM_INDEX,
    },
    {
      text: t('dualMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.DUALFARM_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX,
    },
  ];
  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('farm')}</h4>
          {v2 && v3 && (
            <Box ml={2}>
              <VersionToggle />
            </Box>
          )}
          ;
        </Box>
        <Box className='helpWrapper'>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box>
      </Box>{' '}
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <AdsSlider sort='farms' />
      </Box>
      {!isV3 && v2 && (
        <>
          <CustomSwitch
            width={300}
            height={48}
            items={farmCategories}
            isLarge={true}
          />
          <Box my={2}>
            <FarmRewards bulkPairs={bulkPairs} farmIndex={farmIndex} />
          </Box>
          <Box className='farmsWrapper'>
            <FarmsList bulkPairs={bulkPairs} farmIndex={farmIndex} />
          </Box>
        </>
      )}
      {isV3 && v3 && <V3Farms />}
    </Box>
  );
};

export default FarmPage;
