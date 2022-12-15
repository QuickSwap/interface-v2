import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import { EternalFarmCard } from 'components/StakerEventCard/EternalFarmCard';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import { CustomModal } from 'components';
import { FarmModal } from '../../components/StakeModal';
import { FarmingType } from '../../models/enums';
import { FormattedEternalFarming } from 'models/interfaces';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';

const GammaFarmsPage: React.FC<{
  farmFilter: number;
  search: string;
  sortBy: number;
  sortDesc: boolean;
}> = ({ farmFilter, search }) => {
  const { t } = useTranslation();
  const gammaFarms: FormattedEternalFarming[] = [];
  const gammaFarmsLoading = false;

  return (
    <>
      <Box px={2} py={3}>
        {gammaFarmsLoading ? (
          <div className={'eternal-page__loader'}>
            <Loader stroke='white' size='1.5rem' />
          </div>
        ) : !gammaFarms || gammaFarms.length === 0 ? (
          <div className={'eternal-page__loader'}>
            <div>{t('noEternalFarms')}</div>
            <Frown size={'2rem'} stroke={'white'} />
          </div>
        ) : !gammaFarmsLoading && gammaFarms.length !== 0 ? (
          <Grid container spacing={2}>
            {gammaFarms.map((event: FormattedEternalFarming, j: number) => (
              <Grid item xs={12} sm={6} md={4} key={j}>
                <EternalFarmCard
                  refreshing={gammaFarmsLoading}
                  now={0}
                  eternal
                  poolAprs={undefined}
                  poolAprsLoading={false}
                  aprs={undefined}
                  aprsLoading={false}
                  tvls={undefined}
                  tvlsLoading={false}
                  event={event}
                />
              </Grid>
            ))}
          </Grid>
        ) : null}
      </Box>
    </>
  );
};

export default GammaFarmsPage;
