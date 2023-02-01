import React from 'react';
import { Box, Button } from 'theme/components';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';
import GammaLPList from './GammaLPList';
import { useQuery } from 'react-query';
import { GammaPairs } from 'constants/index';

export default function MyLiquidityPoolsV3() {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  const fetchGammaPositions = async () => {
    if (!account) return;
    try {
      const data = await fetch(
        `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/polygon/user/${account}`,
      );
      const positions = await data.json();
      return positions[account.toLowerCase()];
    } catch {
      try {
        const data = await fetch(
          `${process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP}/quickswap/polygon/user/${account}`,
        );
        const positions = await data.json();
        return positions[account.toLowerCase()];
      } catch (e) {
        console.log(e);
        return;
      }
    }
  };

  const { isLoading: positionsLoading, data: gammaPositions } = useQuery(
    'fetchGammaPositions',
    fetchGammaPositions,
    {
      refetchInterval: 30000,
    },
  );

  const gammaPositionList = gammaPositions
    ? Object.keys(gammaPositions).filter(
        (value) =>
          !!Object.values(GammaPairs).find(
            (pairData) =>
              !!pairData.find(
                (item) => item.address.toLowerCase() === value.toLowerCase(),
              ),
          ),
      )
    : [];

  return (
    <Box>
      <p className='weight-600'>{t('myGammaLP')}</p>
      <>
        {positionsLoading ? (
          <Box margin='16px 0 0' className='flex justify-center'>
            <Loader stroke='white' size={'2rem'} />
          </Box>
        ) : gammaPositions && gammaPositionList.length > 0 ? (
          <GammaLPList
            gammaPairs={gammaPositionList}
            gammaPositions={gammaPositions}
          />
        ) : (
          <Box margin='16px 0 0' textAlign='center'>
            <p>{t('noLiquidityPositions')}.</p>
            {showConnectAWallet && (
              <Box maxWidth='250px' margin='20px auto 0'>
                <Button width='100%' onClick={toggleWalletModal}>
                  {t('connectWallet')}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </>
    </Box>
  );
}
