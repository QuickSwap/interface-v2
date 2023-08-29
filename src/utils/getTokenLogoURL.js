export const getTokenLogoURL = (address) => {
  const logoExtensions = ['.png', '.webp', '.jpeg', '.jpg', '.svg'];
  return logoExtensions.map((ext) => {
    try {
      const image = `/assets/tokenLogo/${address.toLowerCase()}${ext}`;
      return image;
    } catch (e) {
      return 'error';
    }
  });
};
