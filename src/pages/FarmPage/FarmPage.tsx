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
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import VersionToggle from 'components/Toggle/VersionToggle';
import V3Farms from 'pages/FarmPage/V3';
import { useIsV3 } from 'state/application/hooks';

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
  const chainIdOrDefault = chainId ?? ChainId.MATIC;
  const lpFarms = useDefaultFarmList();
  const dualFarms = useDefaultDualFarmList();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const pairLists = useMemo(() => {
    const stakingPairLists = Object.values(lpFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );
    const dualPairLists = Object.values(dualFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );
    return stakingPairLists.concat(dualPairLists);
  }, [chainIdOrDefault, lpFarms, dualFarms]);

  useEffect(() => {
    getBulkPairData(pairLists).then((data) => setBulkPairs(data));
  }, [pairLists]);

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

  const { isV3 } = useIsV3();

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('farm')}</h4>
          <Box ml={2}>
            <VersionToggle />
          </Box>
        </Box>
        <Box className='helpWrapper'>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box>
      </Box>{' '}
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <AdsSlider sort='3' />
      </Box>
      {!isV3 && (
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
      {isV3 && <V3Farms />}
    </Box>
  );
};

export default FarmPage;
