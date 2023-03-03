import React from 'react';
import { useActiveWeb3React } from 'hooks';
import useENSName from 'hooks/useENSName';
import { getEtherscanLink, shortenAddress } from 'utils';

type Props = {
  address: string;
  displayShortened?: boolean;
};

function AddressCell({ address, displayShortened = false }: Props) {
  const { chainId } = useActiveWeb3React();
  const { ENSName } = useENSName(address ?? undefined);

  if (!chainId) return <></>;

  return (
    <a
      href={getEtherscanLink(chainId, address, 'address')}
      target='_blank'
      rel='noopener noreferrer'
      className='text-primaryText no-decoration'
      style={{ width: '48%', textDecoration: 'none' }}
    >
      <small>
        {ENSName
          ? ENSName
          : displayShortened
          ? shortenAddress(address)
          : address}
      </small>
    </a>
  );
}

export default AddressCell;
