import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { EternalFarmCard } from 'components/StakerEventCard/EternalFarmCard';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import { CustomModal } from 'components';
import { FarmModal } from '../../components/StakeModal';
import { FarmingType } from '../../models/enums';
import './index.scss';
import { Aprs, FormattedEternalFarming } from 'models/interfaces';
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
  useEffect(() => {
    fetchHandler();
  }, []);

  const {
    fetchEternalFarmAprs: {
      fetchEternalFarmAprsFn,
      eternalFarmAprs,
      eternalFarmAprsLoading,
    },
  } = useFarmingSubgraph() || {};

  useEffect(() => {
    fetchEternalFarmAprsFn();
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
        <div className={'eternal-page__row mb-1 w-100'}>
          {data.map((event: FormattedEternalFarming, j: number) => (
            <EternalFarmCard
              key={j}
              farmHandler={() => setModalForPool(event as any)}
              refreshing={refreshing}
              now={0}
              eternal
              aprs={eternalFarmAprs}
              aprsLoading={eternalFarmAprsLoading}
              event={event}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
