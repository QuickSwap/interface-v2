import React from 'react';
import { Box } from '@material-ui/core';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import UnipilotFarmCard from './UnipilotFarmCard';
import { useActiveWeb3React } from 'hooks';
import {
  useUnipilotFarmData,
  useUnipilotFarms,
  useUnipilotFilteredFarms,
} from 'hooks/v3/useUnipilotFarms';

const UnipilotFarmsPage: React.FC<{
  farmFilter: string;
  search: string;
  sortBy: string;
  sortDesc: boolean;
}> = ({ farmFilter, search, sortBy, sortDesc }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();

  const {
    loading: unipilotFarmsLoading,
    data: unipilotFarms,
  } = useUnipilotFarms(chainId);

  const farmAddresses = unipilotFarms.map((farm: any) => farm.id);
  const {
    loading: unipilotFarmDataLoading,
    data: unipilotFarmData,
  } = useUnipilotFarmData(farmAddresses, chainId);

  const filteredFarms = useUnipilotFilteredFarms(
    unipilotFarms,
    unipilotFarmData,
    farmFilter,
    search,
    sortBy,
    sortDesc,
  );

  return (
    <Box px={2} py={3}>
      {unipilotFarmsLoading || unipilotFarmDataLoading ? (
        <div className='flex justify-center' style={{ padding: '16px 0' }}>
          <Loader stroke='white' size='1.5rem' />
        </div>
      ) : filteredFarms.length === 0 ? (
        <div
          className='flex flex-col items-center'
          style={{ padding: '16px 0' }}
        >
          <Frown size={'2rem'} stroke={'white'} />
          <p style={{ marginTop: 12 }}>{t('noGammaFarms')}</p>
        </div>
      ) : !unipilotFarmsLoading && filteredFarms.length > 0 && chainId ? (
        <Box>
          {filteredFarms.map((farm: any) => {
            return (
              <Box mb={2} key={farm.id}>
                <UnipilotFarmCard
                  data={farm}
                  farmData={
                    unipilotFarmData && farm.id
                      ? unipilotFarmData[farm.id.toLowerCase()]
                      : undefined
                  }
                />
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
};

export default UnipilotFarmsPage;
