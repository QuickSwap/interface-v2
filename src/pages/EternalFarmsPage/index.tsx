import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import { EternalFarmCard } from 'components/StakerEventCard/EternalFarmCard';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import { CustomModal, CustomSwitch } from 'components';
import { FarmModal } from '../../components/StakeModal';
import { FarmingType } from '../../models/enums';
import './index.scss';
import { FormattedEternalFarming } from 'models/interfaces';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useHistory } from 'react-router';

export default function EternalFarmsPage() {
  const [modalForPool, setModalForPool] = useState(null);
  const { t } = useTranslation();
  const parsedQuery = useParsedQueryString();
  const history = useHistory();
  const farmStatus =
    parsedQuery && parsedQuery.farmStatus
      ? (parsedQuery.farmStatus as string)
      : 'active';

  const {
    fetchEternalFarms: {
      fetchEternalFarmsFn,
      eternalFarms,
      eternalFarmsLoading,
    },
    fetchEternalFarmPoolAprs: {
      fetchEternalFarmPoolAprsFn,
      eternalFarmPoolAprs,
      eternalFarmPoolAprsLoading,
    },
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
    fetchEternalFarmsFn(true, farmStatus === 'ended');
    fetchEternalFarmPoolAprsFn();
    fetchEternalFarmAprsFn();
    fetchEternalFarmTvlsFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmStatus]);

  const redirectWithFarmStatus = (status: string) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath;
    if (parsedQuery.farmStatus) {
      redirectPath = currentPath.replace(
        `farmStatus=${parsedQuery.farmStatus}`,
        `farmStatus=${status}`,
      );
    } else {
      redirectPath = `${currentPath}${
        history.location.search === '' ? '?' : '&'
      }farmStatus=${status}`;
    }
    history.push(redirectPath);
  };

  const farmStatusItems = [
    {
      text: t('active'),
      onClick: () => {
        redirectWithFarmStatus('active');
      },
      condition: farmStatus === 'active',
    },
    {
      text: t('ended'),
      onClick: () => {
        redirectWithFarmStatus('ended');
      },
      condition: farmStatus === 'ended',
    },
  ];

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
      <Box ml={2}>
        <CustomSwitch width={160} height={40} items={farmStatusItems} />
      </Box>
      <Box px={2} py={3}>
        {eternalFarmsLoading ? (
          <div className={'eternal-page__loader'}>
            <Loader stroke='white' size='1.5rem' />
          </div>
        ) : !eternalFarms || eternalFarms.length === 0 ? (
          <div className={'eternal-page__loader'}>
            <div>
              {t(
                farmStatus === 'active'
                  ? 'noActiveEternalFarms'
                  : 'noEndedEternalFarms',
              )}
            </div>
            <Frown size={'2rem'} stroke={'white'} />
          </div>
        ) : !eternalFarmsLoading && eternalFarms.length !== 0 ? (
          <Grid container spacing={2}>
            {eternalFarms.map((event: FormattedEternalFarming, j: number) => (
              <Grid item xs={12} sm={6} md={4} key={j}>
                <EternalFarmCard
                  farmHandler={() => setModalForPool(event as any)}
                  refreshing={eternalFarmsLoading}
                  now={0}
                  eternal
                  poolAprs={eternalFarmPoolAprs}
                  poolAprsLoading={eternalFarmPoolAprsLoading}
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
