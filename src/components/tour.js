import React, { useContext, useEffect, useRef } from "react";
import { ShepherdTour, ShepherdTourContext } from "react-shepherd";
import newSteps from "./steps";
import { useUIContext } from "../providers/InterfaceProvider";

import "../Tour.css";

const tourOptions = {
  defaultStepOptions: {
    classes: "shepherd-custom",
    cancelIcon: {
      enabled: true,
    },
    scrollTo:true,
  },
  useModalOverlay: true,
};

function InnerTour({ children }) {
  const tour = useContext(ShepherdTourContext);
  const { currentTour } = useUIContext();
  function startTour() {
    if (tour) {
      // Show tour on load only if user hasn't viewed it before
      if (localStorage.getItem("viewed_tour") !== "true") {
        currentTour.current = tour;
        tour.start();
        tour.on('complete', () => {
          // document.body.style.overflow = '';
          localStorage.setItem("viewed_tour", "true")
        });
      }
    }
  }

  useEffect(() => {
    startTour();
  }, [tour]);

  return children;
}

const Tour = ({ children }) => {
  const { setWalletModalVisible } = useUIContext();

  const steps = useRef(newSteps);
  const isSet = useRef(false);

  function callOnce() {
    if (isSet.current) return;

    steps.current[0].beforeShowPromise = () => {
      setWalletModalVisible(false);
    };
    steps.current[1].beforeShowPromise = () => {
      setWalletModalVisible(true);
    };
    steps.current[2].beforeShowPromise = () => {
      setWalletModalVisible(false);
    };

    steps.current = steps.current.map((step) => {
      if (step.title.length < 30) {
        return {
          ...step,
          title: `
            <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; width: 100%">
              <div style="opacity: 0.60; color: #213062; font-size: 16px; font-family: Space Grotesk; font-weight: 500; word-wrap: break-word">${step.title}</div>
              <img src="/BuildoorBranding.png" width="150" />
            </div>
        `,
        };
      }
      return step;
    });

    isSet.current = true;
  }

  callOnce();

  return (
    <ShepherdTour steps={steps.current} tourOptions={tourOptions}>
      <InnerTour>{children}</InnerTour>
    </ShepherdTour>
  );
};

export default Tour;
