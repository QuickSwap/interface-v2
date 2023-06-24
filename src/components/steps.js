
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
    <div style="display: flex;">
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
    id: 'centered-example',
    title: 'Centered Shepherd Element',
    text: `
    <div style="display: flex;">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 16px;">
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Long</button>
        <button style="color: black; padding: 6px 30px; font-size: 20px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); box-shadow: 0px 0px 20.569976806640625px 0px #B8BBFF; background: #FFF;"">Short</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Swap</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This means you buy a cryptocurrency, like Bitcoin, because you believe its price will increase in the future. You're planning to "go long," or profit from an increase in its price.<br/></div>
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
    id: 'followup',
    title: 'Learn more',
    text: `
    <div style="display: flex;">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="display: flex; align-items: center; gap: 10px; font-size: 16px;">
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Long</button>
        <button style="color: #0000005f; padding: 6px 22px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); background: #FFF; box-shadow: 0px 0px 17px 0px #B8BBFF;">Short</button>
        <button style="color: black; padding: 6px 30px; font-size: 20px; border-radius: 9.68px; border: 1.21px solid rgba(0, 0, 0, 0.10); box-shadow: 0px 0px 20.569976806640625px 0px #B8BBFF; background: #FFF;">Swap</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This means you buy a cryptocurrency, like Bitcoin, because you believe its price will increase in the future. You're planning to "go long," or profit from an increase in its price.<br/></div>
            `,
    attachTo: { element: '.hero-followup', on: 'top' },
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
