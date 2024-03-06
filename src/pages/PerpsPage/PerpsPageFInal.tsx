import React from 'react';
import { Box, Grid, styled } from '@material-ui/core';
import { useAccount, useChains } from '@orderly.network/hooks';
import PerpsProChart from './PerpsChart';
import { Theme, Button, Container, Flex, Switch, Tabs } from '@radix-ui/themes';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './index.css';
import '@radix-ui/themes/styles.css';
import { useActiveWeb3React } from '~/hooks';
import { ChainId, Token } from '@uniswap/sdk';
import { Account } from './Account';
import { Assets } from './Assets';
import { CreateOrder } from './CreateOrder';
import { Orderbook } from './Orderbook';
import { Orders } from './Orders';
import { Positions } from './Positions';
import { Trades } from './Trades';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';
import PerpsChart from './PerpsChart';
import { V2_MATIC_USDT_PAIR } from '~/constants/v3/addresses';
import { AdvancedChart } from 'react-tradingview-embed';

const Item = styled(Box)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

export const PerpsPage = () => {
  const { chainId, library, account } = useActiveWeb3React();
  const [provider, setProvider] = useState<any | undefined>();
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>();

  useEffect(() => {
    async function run() {
      if (!window.ethereum) return;
      const p = new window.ethereum();
      setProvider(p);
      const s = await p.getSigner();
      setSigner(s);
    }
    run();
  }, []);

  return (
    <Theme>
      <Container style={{ margin: '2rem auto', maxWidth: '45rem' }}>
        <Button
          disabled={provider == null}
          onClick={async () => {
            if (!provider || !!signer) return;
            const s = await provider.getSigner();
            setSigner(s);
          }}
        >
          {signer
            ? `${signer._address.substring(0, 6)}...${signer._address.substr(
                -4,
              )}`
            : 'Connect wallet'}
        </Button>

        <Box sx={{ flexGrow: 5 }} color={'white'}>
          <Grid container spacing={2}>
            <Grid item>
              <AdvancedChart widgetProps={{ theme: 'dark' }} />;
            </Grid>
            <Grid>
              <Item style={{ padding: 2 }}>
                <Account signer={signer} />
              </Item>
              <Item style={{ padding: 2 }}>
                <Assets signer={signer} />
              </Item>
            </Grid>
            <Grid>
              <Item style={{ padding: 2 }}>
                <Orderbook />
              </Item>
              <Item style={{ padding: 2 }}>
                <CreateOrder />
              </Item>
            </Grid>
            <Grid>
              <Item style={{ padding: 2 }}>
                <Orders />
              </Item>
              <Item className='bg-palette mt-1' style={{ padding: 2 }}>
                <Positions />
              </Item>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Theme>
  );
};

export default PerpsPage;
