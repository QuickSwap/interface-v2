import React, { useState } from 'react';
import HeroSection from 'pages/LaunchpadPage/HeroSection';
import StepsToJoin from 'pages/LaunchpadPage/StepsToJoin';
import JoinSocialMedia from 'pages/LaunchpadPage/JoinSocialMedia';
import CTA from 'pages/LaunchpadPage/CTA';
import FAQ from 'pages/LaunchpadPage/FAQ';
import SignUpModal from 'pages/LaunchpadPage/SignUpModal';

import 'pages/styles/launchpad.scss';

const LaunchpadPage: React.FC = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  return (
    <div className='container mx-auto'>
      <HeroSection
        caseLaunch={0}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
      <StepsToJoin
        caseLaunch={0}
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
      <JoinSocialMedia />
      <FAQ />
      <CTA />
      <SignUpModal openModal={openModal} setOpenModal={setOpenModal} />
    </div>
  );
};

export default LaunchpadPage;
