'use client';
import React, { useState } from 'react';
import { Button, Box, Typography } from '@material-ui/core';
import StartIcon from 'assets/images/launchpad/faq/start-icon.svg';
import FeesIcon from 'assets/images/launchpad/faq/fees-eligibility-icon.svg';
import SecurityIcon from 'assets/images/launchpad/faq/security-icon.svg';
import TroubleIcon from 'assets/images/launchpad/faq/troubleshooting-icon.svg';
import { ChevronDown, ChevronUp } from 'react-feather';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQList {
  id: string;
  name: string;
  logo: string;
  faq: FAQItem[];
}

const FAQItem: React.FC<FAQItem & { isOpen: boolean; toggle: () => void }> = ({
  question,
  answer,
  isOpen,
  toggle,
}) => (
  <Box>
    <button className='faq-item-button' onClick={toggle}>
      <span className='text-base lg:text-lg leading-6 font-semibold'>
        {question}
      </span>
      <ChevronDown
        size='20'
        className={`down-icon ${isOpen && 'rotate-180'}`}
      />
      {/* <ChevronDownIcon
        className={clsx({
          ['min-w-5 h-5 p-[2px] lg:p-0 transition-transform duration-300']: true,
          ['rotate-180']: isOpen,
        })}
      /> */}
    </button>
    <Box
      className={`cover-faq-item ${
        isOpen ? 'faq-item-open' : 'faq-item-close'
      }`}
    >
      <Box style={{ padding: '16px' }}>
        <p
          style={{ color: '#D1D5DB' }}
          dangerouslySetInnerHTML={{ __html: answer }}
        ></p>
      </Box>
    </Box>
  </Box>
);

