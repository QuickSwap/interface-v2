import { ConnectionType, networkConnection } from 'connectors';
import { useMemo } from 'react';
import { useAppSelector } from 'state/hooks';
import { getConnection } from 'utils';

const SELECTABLE_WALLETS = [
  ConnectionType.INJECTED,
  ConnectionType.WALLET_CONNECT,
  ConnectionType.COINBASE_WALLET,
];

export default function useOrderedConnections() {
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet);
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
  }, [selectedWallet]);
}
