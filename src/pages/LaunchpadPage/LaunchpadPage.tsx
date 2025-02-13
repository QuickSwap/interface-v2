import React, { useState } from 'react';
import HeroSection from 'pages/LaunchpadPage/HeroSection';
import StepsToJoin from 'pages/LaunchpadPage/StepsToJoin';
import JoinSocialMedia from 'pages/LaunchpadPage/JoinSocialMedia';

import 'pages/styles/launchpad.scss';

const LaunchpadPage: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
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
    </div>
  );
};

export default LaunchpadPage;
