import React, { useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme, Button } from '@material-ui/core';
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
import { useDefaultCNTFarmList } from 'state/cnt/hooks';
import { useDefaultDualFarmList } from 'state/dualfarms/hooks';
import { ChainId } from '@uniswap/sdk';
import VersionToggle from 'components/Toggle/VersionToggle';
import V3Farms from 'pages/FarmPage/V3';
import { useIsV2 } from 'state/application/hooks';

const FarmPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const [farmIndex, setFarmIndex] = useState(
    GlobalConst.farmIndex.LPFARM_INDEX,
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
    // {
    //   text: t('otherLPMining'),
    //   onClick: () => {
    //     setFarmIndex(GlobalConst.farmIndex.OTHER_LP_INDEX);
    //   },
    //   condition: farmIndex === GlobalConst.farmIndex.OTHER_LP_INDEX,
    // },
    {
      text: t('dualMining'),
      onClick: () => {
        setFarmIndex(GlobalConst.farmIndex.DUALFARM_INDEX);
      },
      condition: farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX,
    },
  ];
  const helpURL = process.env.REACT_APP_HELP_URL;

  const { isV2 } = useIsV2();

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
      {isV2 && (
        <>
          {/* Custom switch layer */}
          <Box className='flex flex-wrap justify-between'>
            <CustomSwitch
              width={300}
              height={48}
              items={farmCategories}
              isLarge={true}
            />
            {farmIndex === GlobalConst.farmIndex.OTHER_LP_INDEX && (
              <Box className='flex'>
                <Button className='btn-xl'>Create A Farm</Button>
              </Box>
            )}
          </Box>

          {/* Rewards */}
          <Box my={3}>
            {farmIndex !== GlobalConst.farmIndex.OTHER_LP_INDEX && (
              <FarmRewards bulkPairs={bulkPairs} farmIndex={farmIndex} />
            )}
          </Box>

          {/* Farms List */}
          <Box className='farmsWrapper'>
            <FarmsList bulkPairs={bulkPairs} farmIndex={farmIndex} />
          </Box>
        </>
      )}
      {!isV2 && <V3Farms />}
      {isMobile ? (
        <Box className='flex justify-center' mt={2}>
          <div
            className='_0cbf1c3d417e250a'
            data-zone='568de4b313b74ec694986be82e600aa6'
            style={{
              width: 320,
              height: 50,
              display: 'inline-block',
              margin: '0 auto',
            }}
          />
        </Box>
      ) : (
        <Box className='flex justify-center' mt={2}>
          <div
            className='_0cbf1c3d417e250a'
            data-zone='5545e36b39a24be28cb2ca0095bb4ce1'
            style={{
              width: 728,
              height: 90,
              display: 'inline-block',
              margin: '0 auto',
            }}
          />
          <div
            className='_0cbf1c3d417e250a'
            data-zone='906ff59e07f044ecb8fbf6f8237e1d2e'
            style={{
              width: 970,
              height: 90,
              display: 'inline-block',
              margin: '0 auto',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default FarmPage;
