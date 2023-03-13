import React from 'react';
import { useHistory } from 'react-router-dom';

export const RedirectExternal = ({ to }: { to: string }) => {
  const history = useHistory();

  React.useEffect(() => {
    window.open(to, '_blank', 'noreferrer');
    // use timeout to move back navigation to end of event queue
    setTimeout(history.goBack);
  }, [history, to]);

  return null;
};
