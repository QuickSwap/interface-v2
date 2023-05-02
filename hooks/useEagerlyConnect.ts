import { Connector } from '@web3-react/types';
import { networkConnection } from 'connectors/index';
import { useEffect, useState } from 'react';
import { useSelectedWallet } from 'state/user/hooks';
import { getConnection } from 'utils';

async function connect(connector: Connector) {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`);
  }
}

export default function useEagerlyConnect() {
  const { updateSelectedWallet } = useSelectedWallet();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const selectedWallet = localStorage.getItem('selectedWallet');
    if (selectedWallet) {
      try {
        const selectedConnection = getConnection(selectedWallet);
        if (selectedConnection) {
          connect(selectedConnection.connector).then(() => setTried(true));
        } else {
          connect(networkConnection.connector).then(() => setTried(true));
        }
      } catch {
        updateSelectedWallet(undefined);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return tried;
}
