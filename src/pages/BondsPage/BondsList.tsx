import React, { useMemo } from 'react';
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

  const filteredBonds = useMemo(() => {
    if (!bonds) return [];
    return bonds.filter((bond) => {
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
      const disabled =
        bond.maxTotalPayOut && bond.totalPayoutGiven && bond.earnTokenPrice
          ? available <= thresholdToHide || Number(bond.discount) === 100
          : false;
      const bondStatusCondition = !disabled === (bondsStatus === 'available');

      const searchCondition =
        bond.earnToken.symbol.toLowerCase().includes(search.toLowerCase()) ||
        bond.token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        bond.lpToken.symbol.toLowerCase().includes(search.toLowerCase());
      return searchCondition && bondStatusCondition;
    });
  }, [bonds, bondsStatus, chainId, search]);

  const filteredUserBonds = useMemo(() => {
    if (!userBonds) return [];
    return userBonds.filter((userBond) => {
      const { bond } = userBond;
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
      const disabled =
        bond.maxTotalPayOut && bond.totalPayoutGiven && bond.earnTokenPrice
          ? available <= thresholdToHide || Number(bond.discount) === 100
          : false;

      const searchCondition =
        bond.earnToken.symbol.toLowerCase().includes(search.toLowerCase()) ||
        bond.token.symbol.toLowerCase().includes(search.toLowerCase()) ||
        bond.lpToken.symbol.toLowerCase().includes(search.toLowerCase());
      return searchCondition;
    });
  }, [chainId, search, userBonds]);

  return (
    <Box pb={2} px={3}>
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
