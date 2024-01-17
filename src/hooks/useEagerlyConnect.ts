import { Connector } from '@web3-react/types';
import {
  Connection,
  ConnectionType,
  networkConnection,
} from 'connectors/index';
import { useGetConnection } from 'hooks';
import { useEffect, useState } from 'react';
import { useSelectedWallet } from 'state/user/hooks';

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
  const getConnection = useGetConnection();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const selectedWallet = localStorage.getItem('selectedWallet');
    let selectedConnection: Connection | undefined;
    if (selectedWallet) {
      try {
        selectedConnection = getConnection(selectedWallet as ConnectionType);
      } catch {
        updateSelectedWallet(undefined);
      }
    } else {
      updateSelectedWallet(undefined);
    }
    if (selectedConnection) {
      connect(selectedConnection.connector).then(() => setTried(true));
    } else {
      connect(networkConnection.connector).then(() => setTried(true));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return tried;
}
