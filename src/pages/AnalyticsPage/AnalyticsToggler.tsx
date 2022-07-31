import { Box } from '@material-ui/core';
import { INIT_CODE_HASH } from '@uniswap/sdk';
import { GlobalConst } from 'constants/index';
import {
  defaultAbiCoder,
  getCreate2Address,
  keccak256,
  solidityPack,
} from 'ethers/lib/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { toggleAnalyticsVersion } from 'state/analytics/actions';
import { useIsAnalyticsLoaded, useIsV3 } from 'state/analytics/hooks';
import { isV2PairExists, isV2TokenExists } from 'utils';
import { isV3PairExists, isV3TokenExists } from 'utils/v3-graph';
import 'pages/styles/analytics.scss';

const AnalyticsToggler: React.FC = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  const [complementAddress, setComplementAddress] = useState<{
    id: string;
  } | null>(null);

  const dispatch = useDispatch();

  const isV3 = useIsV3();
  const isLoaded = useIsAnalyticsLoaded();

  const activeLink = useMemo(
    () =>
      pathname
        .split('/')
        .slice(3)
        .join('/') || '',
    [pathname],
  );

  useEffect(() => {
    const path = activeLink.split('/');

    if (path.length < 2) {
      setComplementAddress({ id: '' });
      return;
    }

    setComplementAddress(null);

    if (path[0] === 'pair') {
      if (isV3) {
        isV3PairExists(path[1])
          .then((pair) => {
            if (pair) {
              return isV2PairExists(computeV2PairAddress(pair));
            }
          })
          .then(setComplementAddress);
      } else {
        isV2PairExists(path[1])
          .then((pair) => {
            if (pair) {
              return isV3PairExists(computeV3PairAddress(pair));
            }
          })
          .then(setComplementAddress);
      }
    } else if (path[0] === 'token') {
      if (isV3) {
        isV2TokenExists(path[1]).then(setComplementAddress);
      } else {
        isV3TokenExists(path[1]).then(setComplementAddress);
      }
    }
  }, [activeLink, isV3]);

  const handleToggle = useCallback(() => {
    const path = activeLink.split('/');

    if (path.length < 2 || path[0] === 'token') {
      history.push(
        `/analytics/${isV3 ? 'v2' : 'v3'}${activeLink ? `/${activeLink}` : ''}`,
      );
    } else if (path.length === 2 && path[0] === 'pair' && complementAddress) {
      history.push(
        `/analytics/${isV3 ? 'v2' : 'v3'}/pair/${complementAddress.id}`,
      );
    }
    dispatch(toggleAnalyticsVersion());
  }, [isV3, activeLink, complementAddress, dispatch, history]);

  return (
    <Box
      ml={2.5}
      className={`versionToggler flex`}
      onClick={() => {
        if (complementAddress && isLoaded) {
          handleToggle();
        }
      }}
    >
      <div
        className={`${!isV3 && `activeVersion`} ${(!complementAddress ||
          !isLoaded) &&
          'disabled'}`}
      >
        V2
      </div>
      <div
        className={`${isV3 && `activeVersion`} ${(!complementAddress ||
          !isLoaded) &&
          'disabled'}`}
      >
        V3
      </div>
    </Box>
  );
};

function computeV2PairAddress(pair: any) {
  return getCreate2Address(
    GlobalConst.addresses.FACTORY_ADDRESS,
    keccak256(
      solidityPack(['address', 'address'], [pair.token0.id, pair.token1.id]),
    ),
    INIT_CODE_HASH,
  );
}

function computeV3PairAddress(pair: any) {
  const POOL_DEPLOYER_ADDRESS_V3 = '0x390e1F04BF44C33F491231E7865fF05E583813C5';
  const POOL_HASH_V3 =
    '0xe1970ade7abdb2ad0709066b5086cc324cd391f945aab88b824d6a42e7646c51';
  return getCreate2Address(
    POOL_DEPLOYER_ADDRESS_V3,
    keccak256(
      defaultAbiCoder.encode(
        ['address', 'address'],
        [pair.token0.id, pair.token1.id],
      ),
    ),
    POOL_HASH_V3,
  );
}

export default AnalyticsToggler;
