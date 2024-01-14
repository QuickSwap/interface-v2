import React, { useMemo } from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { BigNumber } from '@ethersproject/bignumber';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import IncreaseLiquidityV3 from 'components/v3/IncreaseLiquidityV3';
import { Box } from '@mui/material';

const IncreaseLiquidityV3Page = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  const router = useRouter();
  const tokenId = router.query?.tokenId;
  const parsedTokenId = useMemo(() => {
    try {
      return BigNumber.from(tokenId);
    } catch {
      return;
    }
  }, [tokenId]);

  const isUni = router.query?.isUni === 'true';
  const { position } = useV3PositionFromTokenId(parsedTokenId, isUni);

  return (
    <Box className='wrapper'>
      {position && <IncreaseLiquidityV3 positionDetails={position} />}
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default IncreaseLiquidityV3Page;
