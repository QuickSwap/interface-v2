import React from 'react';
import { Box } from '@material-ui/core';
import { GlobalConst } from '~/constants/index';
import { useTranslation } from 'react-i18next';
import { useIsV2 } from '~/state/application/hooks';
import { formatNumber, getFormattedPercent, getPriceClass } from '~/utils';

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
        value: data.pairCount ? formatNumber(data.pairCount) : '~',
        percentChange: null,
      },
      {
        title: t('24hTxs'),
        value: data.oneDayTxns ? formatNumber(data.oneDayTxns) : '~',
        percentChange: null,
      },
      {
        title: t('24hFees'),
        value: `$${
          data.oneDayVolumeUSD
            ? formatNumber(
                Number(data.oneDayVolumeUSD) * GlobalConst.utils.FEEPERCENT,
              )
            : '~'
        }`,
        percentChange: null,
      },
    ],
    v3: [
      {
        title: t('24hVol'),
        value: `$${
          data.oneDayVolumeUSD ? formatNumber(data.oneDayVolumeUSD) : '~'
        }`,
        percentChange: data.volumeChangeUSD,
      },
      {
        title: t('24hFees'),
        value: `$${data.feesUSD ? formatNumber(data.feesUSD) : '~'}`,
        percentChange: data.feesUSDChange,
      },
      {
        title: t('tvl'),
        value: `$${
          data.totalLiquidityUSD ? formatNumber(data.totalLiquidityUSD) : '~'
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
                  ? getFormattedPercent(Number(item.percentChange))
                  : '~%'
              }`}</small>
            </Box>
          ) : null}
        </Box>
      ))}
    </>
  );
};

export default AnalyticsInfo;
