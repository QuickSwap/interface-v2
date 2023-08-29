import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DLQUICK } from 'constants/v3/addresses';
import { useNewLairInfo } from 'state/stake/hooks';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { formatCompact, useLairDQUICKAPY } from 'utils';
import { Skeleton } from '@mui/lab';
import { StakeQuickModal } from 'components';
import { useTranslation } from 'react-i18next';
import styles from 'styles/pages/Home.module.scss';

interface DragonLayerInfoCardProps {
  chainId: any;
  config: any;
}

const DragonLayerInfoCard: React.FC<DragonLayerInfoCardProps> = ({
  chainId,
  config = {},
}) => {
  const { t } = useTranslation();
  const lairInfo = useNewLairInfo();
  const dQUICKAPY = useLairDQUICKAPY(true, lairInfo);

  const [rewards, setRewards] = useState('0');
  const [apy, setApy] = useState('0');
  const [openStakeModal, setOpenStakeModal] = useState(false);

  const quickToken = DLQUICK[chainId];

  const oldLair = config['lair']?.oldLair;
  const newLair = config['lair']?.newLair;

  const quickPrice = useUSDCPriceFromAddress(quickToken?.address);

  useEffect(() => {
    if (lairInfo && quickPrice) {
      const balance = Number(lairInfo.totalQuickBalance.toExact());
      if (balance > 0) {
        const newReward = balance * quickPrice;
        const formattedReward = formatCompact(newReward, 18, 3, 3);
        if (formattedReward !== rewards) {
          setRewards(formattedReward);
          setApy(dQUICKAPY);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickPrice, lairInfo, dQUICKAPY]);

  return (
    <>
      {openStakeModal && (
        <StakeQuickModal
          isNew={true}
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      {(oldLair || newLair) && (
        <Box className={styles.tradingSection} pt='20px'>
          {dQUICKAPY ? (
            <Box>
              <Box display='flex'>
                <h6>$</h6>
                <h3>{rewards}</h3>
              </Box>
              <Box className='text-success text-center'>
                <small>{apy}%</small>
              </Box>
            </Box>
          ) : (
            <Skeleton variant='rectangular' width={100} height={45} />
          )}
          <p>{t('dragonslair')}</p>
          <h4 onClick={() => setOpenStakeModal(true)}>
            {t('stake')} {'>'}
          </h4>
        </Box>
      )}
    </>
  );
};

export default DragonLayerInfoCard;
