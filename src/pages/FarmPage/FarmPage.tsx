import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme, Button } from '@material-ui/core';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as ExitIcon } from 'assets/images/ExitIcon.svg';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { AdsSlider, CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';
import { useDefaultFarmList } from 'state/farms/hooks';
import { useDefaultCNTFarmList } from 'state/cnt/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { ChainId } from '@uniswap/sdk';
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
  const cntFarms = useDefaultCNTFarmList(chainIdOrDefault);
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

    const cntPairLists = Object.values(cntFarms[chainIdOrDefault]).map(
      (item) => item.pair,
    );

    return stakingPairLists.concat(dualPairLists).concat(cntPairLists);
  }, [chainIdOrDefault, lpFarms, dualFarms, cntFarms]);

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
      text: 'Other LP Mining',
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.OTHER_LP_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.OTHER_LP_INDEX,
    },
    {
      text: t('dualMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.DUALFARM_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX,
    },
  ];
  const helpURL = process.env.REACT_APP_HELP_URL;

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
        {helpURL && (
          <Box
            className='helpWrapper'
            onClick={() => window.open(helpURL, '_blank')}
          >
            <small>{t('help')}</small>
            <HelpIcon />
          </Box>
        )}
      </Box>
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <AdsSlider sort='farms' />
      </Box>

      {!isV3 && (
        <>
          <Box className='flex flex-wrap justify-between'>
            <CustomSwitch
              width={450}
              height={48}
              items={farmCategories}
              isLarge={true}
            />
            {farmIndex === GlobalConst.farmIndex.OTHER_LP_INDEX && (
              <Box className='flex'>
                <Button className='btn-xl mr-1'>Create A Farm</Button>
                {/*
                  <Box className='flex btn-xl btn-exit'>
                    <Box className='flex flex-col' my={'auto'} mx={1}>
                      <Box fontSize={10}>DISCONNECT</Box>
                      <Box fontWeight={'bold'}>0x04…324b</Box>
                    </Box>
                    <Box className='flex' my={'auto'} ml={2} mr={1}>
                      <ExitIcon />
                    </Box>
                  </Box>
                  */}
              </Box>
            )}
          </Box>
          <Box my={3}>
            {farmIndex !== GlobalConst.farmIndex.OTHER_LP_INDEX ? (
              <FarmRewards bulkPairs={bulkPairs} farmIndex={farmIndex} />
            ) : (
              <></>
            )}
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
