import React, { ReactNode, useMemo } from 'react';
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import useEagerlyConnect from 'hooks/useEagerlyConnect';
import useOrderedConnections from 'hooks/useOrderedConnections';

export default function Web3ReactManager({
  children,
}: {
  children: ReactNode;
}) {
  const tried = useEagerlyConnect();
  const connections = useOrderedConnections();

  const connectors: [
    Connector,
    Web3ReactHooks,
  ][] = connections.map(({ hooks, connector }) => [connector, hooks]);

  const key = useMemo(
    () => connections.map((connection) => connection.name).join('-'),
    [connections],
  );

  if (!tried) return <></>;

  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      {children}
    </Web3ReactProvider>
  );
}
