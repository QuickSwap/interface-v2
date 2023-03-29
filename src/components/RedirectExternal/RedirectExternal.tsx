import React from 'react';
import { useHistory } from 'react-router-dom';

export const RedirectExternal = ({
  to,
  target = '_blank',
}: {
  to: string;
  target?: string;
}) => {
  const history = useHistory();

  React.useEffect(() => {
    // use timeout to move back navigation to end of event queue
    if (target == '_top') {
      window.location.replace(to);
      return;
    }

    window.open(to, target, 'noreferrer');
    setTimeout(history.goBack);
  }, [history, to, target]);

  return null;
};
