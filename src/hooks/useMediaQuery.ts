import useDeviceWidth from './useDeviceWidth';

export const useIsXS = () => {
  const deviceWidth = useDeviceWidth();
  return deviceWidth < 700;
};

export const useIsSM = () => {
  const deviceWidth = useDeviceWidth();
  return deviceWidth < 960;
};

export const useIsMD = () => {
  const deviceWidth = useDeviceWidth();
  return deviceWidth < 1280;
};

export const useIsLG = () => {
  const deviceWidth = useDeviceWidth();
  return deviceWidth < 1920;
};
