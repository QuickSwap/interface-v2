import React from 'react';
import { Box } from '@material-ui/core';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import SteerFarmCard from './SteerFarmCard';
import { useActiveWeb3React } from 'hooks';
import {
  useSteerFilteredFarms,
  useSteerStakingPools,
} from 'hooks/v3/useSteerData';
import useParsedQueryString from 'hooks/useParsedQueryString';

const SteerFarmsPage: React.FC<{
  farmFilter: string;
  search: string;
  sortBy: string;
  sortDesc: boolean;
}> = ({ search, sortBy, sortDesc, farmFilter }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();

  const parsedQuery = useParsedQueryString();
  const farmStatus =
    parsedQuery && parsedQuery.farmStatus
      ? (parsedQuery.farmStatus as string)
      : 'active';

  const { loading: steerFarmsLoading, data: steerFarms } = useSteerStakingPools(
    chainId,
    farmStatus,
  );

  const filteredFarms = useSteerFilteredFarms(
    steerFarms ?? [],
    chainId,
    search,
    farmFilter,
    sortBy,
    sortDesc,
  );

  return (
    <Box px={2} py={3}>
      {steerFarmsLoading ? (
        <div className='flex justify-center' style={{ padding: '16px 0' }}>
          <Loader stroke='white' size='1.5rem' />
        </div>
      ) : filteredFarms.length === 0 ? (
        <div
          className='flex flex-col items-center'
          style={{ padding: '16px 0' }}
        >
          <Frown size={'2rem'} stroke={'white'} />
          <p style={{ marginTop: 12 }}>{t('noSteerFarms')}</p>
        </div>
      ) : !steerFarmsLoading && filteredFarms.length > 0 && chainId ? (
        <Box>
          {filteredFarms.map((farm: any) => {
            return (
              <Box mb={2} key={farm.id}>
                <SteerFarmCard data={farm} />
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
};

export default SteerFarmsPage;
