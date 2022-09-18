function getNetworkOnline() {
  return navigator.onLine;
}

export const useInternet = () => {
  return getNetworkOnline();
};
