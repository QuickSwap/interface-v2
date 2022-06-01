import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { getBulkPairData } from 'state/stake/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import { returnDualStakingInfo, returnStakingInfo } from 'utils';
import FarmRewards from './FarmRewards';
import FarmsList from './FarmsList';
import { CustomSwitch } from 'components';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  helpWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: `1px solid ${palette.secondary.light}`,
    borderRadius: 10,
    '& p': {
      color: palette.text.hint,
    },
    '& svg': {
      marginLeft: 8,
    },
  },
  dragonWrapper: {
    width: '100%',
    backgroundColor: palette.background.paper,
    borderRadius: 20,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
    [breakpoints.down('xs')]: {
      padding: '16px 12px',
    },
  },
}));

const FarmPage: React.FC = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { chainId } = useActiveWeb3React();

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
      <Box
        display='flex'
        alignItems='flex-start'
        justifyContent='space-between'
        width='100%'
        mb={2}
      >
        <Box mr={2}>
          <Typography variant='h4'>{t('farm')}</Typography>
        </Box>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>{t('help')}</Typography>
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
      <Box className={classes.dragonWrapper}>
        <FarmsList bulkPairs={bulkPairs} farmIndex={farmIndex} />
      </Box>
    </Box>
  );
};

export default FarmPage;
