import React, { useEffect, useState } from 'react';
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
              tvls={eternalFarmTvls}
              tvlsLoading={eternalFarmTvlsLoading}
              event={event}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
