import React, { useEffect } from 'react';
import './index.scss';
import { Layout } from './Layout';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config/index';
import { useHistory } from 'react-router-dom';

export const PerpsPage = () => {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const perpsV2Available = config['perpsV2']['available'];
  const history = useHistory();

  if (!perpsV2Available) {
    location.href = '/';
  }

  useEffect(() => {
    if (!perpsV2Available) {
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perpsV2Available]);

  return (
    <div className='perpsV2PageWrapper'>
      <Layout />
    </div>
  );
};

export default PerpsPage;
