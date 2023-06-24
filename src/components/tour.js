import React from 'react';
import { ShepherdTour } from 'react-shepherd';
import newSteps from './steps';

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};



const Tour = ({ children }) => {
  return (
     <ShepherdTour steps={newSteps} tourOptions={tourOptions}>
         {children}
      </ShepherdTour>
  );
};

export default Tour;
