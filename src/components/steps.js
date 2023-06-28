
const newSteps = [
  {
    id: 'welcome',
    title: 'Step 1',
    text: [
      `
      <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word">Connect your web3 wallet</div>
      <div style="margin-top: 1rem;width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">A non-custodial web3 wallet serves as a gateway to use dApps. It is your web3 identity, pro tip: never share your private keys.</div>
        `,
    ],
    attachTo: { element: '.App-header-user', on: 'bottom' },
    classes: 'shepherd shepherd-welcome',
    buttons: [
      {
        type: 'cancel',
        classes: 'shepherd-button-secondary',
        text: 'Exit',
      },
      {
        type: 'next',
        text: 'Next',
      },
    ],
  },
  {
    id: 'installation',
    title: 'Step 2',
    text:
      `
      Select a wallet
      <div style="margin-top: 1rem;width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">Choose any of the shown non-custodial web3 wallets. Make sure you have it installed in your browser. Alternatively you can also scan QR code and connect via wallet connect supported wallets. </div>
      `,
    attachTo: { element: '.Connect-wallet-modal', on: 'right' },
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Next',
      },
    ],
  },
  {
    id: 'usage',
    title: 'Usage',
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        document.querySelector('.Connect-wallet-modal').style.opacity = "0"
        resolve();
      });
    },
    text: `
    <div style="display: flex;justify-content: space-between;">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 16px;">
        <button style="color: black; padding: 6px 30px; font-size: 20px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); box-shadow: 0px 0px 20.569976806640625px 0px #B8BBFF; background: #FFF;">Long</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Short</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Swap</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This means you buy a cryptocurrency, like Bitcoin, because you believe its price will increase in the future. You're planning to "go long," or profit from an increase in its price.<br/></div>
            `,
    attachTo: { element: '.tradePage', on: 'left' },
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Next',
      },
    ],
  },
  {
    id: 'long',
    title: 'Centered Shepherd Element',
    attachTo: { element: '.tradePage', on: 'left' },
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        [...document.querySelector('.tradePage').children].forEach((element,index) => {
          if(index == 1){
            element.classList.add('active')
          }else{
            element.classList.remove('active')
          }
        });

        resolve();
      });
    },
    text: `
    <div style="display: flex;justify-content: space-between;">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 16px;">
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Long</button>
        <button style="color: black; padding: 6px 30px; font-size: 20px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); box-shadow: 0px 0px 20.569976806640625px 0px #B8BBFF; background: #FFF;"">Short</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Swap</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This means you're betting that the price of a cryptocurrency will fall. In this situation, you'd "short" a token, planning to profit from a decrease in its price.
    <br/></div>
            `,
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Next',
      },
    ],
   
  },
  {
    id: 'swap',
    title: 'Learn more',
    attachTo: { element: '.tradePage', on: 'left' },
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        [...document.querySelector('.tradePage').children].forEach((element,index) => {
          if(index == 2){
            element.classList.add('active')
          }else{
            element.classList.remove('active')
          }
        });

        resolve();
      });
    },
    text: `
    <div style="display: flex;justify-content: space-between;">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 16px;">
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Long</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Short</button>
        <button style="color: black; padding: 6px 30px; font-size: 20px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); box-shadow: 0px 0px 20.569976806640625px 0px #B8BBFF; background: #FFF;">Swap</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This means the direct exchange of one type of cryptocurrency for another.    <br/></div>
            `,
    scrollTo: true,
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Done',
      },
    ],
  },
  {
    id: 'market',
    title: 'Learn more',
    text: `
    <div style="display: flex;justify-content: space-between;">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 16px;">
        <button style="color: black; padding: 6px 30px; font-size: 20px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); box-shadow: 0px 0px 20.569976806640625px 0px #B8BBFF; background: #FFF;">Market</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Limit</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Trigger</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This is when you buy or sell a cryptocurrency immediately at the best available price in the market. It's like buying a toy at the price it's currently being sold for.<br/></div>
            `,
    attachTo: { element: '.Exchange-swap-order-type-tabs', on: 'left' },
    scrollTo: true,
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Done',
      },
    ],
  },
  {
    id: 'limit',
    title: 'Learn more',
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        [...document.querySelector('.Exchange-swap-order-type-tabs').children].forEach((element,index) => {
          if(index == 1){
            element.classList.add('active')
          }else{
            element.classList.remove('active')
          }
        });

        resolve();
      });
    },
    text: `
    <div style="display: flex;justify-content: space-between;">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 16px;">
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Market</button>
        <button style="color: black; padding: 6px 30px; font-size: 20px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); box-shadow: 0px 0px 20.569976806640625px 0px #B8BBFF; background: #FFF;">Limit</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Trigger</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This is when you decide to buy or sell a cryptocurrency only at a specific price or better. It's like waiting for a toy to go on sale before you buy it.<br/></div>
            `,
    attachTo: { element: '.Exchange-swap-order-type-tabs', on: 'left' },
    scrollTo: true,
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Done',
      },
    ],
  },
  {
    id: 'trigger',
    title: 'Learn more',
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        [...document.querySelector('.Exchange-swap-order-type-tabs').children].forEach((element,index) => {
          if(index == 2){
            element.classList.add('active')
          }else{
            element.classList.remove('active')
          }
        });

        resolve();
      });
    },
    text: `
    <div style="display: flex;justify-content: space-between;">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 16px;">
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Market</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Limit</button>
        <button style="color: black; padding: 6px 30px; font-size: 20px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); box-shadow: 0px 0px 20.569976806640625px 0px #B8BBFF; background: #FFF;">Trigger</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This is a special type of order that starts as soon as a specific price is reached. It's like setting an alarm to remind you to buy a toy when its price drops to a certain point.
    <br/></div>
            `,
    attachTo: { element: '.Exchange-swap-order-type-tabs', on: 'left' },
    scrollTo: true,
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Done',
      },
    ],
  },
  {
    id: 'payExchange',
    title: 'Learn more',
    text: `

    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">Select the token through which you want to finance Long Position and enter the amount
    <br/></div>
            `,
    attachTo: { element: '.pay-exchange', on: 'left' },
    scrollTo: true,
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Done',
      },
    ],
  },
  {
    id: 'longExchange',
    title: 'step 5',
    text: `

    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">Select the token that you
    want to Long
    <br/></div>
            `,
    attachTo: { element: '.long-exchange', on: 'left' },
    scrollTo: true,
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Done',
      },
    ],
  },
  {
    id: 'leverageSlider',
    title: 'Choose the leverage',
    text: `
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word"> "Leverage" in trading is using borrowed funds to amplify your investment, potentially increasing both gains and losses. Be cautious, don’t use too much leverage. 
    <br/></div>
            `,
    attachTo: { element: '.App-slider', on: 'left' },
    scrollTo: true,
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Done',
      },
    ],
  },
  {
    id: 'leverageBtn',
    title: 'Enable Leverage',
    text: `
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">Click on Enable Leverage and Sign the transaction in wallet for Leverage to be enabled. This is a one-time process.
    <br/></div>
            `,
    attachTo: { element: '.leverage-btn', on: 'left' },
    scrollTo: true,
    buttons: [
      {
        type: 'back',
        classes: 'shepherd-button-secondary',
        text: 'Back',
      },
      {
        type: 'next',
        text: 'Done',
      },
    ],
  },
];

export default newSteps;
