import React, { useMemo } from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { BigNumber } from '@ethersproject/bignumber';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import RemoveLiquidityV3 from 'components/v3/RemoveLiquidityV3';
import { Box } from '@mui/material';

const RemoveLiquidityV3Page = (
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
      {position && <RemoveLiquidityV3 position={position} />}
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

export default RemoveLiquidityV3Page;
