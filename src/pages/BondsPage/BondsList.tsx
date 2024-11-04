import React, { useEffect, useMemo, useState } from 'react';
import { useFetchBonds } from 'hooks/bond/useFetchBonds';
import useParsedQueryString from 'hooks/useParsedQueryString';
import Loader from 'components/Loader';
import BondItem from './BondItem';
import { Box } from '@material-ui/core';
import { useUserOwnedBonds } from 'hooks/bond/useUserBond';
import { useTranslation } from 'react-i18next';
import UserBondItem from './UserBondItem';
import { useActiveWeb3React } from 'hooks';
import { formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { SortColumns } from 'components';
import 'pages/styles/bonds.scss';

interface BondsListProps {
  search: string;
}

const BondsList: React.FC<BondsListProps> = ({ search }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const parsedQuery = useParsedQueryString();
  const bondsStatus =
    parsedQuery && parsedQuery.status
      ? (parsedQuery.status as string)
      : 'available';
  const bondsType =
    parsedQuery && parsedQuery.bondType
      ? (parsedQuery.bondType as string)
      : 'availableBonds';

  const { loading, data: bonds } = useFetchBonds();
  const userBonds = useUserOwnedBonds(bonds);

  const [sortBy, setSortBy] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const sortMultiplier = sortDesc ? -1 : 1;
  const filteredBonds = useMemo(() => {
    if (!bonds) return [];
    return bonds
      .map((bond) => {
        const available = Number(
          formatUnits(
            BigNumber.from(bond?.maxTotalPayOut ?? '0').sub(
              BigNumber.from(bond?.totalPayoutGiven ?? '0'),
            ),
            bond.earnToken?.decimals?.[chainId] ?? undefined,
          ),
        );
        const thresholdToShow =
          bond && bond.earnTokenPrice && bond.earnTokenPrice > 0
            ? 5 / bond.earnTokenPrice
            : 0;
        const displayAvailable = available - thresholdToShow;
        const dollarAvailable =
          (bond?.earnTokenPrice ?? 0) * (Number(displayAvailable) ?? 0);
        return { ...bond, bondAvailableTokensUSD: dollarAvailable };
      })
      .filter((bond) => {
        const available = Number(
          formatUnits(
            BigNumber.from(bond?.maxTotalPayOut ?? '0').sub(
              BigNumber.from(bond?.totalPayoutGiven ?? '0'),
            ),
            bond.earnToken?.decimals?.[chainId] ?? undefined,
          ),
        );
        const thresholdToHide =
          bond && bond.earnTokenPrice && bond.earnTokenPrice > 0
            ? 100 / bond.earnTokenPrice
            : 0;
        const disabled = bond.soldOut
          ? true
          : bond.maxTotalPayOut && bond.totalPayoutGiven && bond.earnTokenPrice
          ? available <= thresholdToHide || Number(bond.discount) === 100
          : true;
        const bondStatusCondition =
          bond.loading || !disabled === (bondsStatus === 'available');

        const searchCondition =
          bond.earnToken.symbol.toLowerCase().includes(search.toLowerCase()) ||
          bond.lpToken.symbol.toLowerCase().includes(search.toLowerCase());
        return searchCondition && bondStatusCondition;
      })
      .sort((bond1, bond2) => {
        if (sortBy === 'bondDiscount') {
          return (bond1.discount ?? 0) > (bond2.discount ?? 0)
            ? sortMultiplier
            : -1 * sortMultiplier;
        } else if (sortBy === 'bondVestingTerm') {
          return (bond1.vestingTerm ?? 0) > (bond2.vestingTerm ?? 0)
            ? sortMultiplier
            : -1 * sortMultiplier;
        } else if (sortBy === 'bondAvailableTokens') {
          return bond1.bondAvailableTokensUSD > bond2.bondAvailableTokensUSD
            ? sortMultiplier
            : -1 * sortMultiplier;
        } else {
          const title1 = bond1.lpToken.symbol + bond1.earnToken.symbol;
          const title2 = bond2.lpToken.symbol + bond2.earnToken.symbol;
          return title1 > title2 ? sortMultiplier : -1 * sortMultiplier;
        }
      });
  }, [bonds, bondsStatus, chainId, search, sortBy, sortMultiplier]);

  const filteredUserBonds = useMemo(() => {
    if (!userBonds) return [];
    return userBonds
      .filter((userBond) => {
        const { bond } = userBond;

        const searchCondition =
          bond.earnToken.symbol.toLowerCase().includes(search.toLowerCase()) ||
          bond.lpToken.symbol.toLowerCase().includes(search.toLowerCase());
        return searchCondition;
      })
      .sort((bond1, bond2) => {
        if (sortBy === 'bondClaimable') {
          const bond1Claimable = Number(
            formatUnits(
              bond1.pendingRewards ?? '0',
              bond1.bond?.earnToken?.decimals?.[chainId] ?? 18,
            ),
          );
          const bond2Claimable = Number(
            formatUnits(
              bond2.pendingRewards ?? '0',
              bond2.bond?.earnToken?.decimals?.[chainId] ?? 18,
            ),
          );
          const bond1ClaimUSD =
            (bond1.bond.earnTokenPrice ?? 0) * bond1Claimable;
          const bond2ClaimUSD =
            (bond2.bond.earnTokenPrice ?? 0) * bond2Claimable;
          return bond1ClaimUSD > bond2ClaimUSD
            ? sortMultiplier
            : -1 * sortMultiplier;
        } else if (sortBy === 'bondPending') {
          const bond1Pending = Number(
            formatUnits(
              bond1.payout ?? '0',
              bond1.bond?.earnToken?.decimals?.[chainId] ?? 18,
            ),
          );
          const bond2Pending = Number(
            formatUnits(
              bond2.payout ?? '0',
              bond2.bond?.earnToken?.decimals?.[chainId] ?? 18,
            ),
          );
          const bond1PendingUSD =
            (bond1.bond.earnTokenPrice ?? 0) * bond1Pending;
          const bond2PendingUSD =
            (bond2.bond.earnTokenPrice ?? 0) * bond2Pending;
          return bond1PendingUSD > bond2PendingUSD
            ? sortMultiplier
            : -1 * sortMultiplier;
        } else if (sortBy === 'bondFullyVested') {
          return Number(bond1.lastBlockTimestamp ?? 0) >
            Number(bond2.lastBlockTimestamp ?? 0)
            ? sortMultiplier
            : -1 * sortMultiplier;
        } else {
          const title1 =
            bond1.bond.lpToken.symbol + bond1.bond.earnToken.symbol;
          const title2 =
            bond2.bond.lpToken.symbol + bond2.bond.earnToken.symbol;
          return title1 > title2 ? sortMultiplier : -1 * sortMultiplier;
        }
      });
  }, [chainId, search, sortBy, sortMultiplier, userBonds]);

  const sortColumns = [
    {
      text: t('token'),
      index: 'bondTitle',
      width: 0.3,
      justify: 'flex-start',
    },
    {
      text: bondsType === 'myBonds' ? t('claimable') : t('discount'),
      index: bondsType === 'myBonds' ? 'bondClaimable' : 'bondDiscount',
      width: bondsType === 'myBonds' ? 0.17 : 0.2,
      justify: 'flex-start',
    },
    {
      text: bondsType === 'myBonds' ? t('pending') : t('vestingTerm'),
      index: bondsType === 'myBonds' ? 'bondPending' : 'bondVestingTerm',
      width: bondsType === 'myBonds' ? 0.17 : 0.2,
      justify: 'flex-start',
    },
    {
      text: bondsType === 'myBonds' ? t('fullyVested') : t('availableTokens'),
      index:
        bondsType === 'myBonds' ? 'bondFullyVested' : 'bondAvailableTokens',
      width: 0.2,
      justify: 'flex-start',
    },
  ];

  const sortByDesktopItems = sortColumns.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortBy === item.index) {
          setSortDesc(!sortDesc);
        } else {
          setSortBy(item.index);
          setSortDesc(false);
        }
      },
    };
  });

  const showSort = useMemo(() => {
    if (bondsType === 'myBonds')
      return filteredUserBonds && filteredUserBonds.length > 0;
    return filteredBonds.length > 0;
  }, [bondsType, filteredBonds.length, filteredUserBonds]);

  useEffect(() => {
    if (bondsType === 'myBonds') {
      setSortBy('bondTitle');
    } else {
      setSortBy('bondDiscount');
    }
  }, [bondsType]);

  return (
    <Box pb={2} px={3}>
      {showSort && (
        <Box padding='10px 16px' className='sortBondList'>
          <SortColumns
            sortColumns={sortByDesktopItems}
            selectedSort={sortBy}
            sortDesc={sortDesc}
          />
        </Box>
      )}
      {bondsType === 'availableBonds' &&
        (loading ? (
          <Box className='flex justify-center items-center' height='100px'>
            <Loader size='32px' />
          </Box>
        ) : filteredBonds.length > 0 ? (
          <>
            {filteredBonds.map((bond) => (
              <BondItem key={bond.index} bond={bond} />
            ))}
          </>
        ) : (
          <Box
            width='100%'
            height='50px'
            className='flex items-center justify-center'
          >
            <p>{t('noBond')}</p>
          </Box>
        ))}
      {bondsType === 'myBonds' &&
        (filteredUserBonds && filteredUserBonds.length > 0 ? (
          <>
            {filteredUserBonds.map((userBond) => (
              <UserBondItem key={userBond.id} userBond={userBond} />
            ))}
          </>
        ) : (
          <Box
            width='100%'
            height='50px'
            className='flex items-center justify-center'
          >
            <p>{t('noUserBonds')}</p>
          </Box>
        ))}
    </Box>
  );
};

export default BondsList;
