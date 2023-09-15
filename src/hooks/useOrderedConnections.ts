import { ConnectionType, networkConnection } from 'connectors';
import { useGetConnection } from 'hooks';
import { useMemo } from 'react';
import { useAppSelector } from 'state/hooks';

const SELECTABLE_WALLETS = [
  ConnectionType.METAMASK,
  ConnectionType.WALLET_CONNECT,
  ConnectionType.COINBASE_WALLET,
  ConnectionType.ARKANE,
  ConnectionType.PHATOM,
  ConnectionType.TRUSTWALLET,
  ConnectionType.BITGET,
  ConnectionType.BLOCKWALLET,
  ConnectionType.BRAVEWALLET,
  ConnectionType.CYPHERD,
  ConnectionType.OKXWALLET,
  ConnectionType.CRYPTOCOM,
  ConnectionType.UNSTOPPABLEDOMAINS,
];

export default function useOrderedConnections() {
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet);
  const getConnection = useGetConnection();
  return useMemo(() => {
    const orderedConnectionTypes: ConnectionType[] = [];

    orderedConnectionTypes.push(ConnectionType.NETWORK);

    // Add the `selectedWallet` to the top so it's prioritized, then add the other selectable wallets.
    if (selectedWallet) {
      orderedConnectionTypes.push(selectedWallet);
    }
    orderedConnectionTypes.push(
      ...SELECTABLE_WALLETS.filter((wallet) => wallet !== selectedWallet),
    );

    return orderedConnectionTypes.map(
      (connectionType) => getConnection(connectionType) ?? networkConnection,
    );
  }, [selectedWallet, getConnection]);
}
