import { Box, Typography } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import { DLQUICK } from 'constants/v3/addresses';
import { useNewLairInfo } from 'state/stake/hooks';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { formatCompact, useLairDQUICKAPY } from 'utils';
import { Skeleton } from '@material-ui/lab';
import { StakeQuickModal } from 'components';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';

interface DragonLayerInfoCardProps {
  chainId: any;
  config: any;
}

const DragonLayerInfoCard: React.FC<DragonLayerInfoCardProps> = ({
  chainId,
  config = {},
}) => {
  const { account } = useActiveWeb3React();
  const { t } = useTranslation();
  const lairInfo = useNewLairInfo();
  const dQUICKAPY = useLairDQUICKAPY(true, lairInfo);

  const [openStakeModal, setOpenStakeModal] = useState(false);

  const quickToken = DLQUICK[chainId];

  const oldLair = config['lair']?.oldLair;
  const newLair = config['lair']?.newLair;

  const {
    loading: loadingQuickPrice,
    price: quickPrice,
  } = useUSDCPriceFromAddress(quickToken?.address ?? '');

  const rewards = useMemo(() => {
    if (lairInfo && quickPrice) {
      const balance = Number(lairInfo.totalQuickBalance.toExact());
      if (balance > 0) {
        const newReward = balance * quickPrice;
        const formattedReward = formatCompact(newReward, 18, 3, 3);
        return formattedReward;
      }
      return '0';
    }
    return '0';
  }, [lairInfo, quickPrice]);

  const loading = lairInfo?.loading || loadingQuickPrice;

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
        <Box className='tradingSection' pt='20px'>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              className='text-uppercase'
              style={{ fontSize: '11px', fontWeight: 600 }}
            >
              {t('dragonslair')}{' '}
            </Typography>
            {account && (
              <h4
                style={{ marginBottom: '12px', marginTop: '0' }}
                onClick={() => setOpenStakeModal(true)}
              >
                {t('stake')} {'>'}
              </h4>
            )}
          </Box>
          {loading ? (
            <Skeleton variant='rect' width={100} height={45} />
          ) : (
            <Box>
              {/* <Box display='flex'>
                <sup>$</sup>
                <h3>{rewards}</h3>
              </Box> */}
              <Box className='text-success'>
                <Typography style={{ fontSize: '20px', color: '#1fb85f' }}>
                  {dQUICKAPY}%
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default DragonLayerInfoCard;
