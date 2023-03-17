import { useEffect } from 'react';
import ReactGA from 'react-ga';
import { useRouter } from 'next/router';

// fires a GA pageview every time the route changes
export default function GoogleAnalyticsReporter(): null {
  const { asPath } = useRouter();
  useEffect(() => {
    ReactGA.pageview(asPath);
  }, [asPath]);
  return null;
}
