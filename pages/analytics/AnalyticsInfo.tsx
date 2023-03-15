import React from 'react';
import { Box } from '@material-ui/core';
import { GlobalConst } from 'constants/index';
import { useTranslation } from 'react-i18next';
import { useIsV2 } from 'state/application/hooks';
import { getFormattedPrice, getPriceClass } from 'utils';

interface AnalyticsInfoProps {
  data: any;
}

const AnalyticsInfo: React.FC<AnalyticsInfoProps> = ({ data }) => {
  const { t } = useTranslation();

  const { isV2 } = useIsV2();

  const list = {
    v2: [
      {
        title: t('pairs'),
        value: data.pairCount?.toLocaleString('us'),
        percentChange: null,
      },
      {
        title: t('24hTxs'),
        value: data.oneDayTxns?.toLocaleString('us'),
        percentChange: null,
      },
      {
        title: t('24hFees'),
        value: `$${(
          data.oneDayVolumeUSD * GlobalConst.utils.FEEPERCENT
        )?.toLocaleString('us')}`,
        percentChange: null,
      },
    ],
    v3: [
      {
        title: t('24hVol'),
        value: `$${
          data.oneDayVolumeUSD !== undefined
            ? data.oneDayVolumeUSD.toLocaleString('us')
            : '~'
        }`,
        percentChange: data.volumeChangeUSD,
      },
      {
        title: t('24hFees'),
        value: `$${
          data.feesUSD === undefined ? '~' : data.feesUSD.toLocaleString('us')
        }`,
        percentChange: data.feesUSDChange,
      },
      {
        title: t('tvl'),
        value: `$${
          data.totalLiquidityUSD === undefined
            ? '~'
            : data.totalLiquidityUSD.toLocaleString('us')
        }`,
        percentChange: data.liquidityChangeUSD,
      },
    ],
  };

  return (
    <>
      {list[isV2 ? 'v2' : 'v3'].map((item, i, arr) => (
        <Box
          className='flex items-center'
          key={i}
          mr={i === arr.length - 1 ? 0 : 5}
        >
          <small>
            {item.title}: {item.value}
          </small>
          {item.percentChange !== null ? (
            <Box
              ml={2}
              className={`priceChangeWrapper ${getPriceClass(
                Number(item.percentChange),
              )}`}
            >
              <small>{`${
                item.percentChange
                  ? getFormattedPrice(Number(item.percentChange))
                  : '~'
              }%`}</small>
            </Box>
          ) : null}
        </Box>
      ))}
    </>
  );
};

export default AnalyticsInfo;
