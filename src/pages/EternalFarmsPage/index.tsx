import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import { EternalFarmCard } from 'components/StakerEventCard/EternalFarmCard';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import { CustomModal } from 'components';
import { FarmModal } from '../../components/StakeModal';
import { FarmingType } from '../../models/enums';
import './index.scss';
import { FormattedEternalFarming } from 'models/interfaces';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';

export default function EternalFarmsPage({
  data,
  refreshing,
  fetchHandler,
}: {
  data: FormattedEternalFarming[] | null;
  refreshing: boolean;
  fetchHandler: () => any;
}) {
  const [modalForPool, setModalForPool] = useState(null);
  const { t } = useTranslation();

  const {
    fetchEternalFarmAprs: {
      fetchEternalFarmAprsFn,
      eternalFarmAprs,
      eternalFarmAprsLoading,
    },
    fetchEternalFarmTvls: {
      fetchEternalFarmTvlsFn,
      eternalFarmTvls,
      eternalFarmTvlsLoading,
    },
  } = useFarmingSubgraph() || {};

  useEffect(() => {
    fetchHandler();
    fetchEternalFarmAprsFn();
    fetchEternalFarmTvlsFn();
  }, []);

  return (
    <>
      <CustomModal open={!!modalForPool} onClose={() => setModalForPool(null)}>
        {modalForPool && (
          <FarmModal
            event={modalForPool}
            closeHandler={() => setModalForPool(null)}
            farmingType={FarmingType.ETERNAL}
          />
        )}
      </CustomModal>
      <Box padding={2}>
        {refreshing ? (
          <div className={'eternal-page__loader'}>
            <Loader stroke='white' size='1.5rem' />
          </div>
        ) : !data || data.length === 0 ? (
          <div className={'eternal-page__loader'}>
            <div>{t('noEternalFarms')}</div>
            <Frown size={'2rem'} stroke={'white'} />
          </div>
        ) : !refreshing && data.length !== 0 ? (
          <Grid container spacing={2}>
            {data.map((event: FormattedEternalFarming, j: number) => (
              <Grid item xs={12} sm={6} md={4} key={j}>
                <EternalFarmCard
                  farmHandler={() => setModalForPool(event as any)}
                  refreshing={refreshing}
                  now={0}
                  eternal
                  aprs={eternalFarmAprs}
                  aprsLoading={eternalFarmAprsLoading}
                  tvls={eternalFarmTvls}
                  tvlsLoading={eternalFarmTvlsLoading}
                  event={event}
                />
              </Grid>
            ))}
          </Grid>
        ) : null}
      </Box>
    </>
  );
}