const FAQ: React.FC = () => {
  const faqList: FAQList[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      logo: StartIcon,
      faq: [
        {
          question: 'What is the QuickLaunch Launchpad?',
          answer:
            'This is a Web3 Launchpad by QuickSwap (powered by TrustSwap) that facilitates a token sale and helps blockchain-based projects raise capital.',
        },
        {
          question: 'What is the process for participating in a QuickLaunch?',
          answer:
            'The QuickLaunch Launchpad uses a Lottery system where a certain amount of whitelisted users are randomly selected to participate in a project launch.<br> There are three simple steps.<br> First, you sign into the dashboard and then KYC with our KYC provider. Once you are successfully KYC’d, you are eligible to participate in a QuickLaunch.<br> Next, you find a project you would like to participate in and register to be whitelisted for the project’s launch. This means you would like to enter in the lottery in order to win an allocation.<br> Then, once the lottery is run, if you are selected, you will receive a notification that you can contribute your allocated amount to the project via the dashboard.<br> When the project launch is completed, you will be notified via the dashboard about where and how to claim your tokens.',
        },
        {
          question:
            'Do I have to complete KYC to participate in a QuickLaunch?',
          answer:
            'Yes. KYC is required for all users participating in any project on QuickLaunch. Through a partnership with Blockpass, the KYC process has been simplified and allows you to register via the QuickLaunch dashboard.',
        },
        {
          question: 'What if I am already currently KYC’ed by BlockPass?',
          answer: `That makes the process easier. Connect to the QuickLaunch dashboard, register to KYC, and when prompted to start KYC, make sure you use the previously KYC’d email address.
You should see a prompt from BlockPass saying, “If you have previously created a Blockpass Identity, you should use that email address here.” Once you use your KYC’d email address, you will not need to repeat the KYC process.`,
        },
      ],
    },
    {
      id: 'fees-eligibility',
      name: 'Fees & Eligibility',
      logo: FeesIcon,
      faq: [
        {
          question: 'Is there a fee to participate in a QuickLaunch?',
          answer: `There are no fees to opt in and no token staking requirements.`,
        },
        {
          question: 'What crypto tokens can be used to participate in IDOs?',
          answer: `Stablecoins: USDT or USDC on Polygon.`,
        },
        {
          question: 'How can I increase my odds of winning the lottery?',
          answer: `This is a system-generated lottery that is automatically calculated.`,
        },
        {
          question: 'Is the QuickLaunch lottery provably fair?',
          answer: `The Lottery system works completely off-chain, shuffling the participants using the Fisher-Yates algorithm to randomise their order. It then selects the first maxWinners as the random winners. This is to ensure a fair and unbiased selection by leveraging Math.random() for randomness.`,
        },
      ],
    },
    {
      id: 'security',
      name: 'Security',
      logo: SecurityIcon,
      faq: [
        {
          question:
            'How can I verify that emails I receive from QuickLaunch are legitimate?',
          answer: `Emails are always sent from <b>no-reply@mail.quicklaunchpad.io</b>, and they will include your personal unique PIN number. The legitimacy of these emails is confirmed by both the sender’s address and the presence of your PIN. To ensure your safety, please do not engage with or provide any information in response to suspicious emails. Always double-check both the sender’s address and your PIN number to verify authenticity.`,
        },
        {
          question:
            'I received an email about QuickLaunch with a link. What should I do?',
          answer: `Except for verifying your email, links are never included in emails from QuickLaunch. This is to protect your security and prevent phishing attempts. If you are in doubt, please reach out to support/moderators on official social media channels. Always prioritise your online safety!`,
        },
        {
          question:
            'I received a DM (direct message) on Telegram claiming to be from QuickLaunch. How do I check if this is legitimate?',
          answer: `QuickLaunch support moderators <span class="border-b">never</span> initiate DMs (direct messages) on Telegram. If you receive a message from someone claiming to be from QuickLaunch, it is a scammer. Always use the official Telegram channel for support, and avoid engaging with any direct messages that are sent to you.`,
        },
        {
          question:
            'What is the PIN number in the emails I get from QuickLaunch?',
          answer: `The PIN number included in the emails you receive from QuickLaunch is a personal and unique identifier assigned to each registered user. This helps verify that the email is from us, not a scammer. If you ever receive an email without your unique PIN or notice any discrepancies, please reach out to our <a href="https://t.me/QuickLaunchOfficial" target="_blank" class="text-[#448AFF] leading-6 border-b border-[#448AFF]">Telegram support</a> team for assistance.`,
        },
      ],
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      logo: TroubleIcon,
      faq: [
        {
          question:
            'Why didn’t I receive an email announcing the new launchpad?',
          answer: `Connect your wallet and go to the profile page, then make sure that email notifications are enabled. If they are enabled and you still don't receive new announcement emails, please reach out on official social media channels for further assistance.`,
        },
        {
          question: 'How can I contact QuickLaunch for questions or issues?',
          answer: `You can contact QuickLaunch directly through the <a href="https://t.me/QuickLaunchOfficial"  target="_blank" class="text-[#448AFF] leading-6 border-b border-[#448AFF]">official Telegram channel</a>, where moderators will be available to assist you with any questions or issues you may have.`,
        },
      ],
    },
  ];

  const [openItems, setOpenItems] = useState<number[]>([]);
  const [tabActive, setTabActive] = useState<string>(faqList[0].id);
  const [clickedTab, setClickedTab] = useState<boolean>(false);

  const toggleItem = (index: number) => {
    setOpenItems((prevOpenItems) =>
      prevOpenItems.includes(index)
        ? prevOpenItems.filter((i) => i !== index)
        : [...prevOpenItems, index],
    );
    setClickedTab(true);
  };

  const handleSelectTab = (tabId: string) => {
    const element = document.getElementById('mobile-faq-list');
    if (element && clickedTab) {
      // Fix scrolling issue on mobile
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - 80;
      window.scrollTo({ top: offsetPosition });
    }
    setClickedTab(true);
    setOpenItems([]);
    setTabActive(tabId);
  };

  return (
    <Box className='faqSection'>
      <Box className='cover_title'>
        <Typography className='title2'>Frequently Asked Questions</Typography>
      </Box>
      <Box className='cover-faq'>
        <Box className='flex-40'>
          <Box className='cover-faq-list'>
            {faqList.map((faq) => (
              <Box
                className={`faq ${faq.id === tabActive && 'faq-selected'}`}
                key={faq.id}
                onClick={() => handleSelectTab(faq.id)}
              >
                <Box
                  className={`cover-img ${faq.id === tabActive &&
                    'cover-img-selected'}`}
                >
                  <img src={faq.logo} alt={faq.id} />
                </Box>
                <Box>
                  <Typography className='faq-name'>{faq.name}</Typography>
                </Box>
                {tabActive === faq.id && (
                  <svg
                    width='79'
                    height='14'
                    viewBox='0 0 79 14'
                    fill='none'
                    strokeWidth='1.5'
                    stroke='currentColor'
                    className='faq-arrow'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <g>
                      <path
                        d='M1 7H78M78 7L72 1M78 7L72 13'
                        stroke='#4d5d7994'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </g>
                  </svg>
                )}
              </Box>
            ))}
          </Box>
        </Box>
        <Box className='cover-faq-items'>
          {faqList
            .find((faq) => faq.id === tabActive)
            ?.faq?.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openItems.includes(index)}
                toggle={() => toggleItem(index)}
              />
            ))}
        </Box>
      </Box>
      <Box id='mobile-faq-list' className='cover-faq-mobile'>
        <Box className='cover-faq-list'>
          {faqList.map((faq) => (
            <Box key={faq.id}>
              <Box
                className={`faq ${faq.id === tabActive && 'faq-selected'}`}
                key={faq.id}
                onClick={() => handleSelectTab(faq.id)}
              >
                <Box
                  className={`cover-img ${faq.id === tabActive &&
                    'cover-img-selected'}`}
                >
                  <img src={faq.logo} alt={faq.id} />
                </Box>
                <Box>
                  <Typography className='faq-name'>{faq.name}</Typography>
                </Box>
                {tabActive === faq.id && (
                  <svg
                    width='79'
                    height='14'
                    viewBox='0 0 79 14'
                    fill='none'
                    strokeWidth='1.5'
                    stroke='currentColor'
                    className='faq-arrow'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <g>
                      <path
                        d='M1 7H78M78 7L72 1M78 7L72 13'
                        stroke='#4d5d7994'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </g>
                  </svg>
                )}
              </Box>
              {tabActive === faq.id && (
                <Box className='cover-faq-items'>
                  {faq.faq.map((item, index) => (
                    <FAQItem
                      key={index}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openItems.includes(index)}
                      toggle={() => toggleItem(index)}
                    />
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FAQ;
