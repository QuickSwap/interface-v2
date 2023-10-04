import React from 'react';
import { useFetchBonds } from 'hooks/bond/useFetchBonds';
import useParsedQueryString from 'hooks/useParsedQueryString';
import Loader from 'components/Loader';
import BondItem from './BondItem';
import { Box } from '@material-ui/core';
import { useUserOwnedBonds } from 'hooks/bond/useUserBond';
import { useTranslation } from 'react-i18next';
import UserBondItem from './UserBondItem';
import { useActiveWeb3React } from 'hooks';

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

  return (
    <Box pb={2} px={3}>
      {bondsType === 'availableBonds' &&
        (loading ? (
          <Box className='flex justify-center items-center' height='100px'>
            <Loader size='32px' />
          </Box>
        ) : bonds && bonds.length > 0 ? (
          <>
            {bonds.map((bond) => (
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
        (userBonds && userBonds.length > 0 ? (
          <>
            {userBonds.map((userBond) => (
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
