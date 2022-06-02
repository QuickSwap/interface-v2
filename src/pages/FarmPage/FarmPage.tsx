import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import { returnDualStakingInfo, returnStakingInfo } from 'utils';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import 'pages/styles/farm.scss';

const FarmPage: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation();
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const [farmIndex, setFarmIndex] = useState(
    GlobalConst.farmIndex.LPFARM_INDEX,
  );

  useEffect(() => {
    if (chainId) {
      const stakingPairLists =
        returnStakingInfo()[chainId]?.map((item) => item.pair) ?? [];
      const stakingOldPairLists =
        returnStakingInfo('old')[chainId]?.map((item) => item.pair) ?? [];
      const dualPairLists =
        returnDualStakingInfo()[chainId]?.map((item) => item.pair) ?? [];
      const pairLists = stakingPairLists
        .concat(stakingOldPairLists)
        .concat(dualPairLists);
      getBulkPairData(pairLists).then((data) => setBulkPairs(data));
    }
    return () => setBulkPairs(null);
  }, [chainId]);

  const farmCategories = [
    {
      text: t('lpMining'),
      onClick: () => setFarmIndex(GlobalConst.farmIndex.LPFARM_INDEX),
      condition: farmIndex === GlobalConst.farmIndex.LPFARM_INDEX,
    },
    {
      text: t('dualMining'),
      onClick: () => setFarmIndex(GlobalConst.farmIndex.DUALFARM_INDEX),
      condition: farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX,
    },
  ];

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box className='pageHeading'>
        <Box mr={2}>
          <h4>{t('farm')}</h4>
        </Box>
        <Box className='helpWrapper'>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box>
      </Box>
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
    </Box>
  );
};

export default FarmPage;
