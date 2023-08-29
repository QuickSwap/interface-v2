import React, { useEffect } from 'react';
import IntractAttribution, { trackCustomWallet } from '@intract/attribution';
import { useActiveWeb3React } from 'hooks';

const IntractTracking = () => {
  const { account } = useActiveWeb3React();
  const intractKey = process.env.NEXT_PUBLIC_INTRACT_KEY;
  useEffect(() => {
    if (intractKey) {
      IntractAttribution(intractKey, {
        configAllowCookie: true,
      });
    }
  }, [intractKey]);

  useEffect(() => {
    if (!account) return;
    (async () => {
      if (account) {
        trackCustomWallet(account);
      }
    })();
  }, [account]);

  return <></>;
};

export default IntractTracking;
