import React, { useEffect, useRef, useState } from 'react';
import { CBPayInstance, CBPayInstanceType, initOnRamp } from '@coinbase/cbpay-js';
import BuyWithCoinbaseSrc from 'assets/cbpay-buttons/Normal_56px/button-cbPay-normal-generic.png'
import { useActiveWeb3React } from 'hooks';


export function CoinbaseButton() {
    const [onRampInstance, setOnrampInstance] = useState<CBPayInstanceType | null>();
    //TODO: support mulitchain 
    const { chainId, account } = useActiveWeb3React();
    useEffect(() => {  
        initOnRamp({
            appId:  `${process.env.REACT_APP_PUBLIC_COINBASE_PAY_APP_ID}`,
            target: '#cbpay-button-container',
            widgetParameters: {
                destinationWallets: [{
                    address: account ?? '',
                    blockchains: ['polygon'],
                    assets: ['USDC', 'MATIC', 'ETH']
             }],
            },

            onSuccess: () => {
              console.log("success")
            },
            onExit: () => {
              console.log("exit")
            },
            onEvent: (event) => {
              // event stream
              console.log(event)
            },
            experienceLoggedIn: 'embedded',
            experienceLoggedOut: 'popup',
            closeOnExit: true,
            closeOnSuccess: true,
        }, (_, instance) => {
            setOnrampInstance(instance);
          });
      
          return () => {
            onRampInstance?.destroy();
          };
        }, []);

    const handleClick = () => {
        onRampInstance?.open()
    }

    const disabled = !process.env.REACT_APP_PUBLIC_COINBASE_PAY_APP_ID || !onRampInstance

    // render with button from previous example
    return (
        <a id="cbpay-button-container"
           onClick={handleClick}
        >
            <img src={BuyWithCoinbaseSrc} alt='Coinbase Pay' />
        </a>
    );
}