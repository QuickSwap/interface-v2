import React, { ReactNode } from 'react';
import { AutoColumn } from 'components/v3/Column';
import { TYPE } from 'theme/index';

export function EmptyState({ message }: { message: ReactNode }) {
  return (
    <AutoColumn
      style={{ minHeight: 200, justifyContent: 'center', alignItems: 'center' }}
    >
      <TYPE.body>{message}</TYPE.body>
    </AutoColumn>
  );
}
