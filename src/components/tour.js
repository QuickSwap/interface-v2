import React, { useContext, useEffect, useRef } from "react";
import { ShepherdTour, ShepherdTourContext } from "react-shepherd";
import newSteps from "./steps";
import { useUIContext } from "../providers/InterfaceProvider";

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};

function InnerTour({ children }) {
  const tour = useContext(ShepherdTourContext);

  useEffect(() => {
    if (tour) {
      // Show tour on load only if user hasn't viewed it before
      if (localStorage.getItem("viewed_tour") !== "true") {
        tour.start();
        // localStorage.setItem("viewed_tour", "true") // Commented for Testing
      }
    }
  }, [tour]);

  return children;
}

const Tour = ({ children }) => {
  const { setWalletModalVisible } = useUIContext();

  const steps = useRef(newSteps);

  steps.current[0].beforeShowPromise = () => {
    setWalletModalVisible(false);
  };
  steps.current[1].beforeShowPromise = () => {
    setWalletModalVisible(true);
  };
  steps.current[2].beforeShowPromise = () => {
    setWalletModalVisible(false);
  };

  return (
    <ShepherdTour steps={steps.current} tourOptions={tourOptions}>
      <InnerTour>{children}</InnerTour>
    </ShepherdTour>
  );
};

export default Tour;
