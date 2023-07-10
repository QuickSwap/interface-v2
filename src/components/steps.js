const newSteps = [
  {
    id: "welcome",
    title: `Step 1`,
    text: [
      `
      <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word">Connect your web3 wallet</div>
      <div style="margin-top: 1rem;width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">A non-custodial web3 wallet serves as a gateway to use dApps. It is your web3 identity, pro tip: never share your private keys.</div>
        `,
    ],
    attachTo: { element: ".App-header-user", on: "bottom" },
    classes: "shepherd shepherd-welcome",
    buttons: [
      {
        type: "cancel",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Skip</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "installation",
    title: `
    Step 2
    `,
    text: `
      <div style="color: #061341; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word">Select a wallet</div>
      <div style="margin-top: 1rem;width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">Choose any of the shown non-custodial web3 wallets. Make sure you have it installed in your browser. Alternatively you can also scan QR code and connect via wallet connect supported wallets. </div>
      `,
    attachTo: { element: ".Modal-content", on: "right" },
    buttons: [
      {
        type: "cancel",
        text: `

            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word; float: left">Skip</div>

        `,
      },
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "long",
    classes: "shepherd-expanded",
    title: "Step 3",
    text: `
    <div style="display: flex; justify-content: space-between; align-items: center">
      <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
      <div style="margin: 10px 0;display: flex; align-items: center; gap: 10px; font-size: 12px;">
          <button class="tour-selected-tab">Long</button>
          <button class="tour-tab">Short</button>
          <button class="tour-tab">Swap</button>
      </div>
    </div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This means you buy a cryptocurrency, like Bitcoin, because you believe its price will increase in the future. You're planning to "go long," or profit from an increase in its price.<br/></div>
            `,
    attachTo: { element: ".tradePage", on: "left" },
    buttons: [
      {
        type: "cancel",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Skip</div>
            </div>
        `,
      },
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "short",
    title: "Step 3",
    classes: "shepherd-expanded",
    attachTo: { element: ".tradePage", on: "left" },
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        [...document.querySelector(".tradePage").children].forEach((element, index) => {
          if (index == 1) {
            element.classList.add("active");
          } else {
            element.classList.remove("active");
          }
        });

        resolve();
      });
    },
    text: `
    <div style="display: flex; justify-content: space-between; align-items: center">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="    margin: 10px 0;display: flex; align-items: center; gap: 10px; font-size: 12px;">
        <button class="tour-tab">Long</button>
        <button class="tour-selected-tab"">Short</button>
        <button class="tour-tab">Swap</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This means you're betting that the price of a cryptocurrency will fall. In this situation, you'd "short" a token, planning to profit from a decrease in its price.
    <br/></div>
            `,
    buttons: [
      {
        type: "cancel",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Skip</div>
            </div>
        `,
      },
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "swap",
    title: "Step 3",
    classes: "shepherd-expanded",
    attachTo: { element: ".tradePage", on: "left" },
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        [...document.querySelector(".tradePage").children].forEach((element, index) => {
          if (index == 2) {
            element.classList.add("active");
          } else {
            element.classList.remove("active");
          }
        });

        resolve();
      });
    },
    text: `
    <div style="display: flex; justify-content: space-between; align-items: center">
    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="    margin: 10px 0;display: flex; align-items: center; gap: 10px; font-size: 12px;">
        <button class="tour-tab">Long</button>
        <button class="tour-tab">Short</button>
        <button class="tour-selected-tab">Swap</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This means the direct exchange of one type of cryptocurrency for another.    <br/></div>
            `,
    scrollTo: true,
    buttons: [
      {
        type: "cancel",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Skip</div>
            </div>
        `,
      },
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "market",
    title: "Learn more",
    classes: "shepherd-expanded",
    text: `
    <div style="display: flex; justify-content: space-between; align-items: center">

    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="margin: 10px 0;display: flex; align-items: center; gap: 10px; font-size: 12px;">
        <button class="tour-selected-tab">Market</button>
        <button class="tour-tab">Limit</button>
        <button class="tour-tab">Trigger</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This is when you buy or sell a cryptocurrency immediately at the best available price in the market. It's like buying a toy at the price it's currently being sold for.<br/></div>
            `,
    attachTo: { element: ".Exchange-swap-order-type-tabs", on: "left" },
    scrollTo: true,
    buttons: [
      {
        type: "cancel",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Skip</div>
            </div>
        `,
      },
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "limit",
    title: "Learn more",
    classes: "shepherd-expanded",
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        [...document.querySelector(".Exchange-swap-order-type-tabs").children].forEach((element, index) => {
          if (index == 1) {
            element.classList.add("active");
          } else {
            element.classList.remove("active");
          }
        });

        resolve();
      });
    },
    text: `
    <div style="display: flex; justify-content: space-between; align-items: center">

    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="margin: 10px 0;display: flex; align-items: center; gap: 10px; font-size: 12px;">
        <button class="tour-tab">Market</button>
        <button class="tour-selected-tab">Limit</button>
        <button class="tour-tab">Trigger</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This is when you decide to buy or sell a cryptocurrency only at a specific price or better. It's like waiting for a toy to go on sale before you buy it.<br/></div>
            `,
    attachTo: { element: ".Exchange-swap-order-type-tabs", on: "left" },
    scrollTo: true,
    buttons: [
      {
        type: "cancel",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Skip</div>
            </div>
        `,
      },
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "trigger",
    title: "Learn more",
    classes: "shepherd-expanded",
    beforeShowPromise: function () {
      return new Promise(function (resolve) {
        [...document.querySelector(".Exchange-swap-order-type-tabs").children].forEach((element, index) => {
          if (index == 2) {
            element.classList.add("active");
          } else {
            element.classList.remove("active");
          }
        });

        resolve();
      });
    },
    text: `
    <div style="display: flex; justify-content: space-between; align-items: center">

    <div style="color: #213062; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word;white-space: nowrap">Choose from </div>
    <div style="margin: 10px 0;display: flex; align-items: center; gap: 10px; font-size: 12px;">
        <button class="tour-tab">Market</button>
        <button class="tour-tab">Limit</button>
        <button class="tour-selected-tab">Trigger</button>
    </div>
</div>
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">This is a special type of order that starts as soon as a specific price is reached. It's like setting an alarm to remind you to buy a toy when its price drops to a certain point.
    <br/></div>
            `,
    attachTo: { element: ".Exchange-swap-order-type-tabs", on: "left" },
    scrollTo: true,
    buttons: [
      {
        type: "cancel",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Skip</div>
            </div>
        `,
      },
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "payExchange",
    title: "Learn more",
    text: `

    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">Select the token through which you want to finance Long Position and enter the amount
    <br/></div>
            `,
    attachTo: { element: ".pay-exchange", on: "left" },
    scrollTo: true,
    buttons: [
      {
        type: "cancel",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Skip</div>
            </div>
        `,
      },
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "longExchange",
    title: "Step 5",
    text: `

    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">Select the token that you
    want to Long
    <br/></div>
            `,
    attachTo: { element: ".long-exchange", on: "left" },
    scrollTo: true,
    buttons: [
      {
        type: "cancel",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Skip</div>
            </div>
        `,
      },
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "next",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
        <div style="width: 100%; height: 100%; position: relative">
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
    </div>
        `,
      },
    ],
  },
  {
    id: "leverageSlider",
    title: "Choose the leverage",
    text: `
    </div>
    <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word"> "Leverage" in trading is using borrowed funds to amplify your investment, potentially increasing both gains and losses. Be cautious, don’t use too much leverage. 
    <br/></div>
            `,
    attachTo: { element: ".App-slider", on: "left" },
    scrollTo: true,
    buttons: [
      {
        type: "back",
        text: `
        <div style="
        display: flex;
        align-items: center;">
            <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
            </div>
        `,
      },
      {
        type: "cancel",
        text: `
        <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
        <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Done</div>
        <div style="width: 100%; height: 100%; position: relative">    
    </div>
        `,
      },
    ],
  },
  // {
  //   id: 'leverageBtn',
  //   title: 'Enable Leverage',
  //   text: `
  //   </div>
  //   <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">Click on Enable Leverage and Sign the transaction in wallet for Leverage to be enabled. This is a one-time process.
  //   <br/></div>
  //           `,
  //   attachTo: { element: '.leverage-btn', on: 'left' },
  //   scrollTo: true,
  //    buttons: [
  //     {
  //       type: 'close',
  //       text: `
  //       <div style="
  //       display: flex;
  //       align-items: center;">
  //           <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  //           <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  //           </svg>
  //           <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Close</div>
  //           </div>
  //       `,
  //     },
  //     {
  //       type: 'next',
  //       text: `
  //       <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
  //       <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
  //       <div style="width: 100%; height: 100%; position: relative">
  //       <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //       </svg>

  //   </div>
  //       `,
  //     },
  //   ],
  // },
  //   {
  //     id: 'usage',
  //     title: 'Usage',
  //     beforeShowPromise: function () {
  //       return new Promise(function (resolve) {
  //         if (document.querySelector('.leverage-btn').innerText.indexOf("Long") !== -1) {
  //           resolve();
  //         }
  //       });
  //     },
  //     text: `
  //     </div>
  //     <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">
  //     Click on Long ETH.<br/></div>
  //             `,
  //     attachTo: { element: '.leverage-btn', on: 'left' },
  //     buttons: [
  //       {
  //         type: 'back',
  //         text: `
  //         <div style="
  //         display: flex;
  //         align-items: center;">
  //             <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  //             <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  //             </svg>
  //             <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
  //             </div>
  //         `,
  //       },
  //       {
  //         type: 'next',
  //         text: `
  //         <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
  //         <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
  //         <div style="width: 100%; height: 100%; position: relative">
  //         <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //         </svg>

  //     </div>
  //         `,
  //       },
  //     ],
  //   },
  //   {
  //     id: 'usage',
  //     title: 'Usage',
  //     text: `
  //     <div>
  //     <div style="color: #061341; font-size: 28px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word">Check the paperwork<br/>to Long</div>
  //     <div style="width: 100%"><span
  //     style="color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 700; line-height: 24px; word-wrap: break-word">Leverage:
  // </span><span
  //     style="color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">Shows
  //     your chosen leverage<br /></span><span
  //     style="color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 700; line-height: 24px; word-wrap: break-word">Entry
  //     Price: </span><span
  //     style="color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">The
  //     price at which the trade will initiate<br /></span><span
  //     style="color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 700; line-height: 24px; word-wrap: break-word">Liquidity
  //     Price:</span><span
  //     style="color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">
  //     If the token price reaches here, you will lose all the tokens.<br /></span><span
  //     style="color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 700; line-height: 24px; word-wrap: break-word">Fees:
  // </span><span
  //     style="color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">The
  //     fees you are paying to execute the trade.<br /></span><span
  //     style="color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word"><br />Click
  //     on Long and sign the transaction to initiate the Long trade.</span>
  // </div>
  // </div>
  //             `,
  //     attachTo: { element: '.Modal-content', on: 'right' },
  //     buttons: [
  //       {
  //         type: 'back',
  //         text: `
  //         <div style="
  //         display: flex;
  //         align-items: center;">
  //             <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  //             <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  //             </svg>
  //             <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
  //             </div>
  //         `,
  //       },
  //       {
  //         type: 'next',
  //         text: `
  //         <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
  //         <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
  //         <div style="width: 100%; height: 100%; position: relative">
  //         <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //         </svg>

  //     </div>
  //         `,
  //       },
  //     ],
  //   },
  // {
  //   id: 'position',
  //   title: 'Step 11',
  //   text: `
  //   <div><span style="color: #213062; font-size: 10px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word"><br/></span><span style="color: #213062; font-size: 25px; font-family: Space Grotesk; font-weight: 700; word-wrap: break-word">You can track your position<br/>here.</span></div>
  //           `,
  //   attachTo: { element: '.Exchange-list-header', on: 'top' },
  //   buttons: [
  //     {
  //       type: 'back',
  //       text: `
  //       <div style="
  //       display: flex;
  //       align-items: center;">
  //           <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  //           <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  //           </svg>
  //           <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
  //           </div>
  //       `,
  //     },
  //     {
  //       type: 'next',
  //       text: `
  //       <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
  //       <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
  //       <div style="width: 100%; height: 100%; position: relative">
  //       <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //       </svg>

  //   </div>
  //       `,
  //     },
  //   ],
  // },
  // {
  //   id: 'positionClose',
  //   title: 'Step 11',
  //   text: `
  //   <div style="width: 100%; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 400; line-height: 24px; word-wrap: break-word">You can either close an order on market price or set a trigger to automatically close the order. </div>
  //            `,
  //   attachTo: { element: '.close-action', on: 'top' },
  //   buttons: [
  //     {
  //       type: 'back',
  //       text: `
  //       <div style="
  //       display: flex;
  //       align-items: center;">
  //           <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  //           <path d="M11.667 5.99972L1.00033 5.99971M1.00033 5.99971L5.66699 10.6664M1.00033 5.99971L5.66699 1.33305" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
  //           </svg>
  //           <div style="color: black;font-size: 16px;font-family: Space Grotesk;font-weight: 500;word-wrap: break-word;margin-left: 8px;">Prev</div>
  //           </div>
  //       `,
  //     },
  //     {
  //       type: 'next',
  //       text: `
  //       <div style="width: 100%; height: 100%; padding-left: 25px; padding-right: 25px; padding-top: 12px; padding-bottom: 12px; background: white; box-shadow: 0px 0px 20px rgba(255, 0, 255, 0.20); border-radius: 8px; border-left: 0.50px rgba(0, 0, 0, 0.10) solid; border-top: 0.50px rgba(0, 0, 0, 0.10) solid; border-right: 0.50px rgba(0, 0, 0, 0.10) solid; border-bottom: 0.50px rgba(0, 0, 0, 0.10) solid; justify-content: center; align-items: center; display: inline-flex">
  //       <div style="color: black; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">Next</div>
  //       <div style="width: 100%; height: 100%; position: relative">
  //       <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  //       <path d="M3.16699 7.99967H13.8337M9.16699 3.33301L13.8337 7.99967L9.16699 12.6663" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //       </svg>

  //   </div>
  //       `,
  //     },
  //   ],
  // },
];

export default newSteps;
