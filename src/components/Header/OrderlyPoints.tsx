import React from 'react';
import { useQuery } from '@orderly.network/hooks';
import { Box } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';

export const OrderlyPoints: React.FC = () => {
  const { account } = useActiveWeb3React();
  const { data, isLoading } = useQuery(`/v1/client/points?address=${account}`);
  return <Box></Box>;
};
